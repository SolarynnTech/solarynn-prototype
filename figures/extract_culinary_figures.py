import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_culinary_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for culinary and hospitality public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for culinary and hospitality figures
    query = f"""
    SELECT DISTINCT ?person ?personLabel 
    WHERE {{
      # Find culinary and hospitality figures with broader definition
      {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q3499072.  # occupation: chef
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q2095549.  # occupation: cook
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q15709642.  # occupation: restaurateur
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q639669.  # occupation: TV chef
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q1622272.  # occupation: hotelier
        ?person wdt:P106/wdt:P279* wd:Q28114532.  # occupation: hospitality industry
      }} UNION {{
        ?person wdt:P1830 ?restaurant.  # owner of
        ?restaurant wdt:P31/wdt:P279* wd:Q11707.  # instance of restaurant
      }} UNION {{
        ?person wdt:P166 ?award.
        ?award wdt:P31/wdt:P279* wd:Q1364556.  # culinary award
      }}
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT {limit}
    OFFSET {offset}
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    try:
        results = sparql.query().convert()
        return results["results"]["bindings"]
    except Exception as e:
        print(f"Error querying Wikidata: {e}")
        # Sleep and retry with smaller limit if we get a timeout
        if "timeout" in str(e).lower() or "500" in str(e):
            print(f"Timeout error. Reducing batch size and retrying...")
            time.sleep(3)
            if limit > 20:
                return query_wikidata_culinary_figures(limit // 2, offset, user_agent)
        return []

def get_culinary_details(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get restaurant, Michelin stars, and signature dish for a specific culinary figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?restaurantLabel ?starsLabel ?signatureDishLabel
    WHERE {{
      # Restaurants (owned or worked at)
      OPTIONAL {{
        {{
          wd:{person_id} wdt:P1830 ?restaurant.  # owner of
          ?restaurant wdt:P31/wdt:P279* wd:Q11707.  # instance of restaurant
        }} UNION {{
          wd:{person_id} wdt:P108 ?restaurant.  # employer
          ?restaurant wdt:P31/wdt:P279* wd:Q11707.  # instance of restaurant
        }} UNION {{
          wd:{person_id} wdt:P937 ?restaurant.  # work location
          ?restaurant wdt:P31/wdt:P279* wd:Q11707.  # instance of restaurant
        }}
      }}
      
      # Michelin Stars
      OPTIONAL {{
        {{
          wd:{person_id} wdt:P166 ?stars.  # award received
          ?stars wdt:P31/wdt:P279* wd:Q23009459.  # Michelin star
        }} UNION {{
          ?restaurant wdt:P1830 wd:{person_id}.  # restaurant owned by person
          ?restaurant wdt:P166 ?stars.  # award received by restaurant
          ?stars wdt:P31/wdt:P279* wd:Q23009459.  # Michelin star
        }}
      }}
      
      # Signature Dish
      OPTIONAL {{
        {{
          wd:{person_id} wdt:P800 ?signatureDish.  # notable work
          ?signatureDish wdt:P31/wdt:P279* wd:Q746549.  # instance of dish
        }} UNION {{
          wd:{person_id} wdt:P2860 ?signatureDish.  # citation
          ?signatureDish wdt:P31/wdt:P279* wd:Q746549.  # instance of dish
        }}
      }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            restaurants = []
            michelin_stars = []
            signature_dishes = []
            
            for result in results["results"]["bindings"]:
                restaurant = result.get("restaurantLabel", {}).get("value", "")
                if restaurant and restaurant not in restaurants:
                    restaurants.append(restaurant)
                
                stars = result.get("starsLabel", {}).get("value", "")
                if stars and stars not in michelin_stars:
                    michelin_stars.append(stars)
                
                signature_dish = result.get("signatureDishLabel", {}).get("value", "")
                if signature_dish and signature_dish not in signature_dishes:
                    signature_dishes.append(signature_dish)
            
            return restaurants, michelin_stars, signature_dishes
        
        except Exception as e:
            print(f"Error getting culinary details for {person_id}: {e}")
            time.sleep(2)
    
    return [], [], []

def process_results(results):
    """
    Process the query results into a structured format
    """
    processed_data = []
    
    for result in results:
        person_uri = result.get("person", {}).get("value", "")
        if not person_uri:
            continue
            
        person_id = person_uri.split("/")[-1]
        
        person_data = {
            "id": person_id,
            "name": result.get("personLabel", {}).get("value", "Unknown"),
            "restaurants": [],  # Will be populated separately
            "michelin_stars": [],  # Will be populated separately
            "signature_dishes": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting culinary figures data from Wikidata...")
    
    try:
        for batch_num in range(start_batch, max_batches):
            offset = batch_num * batch_size
            print(f"Retrieving batch {batch_num+1}/{max_batches} (offset {offset})...")
            
            # Exponential back-off for batch retrieval
            max_retries = 5
            retry_count = 0
            base_wait_time = 2
            
            while retry_count < max_retries:
                try:
                    batch = query_wikidata_culinary_figures(batch_size, offset, user_agent)
                    if not batch:
                        print("No more results or error occurred. Stopping.")
                        break
                    break  # Success, exit retry loop
                except Exception as e:
                    retry_count += 1
                    if retry_count >= max_retries:
                        print(f"Failed to retrieve batch after {max_retries} attempts. Skipping.")
                        batch = []
                        break
                    
                    wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                    print(f"Error retrieving batch: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                    time.sleep(wait_time)
            
            if not batch:
                continue
                
            processed_batch = process_results(batch)
            
            for i, culinary_figure in enumerate(processed_batch):
                print(f"  Getting data for {culinary_figure['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get culinary details
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        restaurants, michelin_stars, signature_dishes = get_culinary_details(culinary_figure["id"], user_agent=user_agent)
                        processed_batch[i]["restaurants"] = restaurants
                        processed_batch[i]["michelin_stars"] = michelin_stars
                        processed_batch[i]["signature_dishes"] = signature_dishes
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve culinary details after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving culinary details: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between culinary figures
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total culinary figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "culinary_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['restaurants'] = df_for_csv['restaurants'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['michelin_stars'] = df_for_csv['michelin_stars'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['signature_dishes'] = df_for_csv['signature_dishes'].apply(lambda x: ', '.join(x) if x else '')
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "culinary_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total culinary figures: {len(all_data)}")
        
        # Count figures with restaurant info
        figures_with_restaurant = sum(1 for figure in all_data if figure['restaurants'])
        print(f"Figures with restaurant info: {figures_with_restaurant}")
        
        # Count figures with Michelin star info
        figures_with_stars = sum(1 for figure in all_data if figure['michelin_stars'])
        print(f"Figures with Michelin star info: {figures_with_stars}")
        
        # Count figures with signature dish info
        figures_with_dishes = sum(1 for figure in all_data if figure['signature_dishes'])
        print(f"Figures with signature dish info: {figures_with_dishes}")
        
        # Sample of culinary figures
        print("\nSample data (first 3 culinary figures):")
        for i, figure in enumerate(all_data[:3]):
            print(f"\n{i+1}. {figure['name']} ({figure['id']})")
            
            if figure['restaurants']:
                print(f"   Restaurant(s):")
                for restaurant in figure['restaurants'][:5]:
                    print(f"      - {restaurant}")
                if len(figure['restaurants']) > 5:
                    print(f"      - ... and {len(figure['restaurants']) - 5} more")
            
            if figure['michelin_stars']:
                print(f"   Michelin Stars:")
                for stars in figure['michelin_stars'][:5]:
                    print(f"      - {stars}")
                if len(figure['michelin_stars']) > 5:
                    print(f"      - ... and {len(figure['michelin_stars']) - 5} more")
            
            if figure['signature_dishes']:
                print(f"   Signature Dishes:")
                for dish in figure['signature_dishes'][:5]:
                    print(f"      - {dish}")
                if len(figure['signature_dishes']) > 5:
                    print(f"      - ... and {len(figure['signature_dishes']) - 5} more dishes")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['restaurants'] = df_for_csv['restaurants'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['michelin_stars'] = df_for_csv['michelin_stars'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['signature_dishes'] = df_for_csv['signature_dishes'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv.to_csv("partial_culinary_figures_data.csv", index=False)
            with open("partial_culinary_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} culinary figures)")
    
    except Exception as e:
        print(f"An error occurred: {e}")
        if all_data:
            print(f"Attempting to save {len(all_data)} records collected so far...")
            try:
                # Save emergency backup
                with open("emergency_backup.json", 'w', encoding='utf-8') as f:
                    json.dump(all_data, f, ensure_ascii=False, indent=2)
                print("Emergency backup saved to emergency_backup.json")
            except:
                print("Failed to save emergency backup.")
    return all_data

if __name__ == "__main__":
    main(max_batches=8, batch_size=100, start_batch=0) 