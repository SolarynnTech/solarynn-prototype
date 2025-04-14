import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_visual_arts_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for visual arts and design figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for visual arts and design figures
    query = f"""
    SELECT ?person ?personLabel 
    WHERE {{
      VALUES ?occupation {{
        wd:Q1028181  # painter
        wd:Q1281618  # sculptor
        wd:Q33231    # photographer
        wd:Q627325   # graphic designer
        wd:Q266569   # illustrator
        wd:Q1114448  # cartoonist
        wd:Q1925963  # graphic artist
        wd:Q1028181  # painter
        wd:Q644687   # illustrator
        wd:Q15296811 # fine art photographer
        wd:Q17505902 # installation artist
        wd:Q1281618  # sculptor
        wd:Q1792450  # street artist
        wd:Q715301   # ceramist
        wd:Q15472169 # visual artist
        wd:Q1028181  # painter
      }}
      ?person wdt:P106 ?occupation. # occupation
      
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
                return query_wikidata_visual_arts_figures(limit // 2, offset, user_agent)
        return []

def get_medium_data(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get information about artistic mediums used by the artist
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT DISTINCT ?mediumLabel
    WHERE {{
      # Find works by the artist
      ?work wdt:P170 wd:{person_id}. # creator
      
      # Get the medium of the work
      ?work wdt:P186 ?medium. # material used
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 30
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            medium_data = []
            
            for result in results["results"]["bindings"]:
                medium_name = result.get("mediumLabel", {}).get("value", "")
                
                if medium_name and medium_name not in medium_data:
                    medium_data.append(medium_name)
            
            return medium_data
        
        except Exception as e:
            print(f"Error getting medium data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_style_data(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get information about the artistic style/movement of the artist
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT DISTINCT ?styleLabel
    WHERE {{
      # Artist's style (direct)
      {{
        wd:{person_id} wdt:P135 ?style. # movement or style
      }}
      UNION
      {{
        # Style through their works
        ?work wdt:P170 wd:{person_id}. # creator
        ?work wdt:P135 ?style. # movement or style
      }}
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 20
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            style_data = []
            
            for result in results["results"]["bindings"]:
                style_name = result.get("styleLabel", {}).get("value", "")
                
                if style_name and style_name not in style_data:
                    style_data.append(style_name)
            
            return style_data
        
        except Exception as e:
            print(f"Error getting style data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_gallery_exhibit_data(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get information about galleries and exhibitions of the artist's work
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT DISTINCT ?galleryLabel ?exhibitLabel ?dateLabel
    WHERE {{
      {{
        # Collections containing the artist's work
        ?work wdt:P170 wd:{person_id}. # creator
        ?work wdt:P195 ?gallery. # collection
      }}
      UNION
      {{
        # Exhibitions where the artist's work was shown
        ?exhibit wdt:P4132 wd:{person_id}. # participant
        OPTIONAL {{ ?exhibit wdt:P585 ?date. }} # date
      }}
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 50
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            gallery_data = []
            
            # Process galleries
            galleries = set()
            exhibits = set()
            
            for result in results["results"]["bindings"]:
                gallery_name = result.get("galleryLabel", {}).get("value", "")
                exhibit_name = result.get("exhibitLabel", {}).get("value", "")
                date = result.get("dateLabel", {}).get("value", "")
                
                if gallery_name and gallery_name not in galleries:
                    gallery_data.append({
                        "type": "gallery",
                        "name": gallery_name
                    })
                    galleries.add(gallery_name)
                
                if exhibit_name and exhibit_name not in exhibits:
                    gallery_data.append({
                        "type": "exhibit",
                        "name": exhibit_name,
                        "date": date
                    })
                    exhibits.add(exhibit_name)
            
            return gallery_data
        
        except Exception as e:
            print(f"Error getting gallery/exhibit data for {person_id}: {e}")
            time.sleep(2)
    
    return []

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
            "medium": [],
            "style": [],
            "gallery_exhibit": []
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main():
    # Configure parameters
    batch_size = 100
    start_batch = 0
    max_batches = 10
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting visual arts and design figures data from Wikidata...")
    
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
                    batch = query_wikidata_visual_arts_figures(batch_size, offset, user_agent)
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
            
            for i, person in enumerate(processed_batch):
                print(f"  Getting additional data for {person['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get medium data
                retry_count = 0
                base_wait_time = 1
                max_data_retries = 3
                
                while retry_count < max_data_retries:
                    try:
                        medium_data = get_medium_data(person["id"], user_agent=user_agent)
                        processed_batch[i]["medium"] = medium_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve medium data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["medium"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving medium data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get style data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        style_data = get_style_data(person["id"], user_agent=user_agent)
                        processed_batch[i]["style"] = style_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve style data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["style"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving style data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get gallery/exhibit data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        gallery_data = get_gallery_exhibit_data(person["id"], user_agent=user_agent)
                        processed_batch[i]["gallery_exhibit"] = gallery_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve gallery/exhibit data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["gallery_exhibit"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving gallery/exhibit data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between people
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total visual arts and design figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the complex fields
        csv_file = "visual_arts_figures_data.csv"
        df_for_csv = df.copy()
        
        df_for_csv['mediums'] = df_for_csv['medium'].apply(
            lambda mediums: ', '.join(mediums) if mediums else ''
        )
        
        df_for_csv['styles'] = df_for_csv['style'].apply(
            lambda styles: ', '.join(styles) if styles else ''
        )
        
        df_for_csv['galleries_exhibits'] = df_for_csv['gallery_exhibit'].apply(
            lambda items: ', '.join([f"{item['name']} ({item['date']})" if item['type'] == 'exhibit' and item.get('date') else item['name'] for item in items]) if items else ''
        )
        
        # Drop the complex columns and replace with flattened ones
        df_for_csv = df_for_csv.drop(columns=['medium', 'style', 'gallery_exhibit'])
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "visual_arts_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total visual arts and design figures: {len(all_data)}")
        
        # Count people with medium info
        people_with_medium = sum(1 for person in all_data if person['medium'])
        print(f"People with medium info: {people_with_medium}")
        
        # Count people with style data
        people_with_style = sum(1 for person in all_data if person['style'])
        print(f"People with style info: {people_with_style}")
        
        # Count people with gallery/exhibit data
        people_with_galleries = sum(1 for person in all_data if person['gallery_exhibit'])
        print(f"People with gallery/exhibit info: {people_with_galleries}")
        
        # Sample of people
        print("\nSample data (first 3 visual arts and design figures):")
        for i, person in enumerate(all_data[:3]):
            print(f"\n{i+1}. {person['name']} ({person['id']})")
            
            if person['medium']:
                print(f"   Medium:")
                for medium in person['medium']:
                    print(f"      - {medium}")
            
            if person['style']:
                print(f"   Style:")
                for style in person['style']:
                    print(f"      - {style}")
            
            if person['gallery_exhibit']:
                print(f"   Galleries/Exhibits:")
                for item in person['gallery_exhibit']:
                    if item['type'] == 'gallery':
                        print(f"      - Gallery: {item['name']}")
                    else:
                        date_info = f" ({item['date']})" if item.get('date') else ""
                        print(f"      - Exhibit: {item['name']}{date_info}")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            
            df_for_csv['mediums'] = df_for_csv['medium'].apply(
                lambda mediums: ', '.join(mediums) if mediums else ''
            )
            
            df_for_csv['styles'] = df_for_csv['style'].apply(
                lambda styles: ', '.join(styles) if styles else ''
            )
            
            df_for_csv['galleries_exhibits'] = df_for_csv['gallery_exhibit'].apply(
                lambda items: ', '.join([f"{item['name']} ({item['date']})" if item['type'] == 'exhibit' and item.get('date') else item['name'] for item in items]) if items else ''
            )
            
            # Drop the complex columns and replace with flattened ones
            df_for_csv = df_for_csv.drop(columns=['medium', 'style', 'gallery_exhibit'])
            
            df_for_csv.to_csv("partial_visual_arts_figures_data.csv", index=False)
            with open("partial_visual_arts_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} visual arts and design figures)")
    
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

if __name__ == "__main__":
    main() 