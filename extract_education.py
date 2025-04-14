import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_education_subtype(entity_type, type_id, limit=10, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for a specific subtype of education entities
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for specific education entity type
    query = f"""
    SELECT DISTINCT ?entity ?entityLabel 
    WHERE {{
      # Query for {entity_type}
      ?entity wdt:P31/wdt:P279? wd:{type_id}.  # Limited depth subclass traversal
      
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
        print(f"Error querying Wikidata for {entity_type}: {e}")
        # Sleep and retry with smaller limit if we get a timeout
        if "timeout" in str(e).lower() or "500" in str(e):
            print(f"Timeout error. Reducing batch size and retrying...")
            time.sleep(5)  # Longer delay before retry
            if limit > 5:
                return query_wikidata_education_subtype(entity_type, type_id, limit // 2, offset, user_agent)
        return []

def query_wikidata_education_company(entity_type, industry_id, limit=10, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for education companies with specific industry type
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for education companies
    query = f"""
    SELECT DISTINCT ?entity ?entityLabel 
    WHERE {{
      # Query for {entity_type}
      ?entity wdt:P31 wd:Q783794.  # instance of company
      ?entity wdt:P452 wd:{industry_id}.  # specific industry
      
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
        print(f"Error querying Wikidata for {entity_type}: {e}")
        # Sleep and retry with smaller limit if we get a timeout
        if "timeout" in str(e).lower() or "500" in str(e):
            print(f"Timeout error. Reducing batch size and retrying...")
            time.sleep(5)  # Longer delay before retry
            if limit > 5:
                return query_wikidata_education_company(entity_type, industry_id, limit // 2, offset, user_agent)
        return []

def query_wikidata_education_description(limit=10, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for companies with education-related descriptions
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for companies with education descriptions
    query = f"""
    SELECT DISTINCT ?entity ?entityLabel 
    WHERE {{
      # Companies with education related descriptions
      ?entity wdt:P31 wd:Q783794.  # instance of company
      ?entity schema:description ?description.
      FILTER(
        CONTAINS(LCASE(?description), "education") || 
        CONTAINS(LCASE(?description), "university") ||
        CONTAINS(LCASE(?description), "college") ||
        CONTAINS(LCASE(?description), "school")
      )
      FILTER(LANG(?description) = "en")
      
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
        print(f"Error querying Wikidata for education descriptions: {e}")
        # Sleep and retry with smaller limit if we get a timeout
        if "timeout" in str(e).lower() or "500" in str(e):
            print(f"Timeout error. Reducing batch size and retrying...")
            time.sleep(5)  # Longer delay before retry
            if limit > 5:
                return query_wikidata_education_description(limit // 2, offset, user_agent)
        return []

def get_entity_details(entity_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get details for a specific education entity
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
            time.sleep(3)  # Longer delay between retries
    
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

def main(max_entities_per_type=20, batch_size=5, start_batch=0):
    # Configure parameters
    user_agent = "WikiDataExtract/1.0 (your_contact@example.com)"  # Add contact info
    
    all_data = []
    
    # Define education entity types to query separately
    entity_types = [
        ("Universities", "Q3918"),
        ("Colleges", "Q189004"),
        ("Schools", "Q3914"),
        ("Educational institutions", "Q178706"),
        ("Research institutions", "Q31855"),
        ("Language schools", "Q1664720")
    ]
    
    # Define education company types
    company_types = [
        ("Education companies", "Q8434"),
        ("Education technology", "Q1344963"),
        ("Academic publishing", "Q1237973")
    ]
    
    print("Extracting education data from Wikidata...")
    
    try:
        # First, query for institution types (universities, schools, etc.)
        for entity_name, entity_id in entity_types:
            print(f"\nExtracting {entity_name}...")
            entities_retrieved = 0
            batch_num = start_batch
            
            while entities_retrieved < max_entities_per_type:
                offset = batch_num * batch_size
                print(f"  Retrieving batch {batch_num+1} (offset {offset})...")
                
                batch = query_wikidata_education_subtype(entity_name, entity_id, batch_size, offset, user_agent)
                
                if not batch:
                    print(f"  No more {entity_name} or error occurred. Moving to next type.")
                    break
                    
                processed_batch = process_results(batch)
                
                for i, entity in enumerate(processed_batch):
                    print(f"    Getting data for {entity['official_name']} ({i+1}/{len(processed_batch)})...")
                    
                    brand_types, industry_sectors, headquarters, established, revenue, website = get_entity_details(entity["id"], user_agent=user_agent)
                    entity["brand_types"] = brand_types
                    entity["industry_sectors"] = industry_sectors
                    entity["headquarters"] = headquarters
                    entity["year_established"] = established
                    entity["revenue"] = revenue
                    entity["website"] = website
                    
                    time.sleep(2)  # Increased delay between entities
                
                all_data.extend(processed_batch)
                print(f"  Retrieved {len(processed_batch)} {entity_name}")
                
                entities_retrieved += len(processed_batch)
                if len(batch) < batch_size:
                    print(f"  Reached end of {entity_name} results.")
                    break
                    
                batch_num += 1
                time.sleep(3)  # Increased delay between batches
        
        # Then, query for company types
        for entity_name, entity_id in company_types:
            print(f"\nExtracting {entity_name}...")
            entities_retrieved = 0
            batch_num = start_batch
            
            while entities_retrieved < max_entities_per_type:
                offset = batch_num * batch_size
                print(f"  Retrieving batch {batch_num+1} (offset {offset})...")
                
                batch = query_wikidata_education_company(entity_name, entity_id, batch_size, offset, user_agent)
                
                if not batch:
                    print(f"  No more {entity_name} or error occurred. Moving to next type.")
                    break
                    
                processed_batch = process_results(batch)
                
                for i, entity in enumerate(processed_batch):
                    print(f"    Getting data for {entity['official_name']} ({i+1}/{len(processed_batch)})...")
                    
                    brand_types, industry_sectors, headquarters, established, revenue, website = get_entity_details(entity["id"], user_agent=user_agent)
                    entity["brand_types"] = brand_types
                    entity["industry_sectors"] = industry_sectors
                    entity["headquarters"] = headquarters
                    entity["year_established"] = established
                    entity["revenue"] = revenue
                    entity["website"] = website
                    
                    time.sleep(2)  # Increased delay between entities
                
                all_data.extend(processed_batch)
                print(f"  Retrieved {len(processed_batch)} {entity_name}")
                
                entities_retrieved += len(processed_batch)
                if len(batch) < batch_size:
                    print(f"  Reached end of {entity_name} results.")
                    break
                    
                batch_num += 1
                time.sleep(3)  # Increased delay between batches
        
        # Finally, query for companies with education-related descriptions
        print("\nExtracting Companies with education-related descriptions...")
        entities_retrieved = 0
        batch_num = start_batch
        
        while entities_retrieved < max_entities_per_type:
            offset = batch_num * batch_size
            print(f"  Retrieving batch {batch_num+1} (offset {offset})...")
            
            batch = query_wikidata_education_description(batch_size, offset, user_agent)
            
            if not batch:
                print("  No more education-related companies or error occurred.")
                break
                
            processed_batch = process_results(batch)
            
            for i, entity in enumerate(processed_batch):
                print(f"    Getting data for {entity['official_name']} ({i+1}/{len(processed_batch)})...")
                
                brand_types, industry_sectors, headquarters, established, revenue, website = get_entity_details(entity["id"], user_agent=user_agent)
                entity["brand_types"] = brand_types
                entity["industry_sectors"] = industry_sectors
                entity["headquarters"] = headquarters
                entity["year_established"] = established
                entity["revenue"] = revenue
                entity["website"] = website
                
                time.sleep(2)  # Increased delay between entities
            
            all_data.extend(processed_batch)
            print(f"  Retrieved {len(processed_batch)} education-related companies")
            
            entities_retrieved += len(processed_batch)
            if len(batch) < batch_size:
                print("  Reached end of education-related companies results.")
                break
                
            batch_num += 1
            time.sleep(3)  # Increased delay between batches
        
        print(f"\nProcessing complete. Total education entities: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "education_data.csv"
        df_for_csv = df.copy()
        df_for_csv['brand_types'] = df_for_csv['brand_types'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['industry_sectors'] = df_for_csv['industry_sectors'].apply(lambda x: ', '.join(x) if x else '')
        df_for_csv['headquarters'] = df_for_csv['headquarters'].apply(lambda x: ', '.join(x) if x else '')
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "education_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total education entities: {len(all_data)}")
        
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
        
        # Sample of education entities
        print("\nSample data (first 3 education entities):")
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
            df_for_csv.to_csv("partial_education_data.csv", index=False)
            with open("partial_education_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} education entities)")
    
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
    main(max_entities_per_type=20, batch_size=5, start_batch=0) 