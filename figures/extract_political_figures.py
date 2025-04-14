import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_political_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for politics and government public figures with a simplified query
    to avoid timeout errors
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for political figures
    query = f"""
    SELECT ?person ?personLabel ?partyLabel ?positionLabel
    WHERE {{
      ?person wdt:P106/wdt:P279* wd:Q82955. # occupation: politician or subclass
      
      # Political party
      OPTIONAL {{ ?person wdt:P102 ?party. }}
      
      # Position held
      OPTIONAL {{ ?person wdt:P39 ?position. }}
      
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
                return query_wikidata_political_figures(limit // 2, offset, user_agent)
        return []

def get_position_details(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get position details (terms, government level) for a specific politician
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?position ?positionLabel ?startDate ?endDate ?levelLabel
    WHERE {{
      # Position held statements
      wd:{person_id} p:P39 ?stmt.
      ?stmt ps:P39 ?position.
      
      # Start date
      OPTIONAL {{ ?stmt pq:P580 ?startDate. }}
      
      # End date
      OPTIONAL {{ ?stmt pq:P582 ?endDate. }}
      
      # Try to determine government level 
      OPTIONAL {{
        ?position wdt:P31/wdt:P279* ?type.
        {{?type wdt:P31 wd:Q51939.}} UNION  # Federal office
        {{?type wdt:P31 wd:Q56322.}} UNION  # State/provincial office
        {{?type wdt:P31 wd:Q75032.}}        # Local office
        BIND(
          IF(?type = wd:Q51939, "Federal",
            IF(?type = wd:Q56322, "State", 
              IF(?type = wd:Q75032, "Local", "Unknown"))) AS ?levelLabel
        )
      }}
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            position_data = []
            
            for result in results["results"]["bindings"]:
                position_name = result.get("positionLabel", {}).get("value", "")
                start_date = result.get("startDate", {}).get("value", "")
                end_date = result.get("endDate", {}).get("value", "")
                level = result.get("levelLabel", {}).get("value", "Unknown")
                
                if position_name:
                    # Format dates for display
                    term_dates = ""
                    if start_date:
                        start_date = start_date.split("T")[0] if "T" in start_date else start_date
                        term_dates = start_date
                        if end_date:
                            end_date = end_date.split("T")[0] if "T" in end_date else end_date
                            term_dates += f" to {end_date}"
                        else:
                            term_dates += " to present"
                    
                    position_data.append({
                        "position": position_name,
                        "government_level": level,
                        "term_dates": term_dates
                    })
            
            return position_data
        
        except Exception as e:
            print(f"Error getting position data for {person_id}: {e}")
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
            "party": result.get("partyLabel", {}).get("value", ""),
            "position": result.get("positionLabel", {}).get("value", ""),
            "position_details": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size):
    # Configure parameters
    start_batch = 0
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting political figures data from Wikidata...")
    
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
                    batch = query_wikidata_political_figures(batch_size, offset, user_agent)
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
            
            for i, politician in enumerate(processed_batch):
                print(f"  Getting position details for {politician['name']} ({i+1}/{len(processed_batch)})...")
                
                # Exponential back-off for position data retrieval
                retry_count = 0
                base_wait_time = 1
                max_position_retries = 3
                
                while retry_count < max_position_retries:
                    try:
                        position_data = get_position_details(politician["id"], user_agent=user_agent)
                        processed_batch[i]["position_details"] = position_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_position_retries:
                            print(f"Failed to retrieve position data after {max_position_retries} attempts. Skipping.")
                            processed_batch[i]["position_details"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving position data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_position_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between politicians
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total politicians: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the position_details field
        csv_file = "political_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['position_details'] = df_for_csv['position_details'].apply(
            lambda positions: ', '.join([f"{p['position']} ({p['government_level']}, {p['term_dates']})" for p in positions]) if positions else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "political_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total politicians: {len(all_data)}")
        
        # Count parties
        parties = [politician['party'] for politician in all_data if politician['party']]
        print(f"Politicians with party info: {len(parties)}")
        
        # Count politicians with position details
        politicians_with_positions = sum(1 for politician in all_data if politician['position_details'])
        print(f"Politicians with position details: {politicians_with_positions}")
        
        # Sample of politicians
        print("\nSample data (first 3 politicians):")
        for i, politician in enumerate(all_data[:3]):
            print(f"\n{i+1}. {politician['name']} ({politician['id']})")
            print(f"   Party: {politician['party']}")
            print(f"   Position: {politician['position']}")
            if politician['position_details']:
                print(f"   Position Details:")
                for position in politician['position_details']:
                    print(f"      - {position['position']} ({position['government_level']}, {position['term_dates']})")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['position_details'] = df_for_csv['position_details'].apply(
                lambda positions: ', '.join([f"{p['position']} ({p['government_level']}, {p['term_dates']})" for p in positions]) if positions else ''
            )
            df_for_csv.to_csv("partial_political_figures_data.csv", index=False)
            with open("partial_political_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} politicians)")
    
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