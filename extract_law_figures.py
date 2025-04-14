import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_law_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for law and justice public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for law and justice figures
    query = f"""
    SELECT DISTINCT ?person ?personLabel 
    WHERE {{
      # Find law and justice figures with broader definition
      {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q16533.  # occupation: judge
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q40348.  # occupation: lawyer
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q185351.  # occupation: attorney general
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q1071027.  # occupation: jurist
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q4328080.  # occupation: justice
      }} UNION {{
        ?person wdt:P39 ?position.
        ?position wdt:P279* wd:Q1752346.  # position of justice/judge
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
                return query_wikidata_law_figures(limit // 2, offset, user_agent)
        return []

def get_court_and_practice_area(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get court and practice area for a specific legal figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?courtLabel ?practiceAreaLabel
    WHERE {{
      # Court (employer, or position held at)
      {{
        wd:{person_id} wdt:P108 ?court.
        ?court wdt:P31/wdt:P279* wd:Q41487.  # instance of court
      }} UNION {{
        wd:{person_id} wdt:P39 ?position.
        ?position wdt:P642 ?court.  # "of" qualifier pointing to court
        ?court wdt:P31/wdt:P279* wd:Q41487.  # instance of court
      }}
      
      # Practice Area (field of work/field of expertise)
      OPTIONAL {{ 
        {{
          wd:{person_id} wdt:P101 ?practiceArea.  # field of work
        }} UNION {{
          wd:{person_id} wdt:P425 ?practiceArea.  # field of specialization
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
            courts = []
            practice_areas = []
            
            for result in results["results"]["bindings"]:
                court = result.get("courtLabel", {}).get("value", "")
                if court and court not in courts:
                    courts.append(court)
                
                practice_area = result.get("practiceAreaLabel", {}).get("value", "")
                if practice_area and practice_area not in practice_areas:
                    practice_areas.append(practice_area)
            
            return courts, practice_areas
        
        except Exception as e:
            print(f"Error getting court and practice area for {person_id}: {e}")
            time.sleep(2)
    
    return [], []

def get_landmark_cases(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get landmark cases for a specific legal figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?caseLabel ?dateLabel ?roleLabel
    WHERE {{
      # Cases where the person was involved
      {{
        ?case wdt:P1344 wd:{person_id}.  # case involves person
        OPTIONAL {{ ?case wdt:P585 ?date. }}  # date
      }} UNION {{
        ?case wdt:P1196 wd:{person_id}.  # person is key person
        ?case wdt:P31/wdt:P279* wd:Q2334719.  # instance of court case
        OPTIONAL {{ ?case wdt:P585 ?date. }}  # date
      }} UNION {{
        wd:{person_id} p:P39 ?statement.  # position held statement
        ?statement ps:P39 ?position.
        ?statement pq:P793 ?case.  # significant event
        ?case wdt:P31/wdt:P279* wd:Q2334719.  # instance of court case
        OPTIONAL {{ ?case wdt:P585 ?date. }}  # date
      }}
      
      # Role in the case
      OPTIONAL {{ ?case wdt:P1552 ?role. }}  # role
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            cases_data = []
            
            for result in results["results"]["bindings"]:
                case_name = result.get("caseLabel", {}).get("value", "")
                case_date = result.get("dateLabel", {}).get("value", "")
                case_role = result.get("roleLabel", {}).get("value", "")
                
                if case_name:
                    # Format date if available (extract year only)
                    if case_date and len(case_date) >= 4:
                        case_date = case_date[:4]  # Get just the year
                    
                    cases_data.append({
                        "case": case_name,
                        "year": case_date,
                        "role": case_role
                    })
            
            return cases_data
        
        except Exception as e:
            print(f"Error getting landmark cases for {person_id}: {e}")
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
            "courts": [],  # Will be populated separately
            "practice_areas": [],  # Will be populated separately
            "landmark_cases": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting law figures data from Wikidata...")
    
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
                    batch = query_wikidata_law_figures(batch_size, offset, user_agent)
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
            
            for i, legal_figure in enumerate(processed_batch):
                print(f"  Getting data for {legal_figure['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get court and practice area
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        courts, practice_areas = get_court_and_practice_area(legal_figure["id"], user_agent=user_agent)
                        processed_batch[i]["courts"] = courts
                        processed_batch[i]["practice_areas"] = practice_areas
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve court and practice area after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving court and practice area: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                # Get landmark cases
                retry_count = 0
                while retry_count < max_retries:
                    try:
                        cases_data = get_landmark_cases(legal_figure["id"], user_agent=user_agent)
                        processed_batch[i]["landmark_cases"] = cases_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve landmark cases after {max_retries} attempts. Skipping.")
                            processed_batch[i]["landmark_cases"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving landmark cases: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between legal figures
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total legal figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "law_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['courts'] = df_for_csv['courts'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['practice_areas'] = df_for_csv['practice_areas'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['landmark_cases'] = df_for_csv['landmark_cases'].apply(
            lambda cases: ', '.join([f"{c['case']}{' ('+c['year']+')' if c['year'] else ''}{' - '+c['role'] if c['role'] else ''}" for c in cases]) if cases else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "law_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total legal figures: {len(all_data)}")
        
        # Count figures with court info
        figures_with_court = sum(1 for figure in all_data if figure['courts'])
        print(f"Figures with court info: {figures_with_court}")
        
        # Count figures with practice area info
        figures_with_practice = sum(1 for figure in all_data if figure['practice_areas'])
        print(f"Figures with practice area info: {figures_with_practice}")
        
        # Count figures with landmark cases
        figures_with_cases = sum(1 for figure in all_data if figure['landmark_cases'])
        print(f"Figures with landmark cases: {figures_with_cases}")
        
        # Sample of legal figures
        print("\nSample data (first 3 legal figures):")
        for i, figure in enumerate(all_data[:3]):
            print(f"\n{i+1}. {figure['name']} ({figure['id']})")
            
            if figure['courts']:
                print(f"   Court(s):")
                for court in figure['courts'][:5]:
                    print(f"      - {court}")
                if len(figure['courts']) > 5:
                    print(f"      - ... and {len(figure['courts']) - 5} more")
            
            if figure['practice_areas']:
                print(f"   Practice Area(s):")
                for area in figure['practice_areas'][:5]:
                    print(f"      - {area}")
                if len(figure['practice_areas']) > 5:
                    print(f"      - ... and {len(figure['practice_areas']) - 5} more")
            
            if figure['landmark_cases']:
                print(f"   Landmark Cases:")
                for case in figure['landmark_cases'][:5]:
                    year_info = f" ({case['year']})" if case['year'] else ""
                    role_info = f" - {case['role']}" if case['role'] else ""
                    print(f"      - {case['case']}{year_info}{role_info}")
                if len(figure['landmark_cases']) > 5:
                    print(f"      - ... and {len(figure['landmark_cases']) - 5} more cases")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['courts'] = df_for_csv['courts'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['practice_areas'] = df_for_csv['practice_areas'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['landmark_cases'] = df_for_csv['landmark_cases'].apply(
                lambda cases: ', '.join([f"{c['case']}{' ('+c['year']+')' if c['year'] else ''}{' - '+c['role'] if c['role'] else ''}" for c in cases]) if cases else ''
            )
            df_for_csv.to_csv("partial_law_figures_data.csv", index=False)
            with open("partial_law_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} legal figures)")
    
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