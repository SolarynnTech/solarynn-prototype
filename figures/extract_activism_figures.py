import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_activism_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for activism and humanitarian work public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # Improved SPARQL query for activism and humanitarian figures
    query = f"""
    SELECT DISTINCT ?person ?personLabel 
    WHERE {{
      # Find activists and humanitarians with broader definition
      {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q15229883.  # occupation: activist
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q10538331.  # occupation: humanitarian
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q482980.  # occupation: human rights activist
      }} UNION {{
        ?person wdt:P1344 ?activities.
        ?activities wdt:P31/wdt:P279* wd:Q309913.  # instance of social movement
      }} UNION {{
        ?person wdt:P1344 ?activities.
        ?activities wdt:P31/wdt:P279* wd:Q2738074.  # instance of political movement
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
                return query_wikidata_activism_figures(limit // 2, offset, user_agent)
        return []

def get_movements_and_causes(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get movements and causes for a specific activist
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?movementLabel ?causeLabel
    WHERE {{
      # Movements
      {{ wd:{person_id} wdt:P135 ?movement. }} UNION
      {{ wd:{person_id} wdt:P1344 ?movement.
         ?movement wdt:P31/wdt:P279* wd:Q309913. }}  # social movement
      
      # Causes
      OPTIONAL {{
        wd:{person_id} wdt:P1344 ?cause.
        FILTER NOT EXISTS {{ ?cause wdt:P31/wdt:P279* wd:Q2221906. }}  # not a political party
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
            movements = []
            causes = []
            
            for result in results["results"]["bindings"]:
                movement = result.get("movementLabel", {}).get("value", "")
                if movement and movement not in movements:
                    movements.append(movement)
                
                cause = result.get("causeLabel", {}).get("value", "")
                if cause and cause not in causes:
                    causes.append(cause)
            
            return movements, causes
        
        except Exception as e:
            print(f"Error getting movements and causes for {person_id}: {e}")
            time.sleep(2)
    
    return [], []

def get_legal_history(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get legal history for a specific activist
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?caseLabel ?date ?outcomeLabel
    WHERE {{
      # Legal cases where person is a participant
      {{
        ?case wdt:P1344 wd:{person_id}.
        OPTIONAL {{ ?case wdt:P577 ?date. }}
        OPTIONAL {{ ?case wdt:P1552 ?outcome. }}
      }}
      UNION
      {{
        ?case wdt:P1399 wd:{person_id}.  # convicted of
        OPTIONAL {{ ?case wdt:P585 ?date. }}
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
            legal_data = []
            
            for result in results["results"]["bindings"]:
                case_name = result.get("caseLabel", {}).get("value", "")
                case_date = result.get("date", {}).get("value", "")
                case_outcome = result.get("outcomeLabel", {}).get("value", "")
                
                if case_name:
                    # Format date if available (extract year only)
                    if case_date and len(case_date) >= 4:
                        case_date = case_date[:4]  # Get just the year
                    
                    legal_data.append({
                        "case": case_name,
                        "year": case_date,
                        "outcome": case_outcome
                    })
            
            return legal_data
        
        except Exception as e:
            print(f"Error getting legal history for {person_id}: {e}")
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
            "movements": [],  # Will be populated separately
            "causes_supported": [],  # Will be populated separately
            "legal_history": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting activism figures data from Wikidata...")
    
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
                    batch = query_wikidata_activism_figures(batch_size, offset, user_agent)
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
            
            for i, activist in enumerate(processed_batch):
                print(f"  Getting data for {activist['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get movements and causes
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        movements, causes = get_movements_and_causes(activist["id"], user_agent=user_agent)
                        processed_batch[i]["movements"] = movements
                        processed_batch[i]["causes_supported"] = causes
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve movements and causes after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving movements and causes: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                # Get legal history
                retry_count = 0
                while retry_count < max_retries:
                    try:
                        legal_data = get_legal_history(activist["id"], user_agent=user_agent)
                        processed_batch[i]["legal_history"] = legal_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve legal history after {max_retries} attempts. Skipping.")
                            processed_batch[i]["legal_history"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving legal history: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between activists
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total activists: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "activism_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['movements'] = df_for_csv['movements'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['causes_supported'] = df_for_csv['causes_supported'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['legal_history'] = df_for_csv['legal_history'].apply(
            lambda cases: ', '.join([f"{c['case']}{' ('+c['year']+')' if c['year'] else ''}{' - '+c['outcome'] if c['outcome'] else ''}" for c in cases]) if cases else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "activism_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total activists: {len(all_data)}")
        
        # Count activists with movements
        activists_with_movements = sum(1 for activist in all_data if activist['movements'])
        print(f"Activists with movement info: {activists_with_movements}")
        
        # Count activists with causes
        activists_with_causes = sum(1 for activist in all_data if activist['causes_supported'])
        print(f"Activists with causes supported: {activists_with_causes}")
        
        # Count activists with legal history
        activists_with_legal = sum(1 for activist in all_data if activist['legal_history'])
        print(f"Activists with legal history: {activists_with_legal}")
        
        # Sample of activists
        print("\nSample data (first 3 activists):")
        for i, activist in enumerate(all_data[:3]):
            print(f"\n{i+1}. {activist['name']} ({activist['id']})")
            
            if activist['movements']:
                print(f"   Movements:")
                for movement in activist['movements'][:5]:
                    print(f"      - {movement}")
                if len(activist['movements']) > 5:
                    print(f"      - ... and {len(activist['movements']) - 5} more movements")
            
            if activist['causes_supported']:
                print(f"   Causes Supported:")
                for cause in activist['causes_supported'][:5]:
                    print(f"      - {cause}")
                if len(activist['causes_supported']) > 5:
                    print(f"      - ... and {len(activist['causes_supported']) - 5} more causes")
            
            if activist['legal_history']:
                print(f"   Legal History:")
                for case in activist['legal_history'][:5]:
                    year_info = f" ({case['year']})" if case['year'] else ""
                    outcome_info = f" - {case['outcome']}" if case['outcome'] else ""
                    print(f"      - {case['case']}{year_info}{outcome_info}")
                if len(activist['legal_history']) > 5:
                    print(f"      - ... and {len(activist['legal_history']) - 5} more cases")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['movements'] = df_for_csv['movements'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['causes_supported'] = df_for_csv['causes_supported'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['legal_history'] = df_for_csv['legal_history'].apply(
                lambda cases: ', '.join([f"{c['case']}{' ('+c['year']+')' if c['year'] else ''}{' - '+c['outcome'] if c['outcome'] else ''}" for c in cases]) if cases else ''
            )
            df_for_csv.to_csv("partial_activism_figures_data.csv", index=False)
            with open("partial_activism_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} activists)")
    
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