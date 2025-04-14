import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_military_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for military and defense public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for military and defense figures
    query = f"""
    SELECT DISTINCT ?person ?personLabel 
    WHERE {{
      # Find military and defense figures with broader definition
      {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q47064.  # occupation: military personnel
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q189290.  # occupation: military officer
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q66019.  # occupation: admiral
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q83460.  # occupation: general
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q10809938.  # occupation: soldier
      }} UNION {{
        ?person wdt:P410 ?rank.  # has military rank
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
                return query_wikidata_military_figures(limit // 2, offset, user_agent)
        return []

def get_military_details(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get military branch, rank, and service years for a specific military figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?branchLabel ?rankLabel ?startDate ?endDate
    WHERE {{
      # Military branch
      OPTIONAL {{
        wd:{person_id} wdt:P241 ?branch.  # military branch
      }}
      
      # Military rank
      OPTIONAL {{
        wd:{person_id} wdt:P410 ?rank.  # military rank
      }}
      
      # Service years (start date)
      OPTIONAL {{
        {{
          wd:{person_id} p:P106 ?occStatement.
          ?occStatement ps:P106 ?occupation.
          ?occupation wdt:P279* wd:Q47064.  # military personnel
          OPTIONAL {{ ?occStatement pq:P580 ?startDate. }}  # start date qualifier
          OPTIONAL {{ ?occStatement pq:P582 ?endDate. }}    # end date qualifier
        }} UNION {{
          wd:{person_id} p:P410 ?rankStatement.
          ?rankStatement ps:P410 ?rank.
          OPTIONAL {{ ?rankStatement pq:P580 ?startDate. }}  # start date qualifier
          OPTIONAL {{ ?rankStatement pq:P582 ?endDate. }}    # end date qualifier
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
            branches = []
            ranks = []
            service_years = []
            
            for result in results["results"]["bindings"]:
                branch = result.get("branchLabel", {}).get("value", "")
                if branch and branch not in branches:
                    branches.append(branch)
                
                rank = result.get("rankLabel", {}).get("value", "")
                if rank and rank not in ranks:
                    ranks.append(rank)
                
                start_date = result.get("startDate", {}).get("value", "")
                end_date = result.get("endDate", {}).get("value", "")
                
                if start_date or end_date:
                    # Format dates (extract years only)
                    start_year = start_date[:4] if start_date and len(start_date) >= 4 else ""
                    end_year = end_date[:4] if end_date and len(end_date) >= 4 else ""
                    
                    service_period = {}
                    if start_year:
                        service_period["start"] = start_year
                    if end_year:
                        service_period["end"] = end_year
                    
                    if service_period and service_period not in service_years:
                        service_years.append(service_period)
            
            # Format service years as strings for display
            formatted_service_years = []
            for period in service_years:
                if "start" in period and "end" in period:
                    formatted_service_years.append(f"{period['start']}–{period['end']}")
                elif "start" in period:
                    formatted_service_years.append(f"{period['start']}–present")
                elif "end" in period:
                    formatted_service_years.append(f"until {period['end']}")
            
            return branches, ranks, formatted_service_years
        
        except Exception as e:
            print(f"Error getting military details for {person_id}: {e}")
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
            "branches": [],  # Will be populated separately
            "ranks": [],  # Will be populated separately
            "service_years": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting military figures data from Wikidata...")
    
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
                    batch = query_wikidata_military_figures(batch_size, offset, user_agent)
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
            
            for i, military_figure in enumerate(processed_batch):
                print(f"  Getting data for {military_figure['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get military details
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        branches, ranks, service_years = get_military_details(military_figure["id"], user_agent=user_agent)
                        processed_batch[i]["branches"] = branches
                        processed_batch[i]["ranks"] = ranks
                        processed_batch[i]["service_years"] = service_years
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve military details after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving military details: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between military figures
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total military figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "military_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['branches'] = df_for_csv['branches'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['ranks'] = df_for_csv['ranks'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['service_years'] = df_for_csv['service_years'].apply(lambda x: ', '.join(x) if x else '')
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "military_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total military figures: {len(all_data)}")
        
        # Count figures with branch info
        figures_with_branch = sum(1 for figure in all_data if figure['branches'])
        print(f"Figures with branch info: {figures_with_branch}")
        
        # Count figures with rank info
        figures_with_rank = sum(1 for figure in all_data if figure['ranks'])
        print(f"Figures with rank info: {figures_with_rank}")
        
        # Count figures with service years
        figures_with_service = sum(1 for figure in all_data if figure['service_years'])
        print(f"Figures with service years: {figures_with_service}")
        
        # Sample of military figures
        print("\nSample data (first 3 military figures):")
        for i, figure in enumerate(all_data[:3]):
            print(f"\n{i+1}. {figure['name']} ({figure['id']})")
            
            if figure['branches']:
                print(f"   Branch of Military:")
                for branch in figure['branches'][:5]:
                    print(f"      - {branch}")
                if len(figure['branches']) > 5:
                    print(f"      - ... and {len(figure['branches']) - 5} more")
            
            if figure['ranks']:
                print(f"   Rank(s):")
                for rank in figure['ranks'][:5]:
                    print(f"      - {rank}")
                if len(figure['ranks']) > 5:
                    print(f"      - ... and {len(figure['ranks']) - 5} more")
            
            if figure['service_years']:
                print(f"   Service Years:")
                for period in figure['service_years'][:5]:
                    print(f"      - {period}")
                if len(figure['service_years']) > 5:
                    print(f"      - ... and {len(figure['service_years']) - 5} more periods")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['branches'] = df_for_csv['branches'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['ranks'] = df_for_csv['ranks'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['service_years'] = df_for_csv['service_years'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv.to_csv("partial_military_figures_data.csv", index=False)
            with open("partial_military_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} military figures)")
    
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