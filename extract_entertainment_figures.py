import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_entertainment_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for entertainment & media public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for entertainment & media figures
    query = f"""
    SELECT ?person ?personLabel ?occupationLabel ?imdb ?productionLabel ?platformLabel
    WHERE {{
      # Find people with entertainment/media occupations
      ?person wdt:P106 ?occupation.
      VALUES ?occupation {{
        wd:Q33999 # actor
        wd:Q10800557 # film actor
        wd:Q10843263 # television actor
        wd:Q2526255 # film director
        wd:Q3282637 # film producer
        wd:Q28389 # screenwriter
        wd:Q2405480 # voice actor
      }}
      
      # IMDB ID
      OPTIONAL {{ ?person wdt:P345 ?imdb. }}
      
      # Productions (films or TV series they were part of)
      OPTIONAL {{ 
        ?production wdt:P161|wdt:P57|wdt:P1040 ?person.
      }}
      
      # Streaming platform affiliations
      OPTIONAL {{
        ?person wdt:P108 ?employer.
        ?employer wdt:P31/wdt:P279* wd:Q24925754. # streaming media service
        ?employer rdfs:label ?platformLabel.
        FILTER(LANG(?platformLabel) = "en")
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
                return query_wikidata_entertainment_figures(limit // 2, offset, user_agent)
        return []

def get_major_productions(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get major productions for a specific entertainment figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?productionLabel ?roleLabel ?yearLabel
    WHERE {{
      # Productions where this person was involved
      {{
        ?production wdt:P161 wd:{person_id}.  # as cast member
        OPTIONAL {{ ?person p:P161 ?stmt.
                   ?stmt ps:P161 ?production.
                   ?stmt pq:P453 ?role. }}
      }} UNION {{
        ?production wdt:P57 wd:{person_id}.   # as director
      }} UNION {{
        ?production wdt:P1040 wd:{person_id}. # as film editor
      }} UNION {{
        ?production wdt:P58 wd:{person_id}.   # as screenwriter
      }} UNION {{
        ?production wdt:P162 wd:{person_id}.  # as producer
      }}
      
      # Year of production/release
      OPTIONAL {{ ?production wdt:P577 ?date .
                BIND(YEAR(?date) AS ?year) }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    ORDER BY DESC(?year)
    LIMIT 20
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            production_data = []
            
            for result in results["results"]["bindings"]:
                production_name = result.get("productionLabel", {}).get("value", "")
                role = result.get("roleLabel", {}).get("value", "")
                year = result.get("yearLabel", {}).get("value", "")
                
                if production_name:
                    production_data.append({
                        "title": production_name,
                        "role": role,
                        "year": year
                    })
            
            return production_data
        
        except Exception as e:
            print(f"Error getting production data for {person_id}: {e}")
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
        
        # Get IMDB ID
        imdb_id = result.get("imdb", {}).get("value", "")
        imdb_link = f"https://www.imdb.com/name/{imdb_id}/" if imdb_id else ""
        
        person_data = {
            "id": person_id,
            "name": result.get("personLabel", {}).get("value", "Unknown"),
            "occupation": result.get("occupationLabel", {}).get("value", ""),
            "imdb_link": imdb_link,
            "platform_affiliation": result.get("platformLabel", {}).get("value", ""),
            "major_productions": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting entertainment & media figures data from Wikidata...")
    
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
                    batch = query_wikidata_entertainment_figures(batch_size, offset, user_agent)
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
            
            for i, figure in enumerate(processed_batch):
                print(f"  Getting production data for {figure['name']} ({i+1}/{len(processed_batch)})...")
                
                # Exponential back-off for production data retrieval
                retry_count = 0
                base_wait_time = 1
                max_prod_retries = 3
                
                while retry_count < max_prod_retries:
                    try:
                        production_data = get_major_productions(figure["id"], user_agent=user_agent)
                        processed_batch[i]["major_productions"] = production_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_prod_retries:
                            print(f"Failed to retrieve production data after {max_prod_retries} attempts. Skipping.")
                            processed_batch[i]["major_productions"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving production data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_prod_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between figures
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total entertainment figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the major_productions field
        csv_file = "entertainment_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['major_productions'] = df_for_csv['major_productions'].apply(
            lambda prods: ', '.join([f"{p['title']} ({p['year']}){' as '+p['role'] if p['role'] else ''}" for p in prods]) if prods else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "entertainment_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total entertainment figures: {len(all_data)}")
        
        # Count figures with IMDB links
        figures_with_imdb = sum(1 for figure in all_data if figure['imdb_link'])
        print(f"Figures with IMDB links: {figures_with_imdb}")
        
        # Count figures with platform affiliations
        figures_with_platform = sum(1 for figure in all_data if figure['platform_affiliation'])
        print(f"Figures with platform affiliations: {figures_with_platform}")
        
        # Count figures with production data
        figures_with_productions = sum(1 for figure in all_data if figure['major_productions'])
        print(f"Figures with production data: {figures_with_productions}")
        
        # Sample of figures
        print("\nSample data (first 3 figures):")
        for i, figure in enumerate(all_data[:3]):
            print(f"\n{i+1}. {figure['name']} ({figure['id']})")
            print(f"   Occupation: {figure['occupation']}")
            print(f"   IMDB Link: {figure['imdb_link']}")
            print(f"   Platform Affiliation: {figure['platform_affiliation']}")
            if figure['major_productions']:
                print(f"   Major Productions:")
                for prod in figure['major_productions'][:5]:  # Show max 5 productions
                    role_info = f" as {prod['role']}" if prod['role'] else ""
                    year_info = f" ({prod['year']})" if prod['year'] else ""
                    print(f"      - {prod['title']}{year_info}{role_info}")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['major_productions'] = df_for_csv['major_productions'].apply(
                lambda prods: ', '.join([f"{p['title']} ({p['year']}){' as '+p['role'] if p['role'] else ''}" for p in prods]) if prods else ''
            )
            df_for_csv.to_csv("partial_entertainment_figures_data.csv", index=False)
            with open("partial_entertainment_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} figures)")
    
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