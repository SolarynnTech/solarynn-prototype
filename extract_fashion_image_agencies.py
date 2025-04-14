import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_fashion_image_agencies(limit=10, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for fashion and image agencies - simplified version to avoid timeouts
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    sparql.setTimeout(180)  # 3 minutes timeout
    
    # Use a simpler direct query instead of multiple complex ones
    query = f"""
    SELECT DISTINCT ?entity ?entityLabel 
    WHERE {{
      # Use UNION to get various types of agencies with better filters
      {{
        # Fashion model agencies - with fashion label filter
        ?entity wdt:P31 wd:Q1194769.
        ?entity rdfs:label ?label.
        FILTER(CONTAINS(LCASE(?label), "model") || CONTAINS(LCASE(?label), "fashion") || CONTAINS(LCASE(?label), "agency"))
      }} UNION {{
        # Companies with fashion as industry
        ?entity wdt:P31/wdt:P279* wd:Q783794.  # company
        ?entity wdt:P452 wd:Q12684.  # industry = fashion
      }} UNION {{
        # Fashion houses with fashion label filter
        ?entity wdt:P31 wd:Q3661311.
        ?entity rdfs:label ?label.
        FILTER(CONTAINS(LCASE(?label), "fashion") || CONTAINS(LCASE(?label), "style") || CONTAINS(LCASE(?label), "model"))
      }} UNION {{
        # Photography studios with photo label filter 
        ?entity wdt:P31 wd:Q2061186.
        ?entity rdfs:label ?label.
        FILTER(CONTAINS(LCASE(?label), "photo") || CONTAINS(LCASE(?label), "image") || CONTAINS(LCASE(?label), "studio"))
      }}
      
      # Ensure it has a label in English
      ?entity rdfs:label ?englabel.
      FILTER(LANG(?englabel) = "en")
      
      # Remove non-relevant entities
      FILTER(!REGEX(?englabel, "(church|religious|christian|catholic)", "i"))
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    ORDER BY ?entityLabel
    LIMIT {limit}
    OFFSET {offset}
    """
    
    for retry in range(5):
        try:
            current_limit = limit
            if retry > 0:
                # Reduce batch size on retries
                current_limit = max(3, limit // (2 * retry))
                query = query.replace(f"LIMIT {limit}", f"LIMIT {current_limit}")
                
            print(f"Querying with improved query, batch size {current_limit}...")
            sparql.setQuery(query)
            sparql.setReturnFormat(JSON)
            results = sparql.query().convert()
            
            if "results" in results and "bindings" in results["results"]:
                print(f"Retrieved {len(results['results']['bindings'])} results")
                return results["results"]["bindings"]
            return []
            
        except Exception as e:
            print(f"Error querying Wikidata: {e}")
            wait_time = 10 * (retry + 1)
            print(f"Retrying in {wait_time} seconds (attempt {retry+1}/5)...")
            time.sleep(wait_time)
    
    # If all retries failed
    print("All query attempts failed. Returning empty results.")
    return []

def get_entity_details(entity_id, max_retries=5, user_agent="WikiDataExtract/1.0"):
    """
    Get entity details directly from the Wikidata API instead of SPARQL
    """
    # Initialize result containers
    service_types = []
    industries_served = []
    locations = []
    clients = []
    founding_date = None
    dissolution_date = None
    website = None
    featured_work = []
    platform_integrations = []
    
    # Wikidata API endpoint
    api_url = f"https://www.wikidata.org/wiki/Special:EntityData/{entity_id}.json"
    
    # Property ID mappings for relevant data
    property_mappings = {
        "P31": "instance of",  # Instance of
        "P279": "subclass of",  # Subclass of
        "P452": "industry",  # Industry
        "P101": "field of work",  # Field of work
        "P1056": "product",  # Product
        "P17": "country",  # Country
        "P159": "headquarters",  # Headquarters location
        "P276": "location",  # Location
        "P131": "located in",  # Located in administrative entity
        "P856": "website",  # Official website
        "P571": "inception",  # Inception date
        "P576": "dissolution",  # Dissolution date
        "P366": "software used",  # Software used
        "P127": "owned by",  # Owned by
        "P749": "parent org",  # Parent organization
        "P166": "award",  # Award received
        "P2218": "client of",  # Client of
        "P1830": "owner of",  # Owner of
    }
    
    # Helper function to get entity label
    def get_entity_label(entity_id, retry_count=0):
        if retry_count >= 3:
            return entity_id  # Return ID after too many retries
            
        try:
            label_url = f"https://www.wikidata.org/wiki/Special:EntityData/{entity_id}.json"
            response = requests.get(label_url, headers={"User-Agent": user_agent, "Accept": "application/json"})
            response.raise_for_status()
            label_data = response.json()
            
            if "entities" in label_data and entity_id in label_data["entities"]:
                entity = label_data["entities"][entity_id]
                if "labels" in entity and "en" in entity["labels"]:
                    return entity["labels"]["en"]["value"]
            
            return entity_id  # Return ID if no label found
            
        except Exception as e:
            print(f"  Error getting label for {entity_id}: {e}")
            time.sleep(2)
            return get_entity_label(entity_id, retry_count + 1)
    
    for retry in range(max_retries):
        try:
            print(f"  Fetching entity data for {entity_id} via Wikidata API...")
            
            headers = {
                "User-Agent": user_agent,
                "Accept": "application/json"
            }
            
            response = requests.get(api_url, headers=headers)
            response.raise_for_status()  # Raise exception for HTTP errors
            
            data = response.json()
            
            if "entities" in data and entity_id in data["entities"]:
                entity_data = data["entities"][entity_id]
                
                # Extract labels
                if "labels" in entity_data and "en" in entity_data["labels"]:
                    entity_name = entity_data["labels"]["en"]["value"]
                    print(f"  Processing data for: {entity_name}")
                
                # Extract claims (properties)
                if "claims" in entity_data:
                    claims = entity_data["claims"]
                    
                    # Process each relevant property
                    for prop_id, category in property_mappings.items():
                        if prop_id in claims:
                            for claim in claims[prop_id]:
                                if "mainsnak" in claim and "datavalue" in claim["mainsnak"]:
                                    datavalue = claim["mainsnak"]["datavalue"]
                                    
                                    if datavalue["type"] == "wikibase-entityid":
                                        # Entity value - need to get the label with a separate API call
                                        value_id = datavalue["value"]["id"]
                                        value = get_entity_label(value_id)
                                            
                                    elif datavalue["type"] == "string":
                                        value = datavalue["value"]
                                    elif datavalue["type"] == "time":
                                        value = datavalue["value"]["time"]
                                        # Clean up time format
                                        if value.startswith("+"):
                                            value = value[1:]
                                        if "T" in value:
                                            value = value.split("T")[0]
                                    else:
                                        continue  # Skip other types
                                    
                                    # Add value to appropriate category
                                    if category == "instance of" or category == "subclass of":
                                        if value not in service_types:
                                            service_types.append(value)
                                    elif category == "industry" or category == "field of work":
                                        if value not in industries_served:
                                            industries_served.append(value)
                                    elif category == "country" or category == "headquarters" or category == "location" or category == "located in":
                                        if value not in locations:
                                            locations.append(value)
                                    elif category == "product":
                                        if value not in featured_work:
                                            featured_work.append(value)
                                    elif category == "software used":
                                        if value not in platform_integrations:
                                            platform_integrations.append(value)
                                    elif category == "website":
                                        website = value
                                    elif category == "inception":
                                        founding_date = value
                                    elif category == "dissolution":
                                        dissolution_date = value
                                    elif category == "owned by" and value not in service_types:
                                        service_types.append(f"Owned by: {value}")
                                    elif category == "parent org" and value not in service_types:
                                        service_types.append(f"Part of: {value}")
                                    elif category == "award" and value not in featured_work:
                                        featured_work.append(f"Award: {value}")
                                    elif category == "client of" and value not in clients:
                                        clients.append(value)
                                    elif category == "owner of" and value not in featured_work:
                                        featured_work.append(f"Owns: {value}")
                
                # Format the years active
                years_active = None
                if founding_date:
                    if dissolution_date:
                        years_active = f"{founding_date} - {dissolution_date}"
                    else:
                        years_active = f"{founding_date} - present"
                
                total_data_points = len(service_types) + len(industries_served) + len(locations) + len(clients) + len(featured_work) + len(platform_integrations)
                print(f"  Retrieved {total_data_points} data points for entity {entity_id}")
                
                return service_types, industries_served, locations, clients, years_active, website, featured_work, platform_integrations
            else:
                print(f"  Entity {entity_id} not found in Wikidata API response")
            
        except Exception as e:
            wait_time = 5 * (retry + 1)
            print(f"  Error getting entity details for {entity_id}: {e}")
            print(f"  Retrying in {wait_time} seconds (attempt {retry+1}/{max_retries})...")
            time.sleep(wait_time)
    
    # Return empty data if all retries failed
    print(f"  Failed to get details for {entity_id} after {max_retries} attempts")
    return [], [], [], [], None, None, [], []

def process_results(results):
    """
    Process the query results into a structured format
    """
    processed_data = []
    
    for result in results:
        entity_uri = result.get("entity", {}).get("value", "")
        if not entity_uri:
            continue
            
        entity_id = entity_uri.split("/")[-1]
        
        entity_data = {
            "id": entity_id,
            "agency_name": result.get("entityLabel", {}).get("value", "Unknown"),
            "service_types": [],
            "industries_served": [],
            "locations": [],
            "top_clients": [],
            "years_active": None,
            "website": None,
            "featured_work": [],
            "platform_integrations": []
        }
        
        processed_data.append(entity_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting fashion and image agencies from Wikidata...")
    
    try:
        for batch_num in range(start_batch, max_batches):
            offset = batch_num * batch_size
            print(f"Retrieving batch {batch_num+1}/{max_batches} (offset {offset})...")
            
            # Exponential backoff for batch retrieval
            max_retries = 5
            retry_count = 0
            base_wait_time = 5
            current_batch_size = batch_size
            
            batch = None
            while retry_count < max_retries:
                try:
                    # Adjust offset and limit for retry attempts
                    current_offset = offset + (0 if batch is None else len(batch))
                    print(f"Querying with offset {current_offset}, batch size {current_batch_size}...")
                    
                    batch = query_wikidata_fashion_image_agencies(current_batch_size, current_offset, user_agent)
                    if not batch:
                        print("No results returned for this batch query. Stopping.")
                        break
                    break  # Success, exit retry loop
                except Exception as e:
                    retry_count += 1
                    if retry_count >= max_retries:
                        print(f"Failed to retrieve batch after {max_retries} attempts. Skipping to next batch.")
                        batch = []
                        break
                    
                    # Reduce batch size on retries
                    current_batch_size = max(3, current_batch_size // 2)
                    wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential backoff
                    print(f"Error retrieving batch: {e}. Retrying in {wait_time} seconds with reduced batch size {current_batch_size} (attempt {retry_count}/{max_retries})...")
                    time.sleep(wait_time)
            
            if not batch:
                print("Moving to next batch...")
                continue
                
            processed_batch = process_results(batch)
            print(f"Processing {len(processed_batch)} entities in batch {batch_num+1}...")
            
            for i, entity in enumerate(processed_batch):
                print(f"  Getting data for {entity['agency_name']} ({i+1}/{len(processed_batch)})...")
                
                # Get entity details with improved error handling
                retry_count = 0
                max_entity_retries = 3
                while retry_count < max_entity_retries:
                    try:
                        service_types, industries_served, locations, clients, years_active, website, featured_work, platform_integrations = get_entity_details(entity["id"], user_agent=user_agent)
                        processed_batch[i]["service_types"] = service_types
                        processed_batch[i]["industries_served"] = industries_served
                        processed_batch[i]["locations"] = locations
                        processed_batch[i]["top_clients"] = clients
                        processed_batch[i]["years_active"] = years_active
                        processed_batch[i]["website"] = website
                        processed_batch[i]["featured_work"] = featured_work
                        processed_batch[i]["platform_integrations"] = platform_integrations
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        wait_time = 5 * retry_count
                        print(f"Error getting entity details for {entity['agency_name']} (ID: {entity['id']}): {e}")
                        
                        if retry_count >= max_entity_retries:
                            print(f"Failed to get details after {max_entity_retries} attempts. Skipping entity.")
                            break
                            
                        print(f"Retrying in {wait_time} seconds (attempt {retry_count}/{max_entity_retries})...")
                        time.sleep(wait_time)
                
                # Delay between entities - longer delay to avoid timeouts
                time.sleep(5)  # Increased from 3 to 5 seconds
            
            all_data.extend(processed_batch)
            print(f"Successfully retrieved {len(processed_batch)} records in batch {batch_num+1}")
            
            # Check for early termination if less than expected results
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Save incremental results after each batch
            if all_data:
                try:
                    with open(f"incremental_batch_{batch_num+1}.json", 'w', encoding='utf-8') as f:
                        json.dump(all_data, f, ensure_ascii=False, indent=2)
                    print(f"Incremental data saved ({len(all_data)} agencies) to incremental_batch_{batch_num+1}.json")
                except Exception as e:
                    print(f"Warning: Could not save incremental data: {e}")
            
            # Longer delay between batches to avoid timeouts
            wait_time = 15  # Increased from 10 to 15 seconds
            print(f"Waiting {wait_time} seconds before next batch...")
            time.sleep(wait_time)
        
        print(f"\nProcessing complete. Total fashion and image agencies: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "fashion_image_agencies_data.csv"
        df_for_csv = df.copy()
        df_for_csv['service_types'] = df_for_csv['service_types'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['industries_served'] = df_for_csv['industries_served'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['locations'] = df_for_csv['locations'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['top_clients'] = df_for_csv['top_clients'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['featured_work'] = df_for_csv['featured_work'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['platform_integrations'] = df_for_csv['platform_integrations'].apply(lambda x: ', '.join(x) if x else '')
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "fashion_image_agencies_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total fashion and image agencies: {len(all_data)}")
        
        # Count entities with service type info
        entities_with_service_type = sum(1 for entity in all_data if entity['service_types'])
        print(f"Agencies with service type info: {entities_with_service_type}")
        
        # Count entities with industry info
        entities_with_industry = sum(1 for entity in all_data if entity['industries_served'])
        print(f"Agencies with industry info: {entities_with_industry}")
        
        # Count entities with location info
        entities_with_location = sum(1 for entity in all_data if entity['locations'])
        print(f"Agencies with location info: {entities_with_location}")
        
        # Count entities with client info
        entities_with_clients = sum(1 for entity in all_data if entity['top_clients'])
        print(f"Agencies with client info: {entities_with_clients}")
        
        # Count entities with years active info
        entities_with_years = sum(1 for entity in all_data if entity['years_active'])
        print(f"Agencies with years active info: {entities_with_years}")
        
        # Count entities with website info
        entities_with_website = sum(1 for entity in all_data if entity['website'])
        print(f"Agencies with website info: {entities_with_website}")
        
        # Count entities with featured work info
        entities_with_work = sum(1 for entity in all_data if entity['featured_work'])
        print(f"Agencies with featured work info: {entities_with_work}")
        
        # Count entities with platform integration info
        entities_with_platforms = sum(1 for entity in all_data if entity['platform_integrations'])
        print(f"Agencies with platform integration info: {entities_with_platforms}")
        
        # Sample of agencies
        print("\nSample data (first 3 fashion/image agencies):")
        for i, entity in enumerate(all_data[:3]):
            print(f"\n{i+1}. {entity['agency_name']} ({entity['id']})")
            
            if entity['service_types']:
                print(f"   Service Type(s):")
                for service in entity['service_types'][:5]:
                    print(f"      - {service}")
                if len(entity['service_types']) > 5:
                    print(f"      - ... and {len(entity['service_types']) - 5} more")
            
            if entity['industries_served']:
                print(f"   Industries Served:")
                for industry in entity['industries_served'][:5]:
                    print(f"      - {industry}")
                if len(entity['industries_served']) > 5:
                    print(f"      - ... and {len(entity['industries_served']) - 5} more")
            
            if entity['locations']:
                print(f"   Location(s):")
                for location in entity['locations'][:5]:
                    print(f"      - {location}")
                if len(entity['locations']) > 5:
                    print(f"      - ... and {len(entity['locations']) - 5} more")
            
            if entity['top_clients']:
                print(f"   Top Clients:")
                for client in entity['top_clients'][:5]:
                    print(f"      - {client}")
                if len(entity['top_clients']) > 5:
                    print(f"      - ... and {len(entity['top_clients']) - 5} more")
            
            if entity['years_active']:
                print(f"   Years Active: {entity['years_active']}")
            
            if entity['website']:
                print(f"   Website: {entity['website']}")
            
            if entity['featured_work']:
                print(f"   Featured Work:")
                for work in entity['featured_work'][:5]:
                    print(f"      - {work}")
                if len(entity['featured_work']) > 5:
                    print(f"      - ... and {len(entity['featured_work']) - 5} more")
            
            if entity['platform_integrations']:
                print(f"   Platform Integrations:")
                for platform in entity['platform_integrations'][:5]:
                    print(f"      - {platform}")
                if len(entity['platform_integrations']) > 5:
                    print(f"      - ... and {len(entity['platform_integrations']) - 5} more")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['service_types'] = df_for_csv['service_types'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['industries_served'] = df_for_csv['industries_served'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['locations'] = df_for_csv['locations'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['top_clients'] = df_for_csv['top_clients'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['featured_work'] = df_for_csv['featured_work'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['platform_integrations'] = df_for_csv['platform_integrations'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv.to_csv("partial_fashion_image_agencies_data.csv", index=False)
            with open("partial_fashion_image_agencies_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} fashion/image agencies)")
    
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
    # Use more conservative values to avoid timeout issues
    # Small batch size, fewer batches, longer delays between operations
    main(max_batches=3, batch_size=5, start_batch=0) 