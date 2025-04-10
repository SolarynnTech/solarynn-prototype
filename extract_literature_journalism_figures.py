import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_literature_journalism_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for literature and journalism figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for literature and journalism figures
    query = f"""
    SELECT ?person ?personLabel 
    WHERE {{
      VALUES ?occupation {{
        wd:Q36180   # writer
        wd:Q4853732 # novelist
        wd:Q6625963 # author
        wd:Q11774202 # essayist
        wd:Q214917   # playwright
        wd:Q49757    # poet
        wd:Q1930187  # journalist
        wd:Q1623536  # news presenter
        wd:Q1607826  # columnist
        wd:Q1931388  # reporter
        wd:Q3399092  # editor-in-chief
        wd:Q1340643  # literary critic
        wd:Q2259451  # literary editor
        wd:Q1233570  # publisher
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
                return query_wikidata_literature_journalism_figures(limit // 2, offset, user_agent)
        return []

def get_publisher_data(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get publisher information for an author/writer
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?publisherLabel ?publisherDate
    WHERE {{
      # Published works and their publishers
      ?work wdt:P50 wd:{person_id}. # author/creator
      ?work wdt:P123 ?publisher. # publisher
      
      OPTIONAL {{ ?work wdt:P577 ?publisherDate. }} # publication date
      
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
            publisher_data = []
            
            publishers = {}  # To track unique publishers with their dates
            
            for result in results["results"]["bindings"]:
                publisher_name = result.get("publisherLabel", {}).get("value", "")
                date = result.get("publisherDate", {}).get("value", "")
                
                if publisher_name:
                    if publisher_name not in publishers:
                        publishers[publisher_name] = date
                    elif date and not publishers[publisher_name]:
                        publishers[publisher_name] = date
            
            # Convert to list format
            for publisher_name, date in publishers.items():
                publisher_data.append({
                    "publisher": publisher_name,
                    "date": date
                })
            
            return publisher_data
        
        except Exception as e:
            print(f"Error getting publisher data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_bestsellers(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get bestseller works for an author
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?workLabel ?copiesSold ?awards
    WHERE {{
      ?work wdt:P50 wd:{person_id}. # author/creator
      
      OPTIONAL {{
        # Bestseller metrics
        ?work wdt:P2880 ?copiesSold. # number of copies sold
      }}
      
      OPTIONAL {{
        # Count awards (as another indication of significance)
        SELECT ?work (COUNT(?award) AS ?awards) WHERE {{
          ?work wdt:P50 wd:{person_id}. # author/creator
          ?work wdt:P166 ?award. # award received
        }} GROUP BY ?work
      }}
      
      # Include only works with either sales data or awards
      FILTER(BOUND(?copiesSold) || BOUND(?awards))
      
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
            bestseller_data = []
            
            for result in results["results"]["bindings"]:
                work_title = result.get("workLabel", {}).get("value", "")
                copies_sold = result.get("copiesSold", {}).get("value", "")
                awards = result.get("awards", {}).get("value", "")
                
                if work_title and (copies_sold or awards):
                    bestseller_data.append({
                        "title": work_title,
                        "copies_sold": copies_sold,
                        "awards": awards
                    })
            
            # Sort by copies sold (if available) or number of awards
            bestseller_data.sort(key=lambda x: (
                float(x["copies_sold"]) if x["copies_sold"] and x["copies_sold"].isdigit() else 0,
                float(x["awards"]) if x["awards"] and x["awards"].isdigit() else 0
            ), reverse=True)
            
            return bestseller_data
        
        except Exception as e:
            print(f"Error getting bestseller data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_column_name(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get information about columns written by journalists/columnists
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?columnLabel ?publicationLabel ?startDate ?endDate
    WHERE {{
      # Check for columns where person is author
      ?column wdt:P50 wd:{person_id}. # author
      ?column wdt:P31 wd:Q1607826. # instance of column
      
      OPTIONAL {{ ?column wdt:P1433 ?publication. }} # published in
      OPTIONAL {{ ?column wdt:P580 ?startDate. }} # start date
      OPTIONAL {{ ?column wdt:P582 ?endDate. }} # end date
      
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
            column_data = []
            
            for result in results["results"]["bindings"]:
                column_name = result.get("columnLabel", {}).get("value", "")
                publication = result.get("publicationLabel", {}).get("value", "")
                start_date = result.get("startDate", {}).get("value", "")
                end_date = result.get("endDate", {}).get("value", "")
                
                if column_name:
                    column_data.append({
                        "column_name": column_name,
                        "publication": publication,
                        "start_date": start_date,
                        "end_date": end_date
                    })
            
            return column_data
        
        except Exception as e:
            print(f"Error getting column data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_syndicate_data(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get syndication information for journalists/columnists
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?syndicateLabel ?workLabel
    WHERE {{
      # Find works and their syndicates
      ?work wdt:P50 wd:{person_id}. # author
      ?work wdt:P123 ?syndicate. # publisher (syndicate)
      
      # Filter for syndication companies
      ?syndicate wdt:P31/wdt:P279* ?type.
      FILTER(?type IN (wd:Q1114515, wd:Q15265344, wd:Q1320047))  # news agency, syndicate types
      
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
            syndicate_data = []
            
            syndicates = {}  # Track unique syndicates with their works
            
            for result in results["results"]["bindings"]:
                syndicate_name = result.get("syndicateLabel", {}).get("value", "")
                work_name = result.get("workLabel", {}).get("value", "")
                
                if syndicate_name:
                    if syndicate_name not in syndicates:
                        syndicates[syndicate_name] = []
                    
                    if work_name and work_name not in syndicates[syndicate_name]:
                        syndicates[syndicate_name].append(work_name)
            
            # Convert to list format
            for syndicate_name, works in syndicates.items():
                syndicate_data.append({
                    "syndicate": syndicate_name,
                    "works": works
                })
            
            return syndicate_data
        
        except Exception as e:
            print(f"Error getting syndicate data for {person_id}: {e}")
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
            "publisher": [],
            "bestsellers": [],
            "column_name": [],
            "syndicate": []
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
    
    print("Extracting literature and journalism figures data from Wikidata...")
    
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
                    batch = query_wikidata_literature_journalism_figures(batch_size, offset, user_agent)
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
                
                # Get publisher data
                retry_count = 0
                base_wait_time = 1
                max_data_retries = 3
                
                while retry_count < max_data_retries:
                    try:
                        publisher_data = get_publisher_data(person["id"], user_agent=user_agent)
                        processed_batch[i]["publisher"] = publisher_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve publisher data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["publisher"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving publisher data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get bestseller data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        bestseller_data = get_bestsellers(person["id"], user_agent=user_agent)
                        processed_batch[i]["bestsellers"] = bestseller_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve bestseller data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["bestsellers"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving bestseller data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get column name data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        column_data = get_column_name(person["id"], user_agent=user_agent)
                        processed_batch[i]["column_name"] = column_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve column data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["column_name"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving column data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get syndicate data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        syndicate_data = get_syndicate_data(person["id"], user_agent=user_agent)
                        processed_batch[i]["syndicate"] = syndicate_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve syndicate data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["syndicate"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving syndicate data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between people
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total literature and journalism figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the complex fields
        csv_file = "literature_journalism_figures_data.csv"
        df_for_csv = df.copy()
        
        df_for_csv['publishers'] = df_for_csv['publisher'].apply(
            lambda publishers: ', '.join([f"{p['publisher']}{' (as of '+p['date']+')' if p['date'] else ''}" for p in publishers]) if publishers else ''
        )
        
        df_for_csv['bestsellers_list'] = df_for_csv['bestsellers'].apply(
            lambda bestsellers: ', '.join([f"{b['title']} ({b['copies_sold']} copies sold)" if b['copies_sold'] else f"{b['title']} ({b['awards']} awards)" for b in bestsellers]) if bestsellers else ''
        )
        
        df_for_csv['columns'] = df_for_csv['column_name'].apply(
            lambda columns: ', '.join([f"{c['column_name']} in {c['publication']}" if c['publication'] else c['column_name'] for c in columns]) if columns else ''
        )
        
        df_for_csv['syndicates'] = df_for_csv['syndicate'].apply(
            lambda syndicates: ', '.join([s['syndicate'] for s in syndicates]) if syndicates else ''
        )
        
        # Drop the complex columns and replace with flattened ones
        df_for_csv = df_for_csv.drop(columns=['publisher', 'bestsellers', 'column_name', 'syndicate'])
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "literature_journalism_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total literature and journalism figures: {len(all_data)}")
        
        # Count people with publisher info
        people_with_publishers = sum(1 for person in all_data if person['publisher'])
        print(f"People with publisher info: {people_with_publishers}")
        
        # Count people with bestseller data
        people_with_bestsellers = sum(1 for person in all_data if person['bestsellers'])
        print(f"People with bestseller info: {people_with_bestsellers}")
        
        # Count people with column data
        people_with_columns = sum(1 for person in all_data if person['column_name'])
        print(f"People with column info: {people_with_columns}")
        
        # Count people with syndicate data
        people_with_syndicates = sum(1 for person in all_data if person['syndicate'])
        print(f"People with syndicate info: {people_with_syndicates}")
        
        # Sample of people
        print("\nSample data (first 3 literature and journalism figures):")
        for i, person in enumerate(all_data[:3]):
            print(f"\n{i+1}. {person['name']} ({person['id']})")
            
            if person['publisher']:
                print(f"   Publishers:")
                for pub in person['publisher']:
                    date_info = f" (as of {pub['date']})" if pub['date'] else ""
                    print(f"      - {pub['publisher']}{date_info}")
            
            if person['bestsellers']:
                print(f"   Bestsellers:")
                for book in person['bestsellers']:
                    if book['copies_sold']:
                        print(f"      - {book['title']} ({book['copies_sold']} copies sold)")
                    elif book['awards']:
                        print(f"      - {book['title']} ({book['awards']} awards)")
                    else:
                        print(f"      - {book['title']}")
            
            if person['column_name']:
                print(f"   Columns:")
                for column in person['column_name']:
                    publication = f" in {column['publication']}" if column['publication'] else ""
                    date_range = ""
                    if column['start_date'] and column['end_date']:
                        date_range = f" ({column['start_date']} to {column['end_date']})"
                    elif column['start_date']:
                        date_range = f" (since {column['start_date']})"
                    print(f"      - {column['column_name']}{publication}{date_range}")
            
            if person['syndicate']:
                print(f"   Syndicates:")
                for synd in person['syndicate']:
                    works = f" ({', '.join(synd['works'])})" if synd['works'] else ""
                    print(f"      - {synd['syndicate']}{works}")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            
            df_for_csv['publishers'] = df_for_csv['publisher'].apply(
                lambda publishers: ', '.join([f"{p['publisher']}{' (as of '+p['date']+')' if p['date'] else ''}" for p in publishers]) if publishers else ''
            )
            
            df_for_csv['bestsellers_list'] = df_for_csv['bestsellers'].apply(
                lambda bestsellers: ', '.join([f"{b['title']} ({b['copies_sold']} copies sold)" if b['copies_sold'] else f"{b['title']} ({b['awards']} awards)" for b in bestsellers]) if bestsellers else ''
            )
            
            df_for_csv['columns'] = df_for_csv['column_name'].apply(
                lambda columns: ', '.join([f"{c['column_name']} in {c['publication']}" if c['publication'] else c['column_name'] for c in columns]) if columns else ''
            )
            
            df_for_csv['syndicates'] = df_for_csv['syndicate'].apply(
                lambda syndicates: ', '.join([s['syndicate'] for s in syndicates]) if syndicates else ''
            )
            
            # Drop the complex columns and replace with flattened ones
            df_for_csv = df_for_csv.drop(columns=['publisher', 'bestsellers', 'column_name', 'syndicate'])
            
            df_for_csv.to_csv("partial_literature_journalism_figures_data.csv", index=False)
            with open("partial_literature_journalism_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} literature and journalism figures)")
    
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