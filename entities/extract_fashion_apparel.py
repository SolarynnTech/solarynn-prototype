import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_fashion_apparel(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for fashion and apparel entities
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for fashion and apparel entities
    query = f"""
    SELECT DISTINCT ?entity ?entityLabel 
    WHERE {{
      # Target fashion and apparel entities
      {{
        # Fashion brands
        ?entity wdt:P31 wd:Q431289.  # instance of brand
        ?entity wdt:P452 wd:Q28709433.  # fashion industry
      }} UNION {{
        # Fashion companies
        ?entity wdt:P31 wd:Q783794.  # instance of company
        ?entity wdt:P452 wd:Q28709433.  # fashion industry
      }} UNION {{
        # Clothing companies
        ?entity wdt:P31 wd:Q783794.  # instance of company
        ?entity wdt:P452 wd:Q11761202.  # clothing industry
      }} UNION {{
        # Fashion houses
        ?entity wdt:P31 wd:Q10843635.  # fashion house
      }} UNION {{
        # Sportswear brands
        ?entity wdt:P31 wd:Q431289.  # instance of brand
        ?entity wdt:P452 wd:Q211906.  # sport industry
        ?entity wdt:P1056/wdt:P279* wd:Q11460.  # product: clothing
      }} UNION {{
        # Textile companies related to apparel
        ?entity wdt:P31 wd:Q783794.  # instance of company
        ?entity wdt:P452 wd:Q28709433.  # fashion industry
        ?entity wdt:P452 wd:Q28823952.  # textile industry
      }} UNION {{
        # Clothing retailers
        ?entity wdt:P31 wd:Q783794.  # instance of company
        ?entity wdt:P452 wd:Q1412392.  # retail industry
        ?entity wdt:P1056/wdt:P279* wd:Q11460.  # product: clothing
      }} UNION {{
        # Footwear companies
        ?entity wdt:P31 wd:Q783794.  # instance of company
        ?entity wdt:P452 wd:Q1516358.  # footwear industry
      }} UNION {{
        # Companies with 'fashion' or 'apparel' in description
        ?entity wdt:P31 wd:Q783794.  # instance of company
        ?entity schema:description ?description.
        FILTER(
          CONTAINS(LCASE(?description), "fashion") || 
          CONTAINS(LCASE(?description), "apparel") ||
          CONTAINS(LCASE(?description), "clothing")
        )
        FILTER(LANG(?description) = "en")
      }}
      
      # Ensure it has some basic information
      ?entity rdfs:label ?label.
      FILTER(LANG(?label) = "en")
      
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
                return query_wikidata_fashion_apparel(limit // 2, offset, user_agent)
        return []

def get_entity_details(entity_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get details for a specific fashion/apparel entity
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?brandTypeLabel ?industrySectorLabel ?headquartersLabel ?established ?revenue ?website
    WHERE {{
      # Brand Type
      OPTIONAL {{
        wd:{entity_id} wdt:P31 ?brandType.
      }}
      
      # Industry Sector
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P452 ?industrySector.  # Industry
        }} UNION {{
          wd:{entity_id} wdt:P1056 ?industrySector.  # Product type
        }} UNION {{
          wd:{entity_id} wdt:P366 ?industrySector.  # Use
        }}
      }}
      
      # Headquarters Location
      OPTIONAL {{
        wd:{entity_id} wdt:P159 ?headquarters.
      }}
      
      # Year Established
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P571 ?established.  # Inception date
        }} UNION {{
          wd:{entity_id} wdt:P1619 ?established.  # Date of official opening
        }}
      }}
      
      # Revenue (can be from revenue property or annual revenue property)
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P2139 ?revenue.  # Annual revenue
        }} UNION {{
          wd:{entity_id} wdt:P2295 ?revenue.  # Net income
        }} UNION {{
          ?company wdt:P1056 wd:{entity_id}.  # Company that produces this brand
          ?company wdt:P2139 ?revenue.  # Revenue of parent company
        }}
      }}
      
      # Website
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P856 ?website.  # Official website
        }} UNION {{
          ?company wdt:P1056 wd:{entity_id}.  # Company that produces this brand
          ?company wdt:P856 ?website.  # Website of parent company
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
            brand_types = []
            industry_sectors = []
            headquarters = []
            established = None
            revenue = None
            website = None
            
            for result in results["results"]["bindings"]:
                brand_type = result.get("brandTypeLabel", {}).get("value", "")
                if brand_type and brand_type not in brand_types:
                    brand_types.append(brand_type)
                
                industry_sector = result.get("industrySectorLabel", {}).get("value", "")
                if industry_sector and industry_sector not in industry_sectors:
                    industry_sectors.append(industry_sector)
                
                hq = result.get("headquartersLabel", {}).get("value", "")
                if hq and hq not in headquarters:
                    headquarters.append(hq)
                
                if not established and "established" in result:
                    established = result["established"]["value"]
                    # Format date if it's in ISO format
                    if "T" in established:
                        established = established.split("T")[0]
                
                if not revenue and "revenue" in result:
                    revenue = result["revenue"]["value"]
                
                if not website and "website" in result:
                    website = result["website"]["value"]
            
            return brand_types, industry_sectors, headquarters, established, revenue, website
        
        except Exception as e:
            print(f"Error getting entity details for {entity_id}: {e}")
            time.sleep(2)
    
    return [], [], [], None, None, None

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
            "official_name": result.get("entityLabel", {}).get("value", "Unknown"),
            "brand_types": [],
            "industry_sectors": [],
            "headquarters": [],
            "year_established": None,
            "revenue": None,
            "website": None
        }
        
        processed_data.append(entity_data)
    
    return processed_data

def main(max_batches, batch_size, start_batch):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting fashion and apparel data from Wikidata...")
    
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
                    batch = query_wikidata_fashion_apparel(batch_size, offset, user_agent)
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
            
            for i, entity in enumerate(processed_batch):
                print(f"  Getting data for {entity['official_name']} ({i+1}/{len(processed_batch)})...")
                
                # Get entity details
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        brand_types, industry_sectors, headquarters, established, revenue, website = get_entity_details(entity["id"], user_agent=user_agent)
                        processed_batch[i]["brand_types"] = brand_types
                        processed_batch[i]["industry_sectors"] = industry_sectors
                        processed_batch[i]["headquarters"] = headquarters
                        processed_batch[i]["year_established"] = established
                        processed_batch[i]["revenue"] = revenue
                        processed_batch[i]["website"] = website
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve entity details after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving entity details: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between entities
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total fashion and apparel entities: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "fashion_apparel_data.csv"
        df_for_csv = df.copy()
        df_for_csv['brand_types'] = df_for_csv['brand_types'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['industry_sectors'] = df_for_csv['industry_sectors'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['headquarters'] = df_for_csv['headquarters'].apply(lambda x: ', '.join(x) if x else '')
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "fashion_apparel_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total fashion and apparel entities: {len(all_data)}")
        
        # Count entities with brand type info
        entities_with_brand_type = sum(1 for entity in all_data if entity['brand_types'])
        print(f"Entities with brand type info: {entities_with_brand_type}")
        
        # Count entities with industry sector info
        entities_with_industry = sum(1 for entity in all_data if entity['industry_sectors'])
        print(f"Entities with industry sector info: {entities_with_industry}")
        
        # Count entities with headquarters info
        entities_with_hq = sum(1 for entity in all_data if entity['headquarters'])
        print(f"Entities with headquarters info: {entities_with_hq}")
        
        # Count entities with establishment year
        entities_with_established = sum(1 for entity in all_data if entity['year_established'])
        print(f"Entities with establishment year: {entities_with_established}")
        
        # Count entities with revenue info
        entities_with_revenue = sum(1 for entity in all_data if entity['revenue'])
        print(f"Entities with revenue info: {entities_with_revenue}")
        
        # Count entities with website info
        entities_with_website = sum(1 for entity in all_data if entity['website'])
        print(f"Entities with website info: {entities_with_website}")
        
        # Sample of fashion and apparel entities
        print("\nSample data (first 3 fashion and apparel entities):")
        for i, entity in enumerate(all_data[:3]):
            print(f"\n{i+1}. {entity['official_name']} ({entity['id']})")
            
            if entity['brand_types']:
                print(f"   Brand Type(s):")
                for brand_type in entity['brand_types'][:5]:
                    print(f"      - {brand_type}")
                if len(entity['brand_types']) > 5:
                    print(f"      - ... and {len(entity['brand_types']) - 5} more")
            
            if entity['industry_sectors']:
                print(f"   Industry Sector(s):")
                for sector in entity['industry_sectors'][:5]:
                    print(f"      - {sector}")
                if len(entity['industry_sectors']) > 5:
                    print(f"      - ... and {len(entity['industry_sectors']) - 5} more")
            
            if entity['headquarters']:
                print(f"   Headquarters:")
                for hq in entity['headquarters'][:5]:
                    print(f"      - {hq}")
                if len(entity['headquarters']) > 5:
                    print(f"      - ... and {len(entity['headquarters']) - 5} more")
            
            if entity['year_established']:
                print(f"   Year Established: {entity['year_established']}")
            
            if entity['revenue']:
                print(f"   Revenue: {entity['revenue']}")
            
            if entity['website']:
                print(f"   Website: {entity['website']}")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['brand_types'] = df_for_csv['brand_types'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['industry_sectors'] = df_for_csv['industry_sectors'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv['headquarters'] = df_for_csv['headquarters'].apply(lambda x: ', '.join(x) if x else '')
            df_for_csv.to_csv("partial_fashion_apparel_data.csv", index=False)
            with open("partial_fashion_apparel_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} fashion and apparel entities)")
    
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