import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_religion_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for religion and spirituality public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for religion and spirituality figures
    query = f"""
    SELECT DISTINCT ?person ?personLabel 
    WHERE {{
      # Find religious and spiritual figures with broader definition
      {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q42857.  # occupation: clergy
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q1234713.  # occupation: religious leader
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q4327678.  # occupation: religious figure
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q250867.  # occupation: theologian
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q15662274.  # occupation: spiritual leader
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
                return query_wikidata_religion_figures(limit // 2, offset, user_agent)
        return []

def get_religion_details(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get religion details for a specific religious figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?religionLabel ?denominationLabel ?positionLabel
    WHERE {{
      # Religion
      OPTIONAL {{ wd:{person_id} wdt:P140 ?religion. }}
      
      # Denomination (also uses religion property but gets specific denominations)
      OPTIONAL {{ 
        wd:{person_id} wdt:P140 ?denomination.
        ?denomination wdt:P279* ?parent.
        ?parent wdt:P31 wd:Q9174.  # instance of religion
      }}
      
      # Position or title
      OPTIONAL {{ wd:{person_id} wdt:P39 ?position. }}  # position held
      OPTIONAL {{ wd:{person_id} wdt:P106 ?position. }}  # occupation (for religious roles)
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            religions = []
            denominations = []
            positions = []
            
            for result in results["results"]["bindings"]:
                religion = result.get("religionLabel", {}).get("value", "")
                if religion and religion not in religions:
                    religions.append(religion)
                
                denomination = result.get("denominationLabel", {}).get("value", "")
                if denomination and denomination not in denominations:
                    denominations.append(denomination)
                
                position = result.get("positionLabel", {}).get("value", "")
                if position and position not in positions:
                    positions.append(position)
            
            return religions, denominations, positions
        
        except Exception as e:
            print(f"Error getting religion details for {person_id}: {e}")
            time.sleep(2)
    
    return [], [], []

def get_published_teachings(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get published teachings for a specific religious figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?teachingLabel ?date
    WHERE {{
      # Works authored by person
      ?teaching wdt:P50 wd:{person_id}.
      
      # Publication date
      OPTIONAL {{ ?teaching wdt:P577 ?date. }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            teachings_data = []
            
            for result in results["results"]["bindings"]:
                teaching_name = result.get("teachingLabel", {}).get("value", "")
                pub_date = result.get("date", {}).get("value", "")
                
                if teaching_name:
                    # Format date if available (extract year only)
                    if pub_date and len(pub_date) >= 4:
                        pub_date = pub_date[:4]  # Get just the year
                    
                    teachings_data.append({
                        "title": teaching_name,
                        "year": pub_date
                    })
            
            return teachings_data
        
        except Exception as e:
            print(f"Error getting published teachings for {person_id}: {e}")
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
            "religions": [],  # Will be populated separately
            "denominations": [],  # Will be populated separately
            "titles": [],  # Will be populated separately
            "published_teachings": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting religion figures data from Wikidata...")
    
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
                    batch = query_wikidata_religion_figures(batch_size, offset, user_agent)
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
            
            for i, religious_figure in enumerate(processed_batch):
                print(f"  Getting data for {religious_figure['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get religion details
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        religions, denominations, titles = get_religion_details(religious_figure["id"], user_agent=user_agent)
                        processed_batch[i]["religions"] = religions
                        processed_batch[i]["denominations"] = denominations
                        processed_batch[i]["titles"] = titles
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve religion details after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving religion details: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                # Get published teachings
                retry_count = 0
                while retry_count < max_retries:
                    try:
                        teachings_data = get_published_teachings(religious_figure["id"], user_agent=user_agent)
                        processed_batch[i]["published_teachings"] = teachings_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve published teachings after {max_retries} attempts. Skipping.")
                            processed_batch[i]["published_teachings"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving published teachings: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between religious figures
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total religious figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "religion_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['religions'] = df_for_csv['religions'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['denominations'] = df_for_csv['denominations'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['titles'] = df_for_csv['titles'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['published_teachings'] = df_for_csv['published_teachings'].apply(
            lambda teachings: ', '.join([f"{t['title']}{' ('+t['year']+')' if t['year'] else ''}" for t in teachings]) if teachings else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "religion_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total religious figures: {len(all_data)}")
        
        # Count figures with religion info
        figures_with_religion = sum(1 for figure in all_data if figure['religions'])
        print(f"Figures with religion info: {figures_with_religion}")
        
        # Count figures with denomination info
        figures_with_denomination = sum(1 for figure in all_data if figure['denominations'])
        print(f"Figures with denomination info: {figures_with_denomination}")
        
        # Count figures with title info
        figures_with_titles = sum(1 for figure in all_data if figure['titles'])
        print(f"Figures with title info: {figures_with_titles}")
        
        # Count figures with teachings
        figures_with_teachings = sum(1 for figure in all_data if figure['published_teachings'])
        print(f"Figures with published teachings: {figures_with_teachings}")
        
        # Sample of religious figures
        print("\nSample data (first 3 religious figures):")
        for i, figure in enumerate(all_data[:3]):
            print(f"\n{i+1}. {figure['name']} ({figure['id']})")
            
            if figure['religions']:
                print(f"   Religion(s):")
                for religion in figure['religions'][:5]:
                    print(f"      - {religion}")
                if len(figure['religions']) > 5:
                    print(f"      - ... and {len(figure['religions']) - 5} more")
            
            if figure['denominations']:
                print(f"   Denomination(s):")
                for denomination in figure['denominations'][:5]:
                    print(f"      - {denomination}")
                if len(figure['denominations']) > 5:
                    print(f"      - ... and {len(figure['denominations']) - 5} more")
            
            if figure['titles']:
                print(f"   Title(s):")
                for title in figure['titles'][:5]:
                    print(f"      - {title}")
                if len(figure['titles']) > 5:
                    print(f"      - ... and {len(figure['titles']) - 5} more")
            
            if figure['published_teachings']:
                print(f"   Published Teachings:")
                for teaching in figure['published_teachings'][:5]:
                    year_info = f" ({teaching['year']})" if teaching['year'] else ""
                    print(f"      - {teaching['title']}{year_info}")
                if len(figure['published_teachings']) > 5:
                    print(f"      - ... and {len(figure['published_teachings']) - 5} more teachings")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['religions'] = df_for_csv['religions'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['denominations'] = df_for_csv['denominations'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['titles'] = df_for_csv['titles'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['published_teachings'] = df_for_csv['published_teachings'].apply(
                lambda teachings: ', '.join([f"{t['title']}{' ('+t['year']+')' if t['year'] else ''}" for t in teachings]) if teachings else ''
            )
            df_for_csv.to_csv("partial_religion_figures_data.csv", index=False)
            with open("partial_religion_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} religious figures)")
    
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