import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_academia_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for academia and thought leadership public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for academia figures
    query = f"""
    SELECT ?person ?personLabel ?institutionLabel ?fieldOfStudyLabel 
    WHERE {{
      ?person wdt:P106/wdt:P279* wd:Q1622272. # occupation: academic
      
      # Institution
      OPTIONAL {{ ?person wdt:P108 ?institution. }}
      
      # Field of Study
      OPTIONAL {{ ?person wdt:P101 ?fieldOfStudy. }}
      
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
                return query_wikidata_academia_figures(limit // 2, offset, user_agent)
        return []

def get_published_papers(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get published papers for a specific academic
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?paperLabel ?date
    WHERE {{
      ?paper wdt:P50 wd:{person_id}. # works where person is author
      OPTIONAL {{ ?paper wdt:P577 ?date. }} # publication date
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            papers_data = []
            
            for result in results["results"]["bindings"]:
                paper_name = result.get("paperLabel", {}).get("value", "")
                pub_date = result.get("date", {}).get("value", "")
                
                if paper_name:
                    # Format date if available (extract year only)
                    if pub_date and len(pub_date) >= 4:
                        pub_date = pub_date[:4]  # Get just the year
                    
                    papers_data.append({
                        "title": paper_name,
                        "year": pub_date
                    })
            
            return papers_data
        
        except Exception as e:
            print(f"Error getting published papers for {person_id}: {e}")
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
            "institution": result.get("institutionLabel", {}).get("value", ""),
            "field_of_study": result.get("fieldOfStudyLabel", {}).get("value", ""),
            "published_papers": []  # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting academia figures data from Wikidata...")
    
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
                    batch = query_wikidata_academia_figures(batch_size, offset, user_agent)
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
            
            for i, academic in enumerate(processed_batch):
                print(f"  Getting published papers for {academic['name']} ({i+1}/{len(processed_batch)})...")
                
                # Exponential back-off for papers data retrieval
                retry_count = 0
                base_wait_time = 1
                max_papers_retries = 3
                
                while retry_count < max_papers_retries:
                    try:
                        papers_data = get_published_papers(academic["id"], user_agent=user_agent)
                        processed_batch[i]["published_papers"] = papers_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_papers_retries:
                            print(f"Failed to retrieve papers data after {max_papers_retries} attempts. Skipping.")
                            processed_batch[i]["published_papers"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving papers data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_papers_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between academics
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total academics: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the published_papers field
        csv_file = "academia_figures_data.csv"
        df_for_csv = df.copy()
        df_for_csv['published_papers'] = df_for_csv['published_papers'].apply(
            lambda papers: ', '.join([f"{p['title']}{' ('+p['year']+')' if p['year'] else ''}" for p in papers]) if papers else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "academia_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total academics: {len(all_data)}")
        
        # Count institutions
        institutions = [academic['institution'] for academic in all_data if academic['institution']]
        print(f"Academics with institution info: {len(institutions)}")
        
        # Count academics with papers
        academics_with_papers = sum(1 for academic in all_data if academic['published_papers'])
        print(f"Academics with published papers: {academics_with_papers}")
        
        # Sample of academics
        print("\nSample data (first 3 academics):")
        for i, academic in enumerate(all_data[:3]):
            print(f"\n{i+1}. {academic['name']} ({academic['id']})")
            print(f"   Institution: {academic['institution']}")
            print(f"   Field of Study: {academic['field_of_study']}")
            if academic['published_papers']:
                print(f"   Published Papers:")
                for paper in academic['published_papers'][:5]:  # Show up to 5 papers
                    year_info = f" ({paper['year']})" if paper['year'] else ""
                    print(f"      - {paper['title']}{year_info}")
                if len(academic['published_papers']) > 5:
                    print(f"      - ... and {len(academic['published_papers']) - 5} more papers")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['published_papers'] = df_for_csv['published_papers'].apply(
                lambda papers: ', '.join([f"{p['title']}{' ('+p['year']+')' if p['year'] else ''}" for p in papers]) if papers else ''
            )
            df_for_csv.to_csv("partial_academia_figures_data.csv", index=False)
            with open("partial_academia_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} academics)")
    
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