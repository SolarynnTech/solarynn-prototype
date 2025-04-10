import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_fashion_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for fashion and modeling public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for fashion models
    query = f"""
    SELECT ?person ?personLabel ?agencyLabel 
    WHERE {{
      ?person wdt:P106 wd:Q4610556. # occupation: fashion model
      
      # Agency
      OPTIONAL {{ ?person wdt:P1401 ?agency. }}
      
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
                return query_wikidata_fashion_figures(limit // 2, offset, user_agent)
        return []

def get_fashion_weeks(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get fashion week appearances for a specific model
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?fashionWeekLabel ?dateLabel
    WHERE {{
      ?event wdt:P31/wdt:P279* wd:Q3761313. # instance of (or subclass of) fashion week
      ?event wdt:P710 wd:{person_id}. # participant
      
      OPTIONAL {{ ?event wdt:P585 ?date. }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            fashion_week_data = []
            
            for result in results["results"]["bindings"]:
                event_name = result.get("fashionWeekLabel", {}).get("value", "")
                date = result.get("dateLabel", {}).get("value", "")
                
                if event_name:
                    fashion_week_data.append({
                        "name": event_name,
                        "date": date
                    })
            
            return fashion_week_data
        
        except Exception as e:
            print(f"Error getting fashion week data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_campaigns(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get campaign information for a specific model
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?campaignLabel ?brandLabel ?yearLabel
    WHERE {{
      ?campaign wdt:P31 wd:Q2416673. # instance of advertising campaign
      ?campaign wdt:P710 wd:{person_id}. # participant
      
      OPTIONAL {{ ?campaign wdt:P1056 ?brand. }} # product or material produced
      OPTIONAL {{ ?campaign wdt:P585 ?year. }}  # point in time
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            campaign_data = []
            
            for result in results["results"]["bindings"]:
                campaign_name = result.get("campaignLabel", {}).get("value", "")
                brand_name = result.get("brandLabel", {}).get("value", "")
                year = result.get("yearLabel", {}).get("value", "")
                
                if campaign_name or brand_name:
                    campaign_data.append({
                        "name": campaign_name,
                        "brand": brand_name,
                        "year": year
                    })
            
            return campaign_data
        
        except Exception as e:
            print(f"Error getting campaign data for {person_id}: {e}")
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
            "agency": result.get("agencyLabel", {}).get("value", ""),
            "fashion_weeks": [],  # Will be populated separately
            "campaigns": []       # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main():
    # Configure parameters
    batch_size = 100
    start_batch = 0
    max_batches = 8
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting fashion and modeling figures data from Wikidata...")
    
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
                    batch = query_wikidata_fashion_figures(batch_size, offset, user_agent)
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
            
            for i, model in enumerate(processed_batch):
                print(f"  Getting additional data for {model['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get fashion week data
                retry_count = 0
                base_wait_time = 1
                max_fashion_retries = 3
                
                while retry_count < max_fashion_retries:
                    try:
                        fashion_week_data = get_fashion_weeks(model["id"], user_agent=user_agent)
                        processed_batch[i]["fashion_weeks"] = fashion_week_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_fashion_retries:
                            print(f"Failed to retrieve fashion week data after {max_fashion_retries} attempts. Skipping.")
                            processed_batch[i]["fashion_weeks"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving fashion week data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_fashion_retries})...")
                        time.sleep(wait_time)
                
                # Get campaign data
                retry_count = 0
                
                while retry_count < max_fashion_retries:
                    try:
                        campaign_data = get_campaigns(model["id"], user_agent=user_agent)
                        processed_batch[i]["campaigns"] = campaign_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_fashion_retries:
                            print(f"Failed to retrieve campaign data after {max_fashion_retries} attempts. Skipping.")
                            processed_batch[i]["campaigns"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving campaign data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_fashion_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between models
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total models: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the complex fields
        csv_file = "fashion_figures_data.csv"
        df_for_csv = df.copy()
        
        df_for_csv['fashion_weeks'] = df_for_csv['fashion_weeks'].apply(
            lambda weeks: ', '.join([f"{w['name']}{' ('+w['date']+')' if w['date'] else ''}" for w in weeks]) if weeks else ''
        )
        
        df_for_csv['campaigns'] = df_for_csv['campaigns'].apply(
            lambda campaigns: ', '.join([f"{c['brand']}: {c['name']}{' ('+c['year']+')' if c['year'] else ''}" for c in campaigns]) if campaigns else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "fashion_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total models: {len(all_data)}")
        
        # Count models with agency info
        models_with_agency = sum(1 for model in all_data if model['agency'])
        print(f"Models with agency info: {models_with_agency}")
        
        # Count models with fashion week data
        models_with_fashion_weeks = sum(1 for model in all_data if model['fashion_weeks'])
        print(f"Models with fashion week data: {models_with_fashion_weeks}")
        
        # Count models with campaign data
        models_with_campaigns = sum(1 for model in all_data if model['campaigns'])
        print(f"Models with campaign data: {models_with_campaigns}")
        
        # Sample of models
        print("\nSample data (first 3 models):")
        for i, model in enumerate(all_data[:3]):
            print(f"\n{i+1}. {model['name']} ({model['id']})")
            print(f"   Agency: {model['agency']}")
            
            if model['fashion_weeks']:
                print(f"   Fashion Weeks:")
                for week in model['fashion_weeks']:
                    date_info = f" ({week['date']})" if week['date'] else ""
                    print(f"      - {week['name']}{date_info}")
            
            if model['campaigns']:
                print(f"   Campaigns:")
                for campaign in model['campaigns']:
                    brand_info = f"{campaign['brand']}: " if campaign['brand'] else ""
                    year_info = f" ({campaign['year']})" if campaign['year'] else ""
                    print(f"      - {brand_info}{campaign['name']}{year_info}")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            
            df_for_csv['fashion_weeks'] = df_for_csv['fashion_weeks'].apply(
                lambda weeks: ', '.join([f"{w['name']}{' ('+w['date']+')' if w['date'] else ''}" for w in weeks]) if weeks else ''
            )
            
            df_for_csv['campaigns'] = df_for_csv['campaigns'].apply(
                lambda campaigns: ', '.join([f"{c['brand']}: {c['name']}{' ('+c['year']+')' if c['year'] else ''}" for c in campaigns]) if campaigns else ''
            )
            
            df_for_csv.to_csv("partial_fashion_figures_data.csv", index=False)
            with open("partial_fashion_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} models)")
    
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