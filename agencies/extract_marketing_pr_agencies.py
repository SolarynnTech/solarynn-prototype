import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_marketing_pr_agencies(limit=10, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for marketing, social media, and PR agencies
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # Query targeting marketing, social media, and PR agencies
    query = f"""
    SELECT DISTINCT ?entity ?entityLabel 
    WHERE {{
      # Companies that are specifically marketing, PR or social media agencies
      {{
        ?entity wdt:P31 wd:Q4611891.  # Marketing agency (exact match)
      }} UNION {{
        ?entity wdt:P31 wd:Q860517.   # Public relations agency (exact match)
      }} UNION {{
        ?entity wdt:P31 wd:Q68006230.  # Social media agency (exact match) 
      }} UNION {{
        # Companies with marketing as a core business
        ?entity wdt:P31/wdt:P279* wd:Q783794.  # Company
        ?entity wdt:P452 wd:Q39809.  # Primary industry = Marketing industry
      }} UNION {{
        # Companies with PR as a core business
        ?entity wdt:P31/wdt:P279* wd:Q783794.  # Company
        ?entity wdt:P452 wd:Q208354.  # Primary industry = Public relations
      }} UNION {{
        # Companies with social media marketing focus
        ?entity wdt:P31/wdt:P279* wd:Q783794.  # Company
        ?entity wdt:P452 wd:Q1225966.  # Primary industry = Social media
      }} UNION {{
        # Organizations with marketing/PR/social as primary focus
        ?entity wdt:P31/wdt:P279* wd:Q43229.  # Organization
        ?entity wdt:P31 wd:Q328468.  # Business
        {{
          ?entity wdt:P452 wd:Q39809.  # Primary industry = Marketing
        }} UNION {{
          ?entity wdt:P452 wd:Q208354.  # Primary industry = Public relations
        }} UNION {{
          ?entity wdt:P452 wd:Q1225966.  # Primary industry = Social media
        }}
      }} UNION {{
        # Companies known to produce marketing, PR, or social media content
        ?entity wdt:P31/wdt:P279* wd:Q783794.  # Company 
        {{
          ?entity wdt:P1056 wd:Q39809.  # Product = Marketing
        }} UNION {{
          ?entity wdt:P1056 wd:Q208354.  # Product = Public relations
        }} UNION {{
          ?entity wdt:P1056 wd:Q1225966.  # Product = Social media
        }}
      }} UNION {{
        # Explicitly labeled as marketing/PR producers
        {{
          ?entity wdt:P106 wd:Q39809.  # Occupation = marketing
        }} UNION {{
          ?entity wdt:P106 wd:Q208354.  # Occupation = public relations
        }} UNION {{
          ?entity wdt:P106 wd:Q1225966.  # Occupation = social media
        }}
      }}
      
      # Ensure it has some basic information
      ?entity rdfs:label ?label.
      FILTER(LANG(?label) = "en")
      
      # Remove overly restrictive label filtering - only exclude known non-agency entities
      FILTER(!REGEX(?label, "(football|soccer|player|athlete|actor|actress|politician|author)", "i"))
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    ORDER BY ?entityLabel
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
            time.sleep(5)
            if limit > 5:
                return query_wikidata_marketing_pr_agencies(limit // 2, offset, user_agent)
        return []

def get_entity_details(entity_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get details for a specific marketing, social media, or PR agency
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?serviceTypeLabel ?industryServedLabel ?locationLabel ?clientLabel ?foundingDate ?dissolutionDate ?website ?workLabel ?platformLabel ?parentCompanyLabel ?employeeCountLabel ?awardLabel
    WHERE {{
      # Service Types - what kind of agency
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P31 ?serviceType.  # Instance of
        }} UNION {{
          wd:{entity_id} wdt:P279 ?serviceType.  # Subclass of
        }} UNION {{
          wd:{entity_id} wdt:P452 ?serviceType.  # Industry
        }} UNION {{
          wd:{entity_id} wdt:P366 ?serviceType.  # Use
        }}
      }}
      
      # Industries Served - client industries
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P452 ?industryServed.  # Industry
        }} UNION {{
          wd:{entity_id} wdt:P2770 ?industryServed.  # Source of income
        }} UNION {{
          wd:{entity_id} wdt:P1056 ?industryServed.  # Product or material produced
        }} UNION {{
          # Get industries from clients
          ?client wdt:P2218 wd:{entity_id}.  # Client of agency
          ?client wdt:P452 ?industryServed.  # Industry of client
        }}
      }}
      
      # Locations - offices and operation areas
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P159 ?location.  # Headquarters location
        }} UNION {{
          wd:{entity_id} wdt:P740 ?location.  # Location of formation
        }} UNION {{
          wd:{entity_id} wdt:P131 ?location.  # Located in administrative entity
        }} UNION {{
          wd:{entity_id} wdt:P276 ?location.  # Location
        }} UNION {{
          wd:{entity_id} wdt:P937 ?location.  # Work location
        }} UNION {{
          wd:{entity_id} wdt:P17 ?location.  # Country
        }}
      }}
      
      # Top Clients - brands and companies they work with
      OPTIONAL {{
        {{
          ?client wdt:P2218 wd:{entity_id}.  # Client of
        }} UNION {{
          ?client wdt:P1830 wd:{entity_id}.  # Owner of
        }} UNION {{
          wd:{entity_id} wdt:P1056 ?client.  # Product or material produced for
        }} UNION {{
          ?campaign wdt:P1622 wd:{entity_id}.  # Campaign with this agency
          ?campaign wdt:P1056 ?client.  # The campaign was for this client
        }}
      }}
      
      # Years Active (Founding Date)
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P571 ?foundingDate.  # Inception date
        }} UNION {{
          wd:{entity_id} wdt:P1619 ?foundingDate.  # Date of official opening
        }} UNION {{
          wd:{entity_id} wdt:P580 ?foundingDate.  # Start time
        }}
      }}
      
      # Dissolution Date (if applicable)
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P576 ?dissolutionDate.  # Dissolution date
        }} UNION {{
          wd:{entity_id} wdt:P582 ?dissolutionDate.  # End time
        }}
      }}
      
      # Website
      OPTIONAL {{
        wd:{entity_id} wdt:P856 ?website.  # Official website
      }}
      
      # Featured Work / Case Studies
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P1056 ?work.  # Product or material produced
        }} UNION {{
          ?work wdt:P170 wd:{entity_id}.  # Creator
        }} UNION {{
          ?work wdt:P1622 wd:{entity_id}.  # Marketing agency
        }} UNION {{
          ?work wdt:P88 wd:{entity_id}.  # Commissioned by
        }}
      }}
      
      # Platform Integrations
      OPTIONAL {{
        {{
          wd:{entity_id} wdt:P1056 ?platform.  # Product or material produced
          ?platform wdt:P31/wdt:P279* wd:Q15474.  # Instances of software platforms
        }} UNION {{
          wd:{entity_id} wdt:P366 ?platform.  # Use
          ?platform wdt:P31/wdt:P279* wd:Q15474.  # Instances of software platforms
        }} UNION {{
          wd:{entity_id} wdt:P1056 ?platform.  # Product or material produced
          ?platform wdt:P31/wdt:P279* wd:Q7397.  # Software
        }}
      }}
      
      # Parent Company (if part of larger network)
      OPTIONAL {{
        wd:{entity_id} wdt:P749 ?parentCompany.  # Parent organization
      }}
      
      # Employee Count
      OPTIONAL {{
        wd:{entity_id} wdt:P1128 ?employeeCount.  # Employees
      }}
      
      # Awards
      OPTIONAL {{
        wd:{entity_id} wdt:P166 ?award.  # Award received
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
            service_types = []
            industries_served = []
            locations = []
            clients = []
            founding_date = None
            dissolution_date = None
            website = None
            featured_work = []
            platform_integrations = []
            parent_company = None
            employee_count = None
            awards = []
            
            for result in results["results"]["bindings"]:
                service_type = result.get("serviceTypeLabel", {}).get("value", "")
                if service_type and service_type not in service_types and not service_type.startswith("Q"):
                    service_types.append(service_type)
                
                industry = result.get("industryServedLabel", {}).get("value", "")
                if industry and industry not in industries_served and not industry.startswith("Q"):
                    industries_served.append(industry)
                
                location = result.get("locationLabel", {}).get("value", "")
                if location and location not in locations and not location.startswith("Q"):
                    locations.append(location)
                
                client = result.get("clientLabel", {}).get("value", "")
                if client and client not in clients and not client.startswith("Q"):
                    clients.append(client)
                
                if not founding_date and "foundingDate" in result:
                    founding_date = result["foundingDate"]["value"]
                    # Format date if it's in ISO format
                    if "T" in founding_date:
                        founding_date = founding_date.split("T")[0]
                
                if not dissolution_date and "dissolutionDate" in result:
                    dissolution_date = result["dissolutionDate"]["value"]
                    # Format date if it's in ISO format
                    if "T" in dissolution_date:
                        dissolution_date = dissolution_date.split("T")[0]
                
                if not website and "website" in result:
                    website = result["website"]["value"]
                
                work = result.get("workLabel", {}).get("value", "")
                if work and work not in featured_work and not work.startswith("Q"):
                    featured_work.append(work)
                
                platform = result.get("platformLabel", {}).get("value", "")
                if platform and platform not in platform_integrations and not platform.startswith("Q"):
                    platform_integrations.append(platform)
                
                # New fields
                if not parent_company and "parentCompanyLabel" in result:
                    parent_company = result["parentCompanyLabel"]["value"]
                
                if not employee_count and "employeeCountLabel" in result:
                    employee_count = result["employeeCountLabel"]["value"]
                
                award = result.get("awardLabel", {}).get("value", "")
                if award and award not in awards and not award.startswith("Q"):
                    awards.append(award)
            
            # Format the years active
            years_active = None
            if founding_date:
                if dissolution_date:
                    years_active = f"{founding_date} - {dissolution_date}"
                else:
                    years_active = f"{founding_date} - present"
            
            # Add parent company info to service types if available
            if parent_company and parent_company not in service_types and not parent_company.startswith("Q"):
                service_types.append(f"Part of {parent_company}")
            
            # Add awards to featured work if available
            if awards:
                for award in awards:
                    featured_work.append(f"Award: {award}")
            
            return service_types, industries_served, locations, clients, years_active, website, featured_work, platform_integrations
        
        except Exception as e:
            print(f"Error getting entity details for {entity_id}: {e}")
            time.sleep(2)
    
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
    
    print("Extracting marketing, social media, and PR agencies from Wikidata...")
    
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
                    batch = query_wikidata_marketing_pr_agencies(batch_size, offset, user_agent)
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
                print(f"  Getting data for {entity['agency_name']} ({i+1}/{len(processed_batch)})...")
                
                # Get entity details
                retry_count = 0
                base_wait_time = 1
                max_retries = 3
                
                while retry_count < max_retries:
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
                        if retry_count >= max_retries:
                            print(f"Failed to retrieve entity details after {max_retries} attempts. Skipping.")
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving entity details: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(2)  # Delay between entities
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Delay between batches
            time.sleep(5)
        
        print(f"\nProcessing complete. Total marketing, social media, and PR agencies: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "marketing_pr_agencies_data.csv"
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
        json_file = "marketing_pr_agencies_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total marketing, social media, and PR agencies: {len(all_data)}")
        
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
        print("\nSample data (first 3 marketing/PR agencies):")
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
            df_for_csv.to_csv("partial_marketing_pr_agencies_data.csv", index=False)
            with open("partial_marketing_pr_agencies_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} marketing/PR agencies)")
    
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
    main(max_batches=5, batch_size=20, start_batch=0) 