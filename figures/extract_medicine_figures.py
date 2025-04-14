import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_medicine_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for medicine and health public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for medicine and health figures
    query = f"""
    SELECT DISTINCT ?person ?personLabel 
    WHERE {{
      # Find medicine and health figures with broader definition
      {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q39631.  # occupation: physician
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q774306.  # occupation: surgeon
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q29182.  # occupation: psychiatrist
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q30093123.  # occupation: medical specialist
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q834851.  # occupation: pediatrician
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q212525.  # occupation: cardiologist
      }} UNION {{
        ?person wdt:P106 ?occupation.
        ?occupation wdt:P279* wd:Q19971701.  # occupation: medical researcher
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
                return query_wikidata_medicine_figures(limit // 2, offset, user_agent)
        return []

def get_specialty_and_practice(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get medical specialty and practice location for a specific medical figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?specialtyLabel ?practiceLabel
    WHERE {{
      # Medical specialty
      OPTIONAL {{
        {{
          wd:{person_id} wdt:P101 ?specialty.  # field of work
        }} UNION {{
          wd:{person_id} wdt:P425 ?specialty.  # field of specialization
        }} UNION {{
          wd:{person_id} wdt:P106 ?specialty.
          ?specialty wdt:P279* wd:Q30093123.  # medical specialist
        }}
      }}
      
      # Practice location (employer or workplace)
      OPTIONAL {{
        {{
          wd:{person_id} wdt:P108 ?practice.  # employer
        }} UNION {{
          wd:{person_id} wdt:P937 ?practice.  # work location
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
            specialties = []
            practices = []
            
            for result in results["results"]["bindings"]:
                specialty = result.get("specialtyLabel", {}).get("value", "")
                if specialty and specialty not in specialties:
                    specialties.append(specialty)
                
                practice = result.get("practiceLabel", {}).get("value", "")
                if practice and practice not in practices:
                    practices.append(practice)
            
            return specialties, practices
        
        except Exception as e:
            print(f"Error getting specialty and practice for {person_id}: {e}")
            time.sleep(2)
    
    return [], []

def get_books(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get books authored by a specific medical figure
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?bookLabel ?dateLabel
    WHERE {{
      # Books authored by person
      ?book wdt:P50 wd:{person_id}.  # author
      ?book wdt:P31/wdt:P279* wd:Q571.  # instance of book
      
      # Publication date
      OPTIONAL {{ ?book wdt:P577 ?date. }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            books_data = []
            
            for result in results["results"]["bindings"]:
                book_title = result.get("bookLabel", {}).get("value", "")
                pub_date = result.get("dateLabel", {}).get("value", "")
                
                if book_title:
                    # Format date if available (extract year only)
                    if pub_date and len(pub_date) >= 4:
                        pub_date = pub_date[:4]  # Get just the year
                    
                    books_data.append({
                        "title": book_title,
                        "year": pub_date
                    })
            
            return books_data
        
        except Exception as e:
            print(f"Error getting books for {person_id}: {e}")
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
            "specialties": [],  # Will be populated separately
            "practices": [],  # Will be populated separately
            "books": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting medicine figures data from Wikidata...")
    
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
                    batch = query_wikidata_medicine_figures(batch_size, offset, user_agent)
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
            
            for i, medical_figure in enumerate(processed_batch):
                print(f"  Getting data for {medical_figure['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get specialty and practice
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        specialties, practices = get_specialty_and_practice(medical_figure["id"], user_agent=user_agent)
                        processed_batch[i]["specialties"] = specialties
                        processed_batch[i]["practices"] = practices
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve specialty and practice after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving specialty and practice: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                # Get books
                retry_count = 0
                while retry_count < max_retries:
                    try:
                        books_data = get_books(medical_figure["id"], user_agent=user_agent)
                        processed_batch[i]["books"] = books_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve books after {max_retries} attempts. Skipping.")
                            processed_batch[i]["books"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving books: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between medical figures
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total medical figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "medicine_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['specialties'] = df_for_csv['specialties'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['practices'] = df_for_csv['practices'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['books'] = df_for_csv['books'].apply(
            lambda books: ', '.join([f"{b['title']}{' ('+b['year']+')' if b['year'] else ''}" for b in books]) if books else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "medicine_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total medical figures: {len(all_data)}")
        
        # Count figures with specialty info
        figures_with_specialty = sum(1 for figure in all_data if figure['specialties'])
        print(f"Figures with specialty info: {figures_with_specialty}")
        
        # Count figures with practice info
        figures_with_practice = sum(1 for figure in all_data if figure['practices'])
        print(f"Figures with practice info: {figures_with_practice}")
        
        # Count figures with books
        figures_with_books = sum(1 for figure in all_data if figure['books'])
        print(f"Figures with books: {figures_with_books}")
        
        # Sample of medical figures
        print("\nSample data (first 3 medical figures):")
        for i, figure in enumerate(all_data[:3]):
            print(f"\n{i+1}. {figure['name']} ({figure['id']})")
            
            if figure['specialties']:
                print(f"   Specialty/Specialties:")
                for specialty in figure['specialties'][:5]:
                    print(f"      - {specialty}")
                if len(figure['specialties']) > 5:
                    print(f"      - ... and {len(figure['specialties']) - 5} more")
            
            if figure['practices']:
                print(f"   Practice(s):")
                for practice in figure['practices'][:5]:
                    print(f"      - {practice}")
                if len(figure['practices']) > 5:
                    print(f"      - ... and {len(figure['practices']) - 5} more")
            
            if figure['books']:
                print(f"   Books:")
                for book in figure['books'][:5]:
                    year_info = f" ({book['year']})" if book['year'] else ""
                    print(f"      - {book['title']}{year_info}")
                if len(figure['books']) > 5:
                    print(f"      - ... and {len(figure['books']) - 5} more books")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['specialties'] = df_for_csv['specialties'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['practices'] = df_for_csv['practices'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['books'] = df_for_csv['books'].apply(
                lambda books: ', '.join([f"{b['title']}{' ('+b['year']+')' if b['year'] else ''}" for b in books]) if books else ''
            )
            df_for_csv.to_csv("partial_medicine_figures_data.csv", index=False)
            with open("partial_medicine_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} medical figures)")
    
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