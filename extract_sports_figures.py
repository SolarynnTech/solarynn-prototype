import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_sports_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for sports and athletics public figures with a simplified query
    to avoid timeout errors
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # Simplified SPARQL query
    query = f"""
    SELECT ?person ?personLabel ?sportLabel ?teamsLabel ?leagueLabel 
    WHERE {{
      ?person wdt:P106 wd:Q2066131. # occupation: athlete
      
      # Sport type
      OPTIONAL {{ ?person wdt:P641 ?sport. }}
      
      # Teams 
      OPTIONAL {{ ?person wdt:P54 ?teams. }}
      
      # League
      OPTIONAL {{ ?person wdt:P118 ?league. }}
      
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
                return query_wikidata_sports_figures(limit // 2, offset, user_agent)
        return []

def get_olympic_data(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get Olympic data for a specific athlete
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?olympicEventLabel ?medalLabel
    WHERE {{
      wd:{person_id} wdt:P1344 ?olympicEvent.
      OPTIONAL {{ wd:{person_id} p:P1344 ?stmt.
                 ?stmt ps:P1344 ?olympicEvent.
                 ?stmt pq:P166 ?medal. }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            olympic_data = []
            
            for result in results["results"]["bindings"]:
                event_name = result.get("olympicEventLabel", {}).get("value", "")
                medal = result.get("medalLabel", {}).get("value", "")
                
                if event_name:
                    olympic_data.append({
                        "event": event_name,
                        "medal": medal
                    })
            
            return olympic_data
        
        except Exception as e:
            print(f"Error getting Olympic data for {person_id}: {e}")
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
            "sport_type": result.get("sportLabel", {}).get("value", ""),
            "teams": result.get("teamsLabel", {}).get("value", ""),
            "league": result.get("leagueLabel", {}).get("value", ""),
            "olympic_data": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main():
    # Configure parameters
    batch_size = 100  # Start with smaller batch size
    start_batch = 0
    max_batches = 8   # Limit to 5 batches initially
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting sports figures data from Wikidata...")
    
    try:
        for batch_num in range(start_batch,max_batches):
            offset = batch_num * batch_size
            print(f"Retrieving batch {batch_num+1}/{max_batches} (offset {offset})...")
            
            # Exponential back-off for batch retrieval
            max_retries = 5
            retry_count = 0
            base_wait_time = 2
            
            while retry_count < max_retries:
                try:
                    batch = query_wikidata_sports_figures(batch_size, offset, user_agent)
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
            
            for i, athlete in enumerate(processed_batch):
                print(f"  Getting Olympic data for {athlete['name']} ({i+1}/{len(processed_batch)})...")
                
                # Exponential back-off for Olympic data retrieval
                retry_count = 0
                base_wait_time = 1
                max_olympic_retries = 3
                
                while retry_count < max_olympic_retries:
                    try:
                        olympic_data = get_olympic_data(athlete["id"], user_agent=user_agent)
                        processed_batch[i]["olympic_data"] = olympic_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_olympic_retries:
                            print(f"Failed to retrieve Olympic data after {max_olympic_retries} attempts. Skipping.")
                            processed_batch[i]["olympic_data"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving Olympic data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_olympic_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between athletes
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total athletes: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the olympic_data field
        csv_file = "sports_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['olympic_data'] = df_for_csv['olympic_data'].apply(
            lambda events: ', '.join([f"{e['event']}{' ('+e['medal']+')' if e['medal'] else ''}" for e in events]) if events else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "sports_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total athletes: {len(all_data)}")
        
        # Count sports
        sports = [athlete['sport_type'] for athlete in all_data if athlete['sport_type']]
        print(f"Athletes with sport info: {len(sports)}")
        
        # Count athletes with Olympic data
        athletes_with_olympic_data = sum(1 for athlete in all_data if athlete['olympic_data'])
        print(f"Athletes with Olympic data: {athletes_with_olympic_data}")
        
        # Sample of athletes
        print("\nSample data (first 3 athletes):")
        for i, athlete in enumerate(all_data[:3]):
            print(f"\n{i+1}. {athlete['name']} ({athlete['id']})")
            print(f"   Sport: {athlete['sport_type']}")
            print(f"   Team: {athlete['teams']}")
            print(f"   League: {athlete['league']}")
            if athlete['olympic_data']:
                print(f"   Olympic events:")
                for event in athlete['olympic_data']:
                    medal_info = f" ({event['medal']})" if event['medal'] else ""
                    print(f"      - {event['event']}{medal_info}")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['olympic_data'] = df_for_csv['olympic_data'].apply(
                lambda events: ', '.join([f"{e['event']}{' ('+e['medal']+')' if e['medal'] else ''}" for e in events]) if events else ''
            )
            df_for_csv.to_csv("partial_sports_figures_data.csv", index=False)
            with open("partial_sports_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} athletes)")
    
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