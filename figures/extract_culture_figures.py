import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_culture_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for culture and heritage public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for culture and heritage figures
    query = f"""
    SELECT DISTINCT ?person ?personLabel 
    WHERE {{
      # Find culture and heritage figures with broader definition
      {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q6423937.  # occupation: folklorist
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q7457834.  # occupation: traditional artist
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q36180.  # occupation: writer of folk culture
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q16947657.  # occupation: cultural heritage professional
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q1231865.  # occupation: cultural anthropologist
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q4964182.  # occupation: ethnographer
      }} UNION {{
        ?person wdt:P166 ?award.
        ?award wdt:P31/wdt:P279* wd:Q618779.  # cultural heritage award
      }} UNION {{
        ?person wdt:P166 wd:Q196674.  # UNESCO Intangible Cultural Heritage
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
                return query_wikidata_culture_figures(limit // 2, offset, user_agent)
        return []

def get_culture_details(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get region, tradition type, and recognition for a specific culture figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?regionLabel ?traditionTypeLabel ?recognitionLabel
    WHERE {{
      # Region (country, place of origin, or cultural region)
      OPTIONAL {{
        {{
          wd:{person_id} wdt:P27 ?region.  # country of citizenship
        }} UNION {{
          wd:{person_id} wdt:P19 ?region.  # place of birth
        }} UNION {{
          wd:{person_id} wdt:P551 ?region.  # residence
        }} UNION {{
          wd:{person_id} wdt:P937 ?region.  # work location
        }} UNION {{
          wd:{person_id} wdt:P1050 ?region.  # medical condition (culture-bound syndrome)
        }} UNION {{
          wd:{person_id} wdt:P2341 ?region.  # indigenous to (ethnic group)
        }}
      }}
      
      # Tradition Type (field of work, genre, movement, cultural practice)
      OPTIONAL {{
        {{
          wd:{person_id} wdt:P101 ?traditionType.  # field of work
        }} UNION {{
          wd:{person_id} wdt:P136 ?traditionType.  # genre
        }} UNION {{
          wd:{person_id} wdt:P135 ?traditionType.  # movement
        }} UNION {{
          wd:{person_id} wdt:P1343 ?traditionType.  # described by source (cultural description)
        }} UNION {{
          wd:{person_id} wdt:P2283 ?traditionType.  # uses (cultural practice/technique)
        }}
      }}
      
      # Recognition (awards, honors, cultural significance)
      OPTIONAL {{
        {{
          wd:{person_id} wdt:P166 ?recognition.  # award received
        }} UNION {{
          wd:{person_id} wdt:P1411 ?recognition.  # nominated for
        }} UNION {{
          wd:{person_id} wdt:P1344 ?recognition.  # participant in
          ?recognition wdt:P31/wdt:P279* wd:Q618779.  # cultural heritage event
        }} UNION {{
          ?culturalItem wdt:P170 wd:{person_id}.  # creator of cultural item
          ?culturalItem wdt:P1435 ?recognition.  # heritage designation
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
            regions = []
            tradition_types = []
            recognitions = []
            
            for result in results["results"]["bindings"]:
                region = result.get("regionLabel", {}).get("value", "")
                if region and region not in regions:
                    regions.append(region)
                
                tradition_type = result.get("traditionTypeLabel", {}).get("value", "")
                if tradition_type and tradition_type not in tradition_types:
                    tradition_types.append(tradition_type)
                
                recognition = result.get("recognitionLabel", {}).get("value", "")
                if recognition and recognition not in recognitions:
                    recognitions.append(recognition)
            
            return regions, tradition_types, recognitions
        
        except Exception as e:
            print(f"Error getting culture details for {person_id}: {e}")
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
            "regions": [],  # Will be populated separately
            "tradition_types": [],  # Will be populated separately
            "recognitions": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting culture figures data from Wikidata...")
    
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
                    batch = query_wikidata_culture_figures(batch_size, offset, user_agent)
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
            
            for i, culture_figure in enumerate(processed_batch):
                print(f"  Getting data for {culture_figure['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get culture details
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        regions, tradition_types, recognitions = get_culture_details(culture_figure["id"], user_agent=user_agent)
                        processed_batch[i]["regions"] = regions
                        processed_batch[i]["tradition_types"] = tradition_types
                        processed_batch[i]["recognitions"] = recognitions
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve culture details after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving culture details: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between culture figures
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total culture figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "culture_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['regions'] = df_for_csv['regions'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['tradition_types'] = df_for_csv['tradition_types'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['recognitions'] = df_for_csv['recognitions'].apply(lambda x: ', '.join(x) if x else '')
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "culture_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total culture figures: {len(all_data)}")
        
        # Count figures with region info
        figures_with_region = sum(1 for figure in all_data if figure['regions'])
        print(f"Figures with region info: {figures_with_region}")
        
        # Count figures with tradition type info
        figures_with_tradition = sum(1 for figure in all_data if figure['tradition_types'])
        print(f"Figures with tradition type info: {figures_with_tradition}")
        
        # Count figures with recognition info
        figures_with_recognition = sum(1 for figure in all_data if figure['recognitions'])
        print(f"Figures with recognition info: {figures_with_recognition}")
        
        # Sample of culture figures
        print("\nSample data (first 3 culture figures):")
        for i, figure in enumerate(all_data[:3]):
            print(f"\n{i+1}. {figure['name']} ({figure['id']})")
            
            if figure['regions']:
                print(f"   Region(s):")
                for region in figure['regions'][:5]:
                    print(f"      - {region}")
                if len(figure['regions']) > 5:
                    print(f"      - ... and {len(figure['regions']) - 5} more")
            
            if figure['tradition_types']:
                print(f"   Tradition Type(s):")
                for tradition in figure['tradition_types'][:5]:
                    print(f"      - {tradition}")
                if len(figure['tradition_types']) > 5:
                    print(f"      - ... and {len(figure['tradition_types']) - 5} more")
            
            if figure['recognitions']:
                print(f"   Recognition(s):")
                for recognition in figure['recognitions'][:5]:
                    print(f"      - {recognition}")
                if len(figure['recognitions']) > 5:
                    print(f"      - ... and {len(figure['recognitions']) - 5} more recognitions")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['regions'] = df_for_csv['regions'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['tradition_types'] = df_for_csv['tradition_types'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['recognitions'] = df_for_csv['recognitions'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv.to_csv("partial_culture_figures_data.csv", index=False)
            with open("partial_culture_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} culture figures)")
    
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