import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_media_talent_agencies(limit=10, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for media and talent agencies
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    sparql.setTimeout(60)  # Set timeout to 60 seconds
    
    # Split the query into smaller chunks to avoid timeouts
    # This approach queries each agency type separately and combines the results
    agency_types = [
        # Talent agencies
        {
            "query": f"""
            SELECT DISTINCT ?entity ?entityLabel 
            WHERE {{
              ?entity wdt:P31 wd:Q1009964.  # Talent agency (exact match)
              
              # Ensure it has some basic information
              ?entity rdfs:label ?label.
              FILTER(LANG(?label) = "en")
              
              # Remove overly restrictive label filtering
              FILTER(!REGEX(?label, "(football|soccer|player|athlete|actor|actress|politician|author)", "i"))
              
              # Get labels
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
            ORDER BY ?entityLabel
            LIMIT {limit}
            OFFSET {offset}
            """
        },
        # Media agencies
        {
            "query": f"""
            SELECT DISTINCT ?entity ?entityLabel 
            WHERE {{
              ?entity wdt:P31 wd:Q10863255.  # Media agency (exact match)
              
              # Ensure it has some basic information
              ?entity rdfs:label ?label.
              FILTER(LANG(?label) = "en")
              
              # Remove overly restrictive label filtering
              FILTER(!REGEX(?label, "(football|soccer|player|athlete|actor|actress|politician|author)", "i"))
              
              # Get labels
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
            ORDER BY ?entityLabel
            LIMIT {limit}
            OFFSET {offset}
            """
        },
        # Sports agencies
        {
            "query": f"""
            SELECT DISTINCT ?entity ?entityLabel 
            WHERE {{
              ?entity wdt:P31 wd:Q56876626.  # Sports agency (exact match)
              
              # Ensure it has some basic information
              ?entity rdfs:label ?label.
              FILTER(LANG(?label) = "en")
              
              # Remove overly restrictive label filtering
              FILTER(!REGEX(?label, "(football|soccer|player|athlete|actor|actress|politician|author)", "i"))
              
              # Get labels
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
            ORDER BY ?entityLabel
            LIMIT {limit}
            OFFSET {offset}
            """
        },
        # Model agencies
        {
            "query": f"""
            SELECT DISTINCT ?entity ?entityLabel 
            WHERE {{
              ?entity wdt:P31 wd:Q1194769.   # Model agency (exact match)
              
              # Ensure it has some basic information
              ?entity rdfs:label ?label.
              FILTER(LANG(?label) = "en")
              
              # Remove overly restrictive label filtering
              FILTER(!REGEX(?label, "(football|soccer|player|athlete|actor|actress|politician|author)", "i"))
              
              # Get labels
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
            ORDER BY ?entityLabel
            LIMIT {limit}
            OFFSET {offset}
            """
        },
        # Literary agencies
        {
            "query": f"""
            SELECT DISTINCT ?entity ?entityLabel 
            WHERE {{
              ?entity wdt:P31 wd:Q11396470.  # Literary agency (exact match)
              
              # Ensure it has some basic information
              ?entity rdfs:label ?label.
              FILTER(LANG(?label) = "en")
              
              # Remove overly restrictive label filtering
              FILTER(!REGEX(?label, "(football|soccer|player|athlete|actor|actress|politician|author)", "i"))
              
              # Get labels
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
            ORDER BY ?entityLabel
            LIMIT {limit}
            OFFSET {offset}
            """
        },
        # Entertainment companies
        {
            "query": f"""
            SELECT DISTINCT ?entity ?entityLabel 
            WHERE {{
              # Companies with entertainment as a core business
              ?entity wdt:P31/wdt:P279* wd:Q783794.  # Company
              ?entity wdt:P452 wd:Q173799.  # Primary industry = Entertainment
              
              # Ensure it has some basic information
              ?entity rdfs:label ?label.
              FILTER(LANG(?label) = "en")
              
              # Remove overly restrictive label filtering
              FILTER(!REGEX(?label, "(football|soccer|player|athlete|actor|actress|politician|author)", "i"))
              
              # Get labels
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
            }}
            ORDER BY ?entityLabel
            LIMIT {limit}
            OFFSET {offset}
            """
        }
    ]
    
    all_results = []
    
    for agency_type in agency_types:
        sparql.setQuery(agency_type["query"])
        sparql.setReturnFormat(JSON)
        
        max_retries = 5
        current_retry = 0
        current_limit = limit
        
        while current_retry < max_retries:
            try:
                # Adjust query with current limit
                current_query = agency_type["query"].replace(f"LIMIT {limit}", f"LIMIT {current_limit}")
                sparql.setQuery(current_query)
                
                print(f"Querying batch with limit {current_limit}...")
                results = sparql.query().convert()
                
                # If successful, add to all_results
                if "results" in results and "bindings" in results["results"]:
                    all_results.extend(results["results"]["bindings"])
                
                # Break out of retry loop if successful
                break
                
            except Exception as e:
                current_retry += 1
                print(f"Error querying Wikidata: {e}")
                
                # If timeout or server error, reduce limit and retry
                if "timeout" in str(e).lower() or "500" in str(e):
                    # Reduce limit by half each retry
                    current_limit = max(5, current_limit // 2)
                    print(f"Timeout error. Reducing batch size to {current_limit} and retrying...")
                    time.sleep(10)  # Longer wait time between retries
                else:
                    # For other errors, wait and retry with same limit
                    print(f"Error (retry {current_retry}/{max_retries}): {e}")
                    time.sleep(5)
                
                # If we've reached max retries, continue to next agency type
                if current_retry >= max_retries:
                    print(f"Failed to query after {max_retries} retries. Moving to next query type.")
    
    # Remove duplicates based on entity URI
    unique_results = []
    seen_uris = set()
    
    for result in all_results:
        uri = result.get("entity", {}).get("value", "")
        if uri and uri not in seen_uris:
            seen_uris.add(uri)
            unique_results.append(result)
    
    return unique_results

def get_entity_details(entity_id, max_retries=5, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get details for a specific media or talent agency
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    sparql.setTimeout(60)  # Set timeout to 60 seconds
    
    # Breaking down the detailed query into smaller parts
    queries = [
        # Basic info and service types
        f"""
        SELECT ?serviceTypeLabel ?foundingDate ?dissolutionDate ?website ?parentCompanyLabel ?employeeCountLabel
        WHERE {{
          # Service Types
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
          
          # Parent Company
          OPTIONAL {{
            wd:{entity_id} wdt:P749 ?parentCompany.  # Parent organization
          }}
          
          # Employee Count
          OPTIONAL {{
            wd:{entity_id} wdt:P1128 ?employeeCount.  # Employees
          }}
          
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        LIMIT 100
        """,
        
        # Industries served
        f"""
        SELECT ?industryServedLabel
        WHERE {{
          # Industries Served
          OPTIONAL {{
            {{
              wd:{entity_id} wdt:P452 ?industryServed.  # Industry
            }} UNION {{
              wd:{entity_id} wdt:P2770 ?industryServed.  # Source of income
            }} UNION {{
              wd:{entity_id} wdt:P1056 ?industryServed.  # Product or material produced
            }}
          }}
          
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        LIMIT 100
        """,
        
        # Locations
        f"""
        SELECT ?locationLabel
        WHERE {{
          # Locations
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
          
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        LIMIT 100
        """,
        
        # Clients
        f"""
        SELECT ?clientLabel
        WHERE {{
          # Clients
          OPTIONAL {{
            {{
              ?client wdt:P2218 wd:{entity_id}.  # Client of
            }} UNION {{
              ?client wdt:P1830 wd:{entity_id}.  # Owner of
            }} UNION {{
              wd:{entity_id} wdt:P1056 ?client.  # Product or material produced for
            }} UNION {{
              ?client wdt:P1589 wd:{entity_id}.  # Represented by
            }}
          }}
          
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        LIMIT 100
        """,
        
        # Awards and featured work
        f"""
        SELECT ?workLabel ?awardLabel
        WHERE {{
          # Featured Work
          OPTIONAL {{
            {{
              wd:{entity_id} wdt:P1056 ?work.  # Product or material produced
            }} UNION {{
              ?work wdt:P170 wd:{entity_id}.  # Creator
            }} UNION {{
              ?work wdt:P1622 wd:{entity_id}.  # Agency
            }} UNION {{
              ?work wdt:P88 wd:{entity_id}.  # Commissioned by
            }}
          }}
          
          # Awards
          OPTIONAL {{
            wd:{entity_id} wdt:P166 ?award.  # Award received
          }}
          
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        LIMIT 100
        """,
        
        # Platform integrations
        f"""
        SELECT ?platformLabel
        WHERE {{
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
          
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
        }}
        LIMIT 100
        """
    ]
    
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
    parent_company = None
    employee_count = None
    awards = []
    
    # Process each query with retries
    for query_idx, query in enumerate(queries):
        retry_count = 0
        while retry_count < max_retries:
            try:
                sparql.setQuery(query)
                sparql.setReturnFormat(JSON)
                results = sparql.query().convert()
                
                # Process results based on query type
                if query_idx == 0:  # Basic info query
                    for result in results["results"]["bindings"]:
                        service_type = result.get("serviceTypeLabel", {}).get("value", "")
                        if service_type and service_type not in service_types and not service_type.startswith("Q"):
                            service_types.append(service_type)
                        
                        if not founding_date and "foundingDate" in result:
                            founding_date = result["foundingDate"]["value"]
                            if "T" in founding_date:
                                founding_date = founding_date.split("T")[0]
                        
                        if not dissolution_date and "dissolutionDate" in result:
                            dissolution_date = result["dissolutionDate"]["value"]
                            if "T" in dissolution_date:
                                dissolution_date = dissolution_date.split("T")[0]
                        
                        if not website and "website" in result:
                            website = result["website"]["value"]
                        
                        if not parent_company and "parentCompanyLabel" in result:
                            parent_company = result["parentCompanyLabel"]["value"]
                        
                        if not employee_count and "employeeCountLabel" in result:
                            employee_count = result["employeeCountLabel"]["value"]
                
                elif query_idx == 1:  # Industries query
                    for result in results["results"]["bindings"]:
                        industry = result.get("industryServedLabel", {}).get("value", "")
                        if industry and industry not in industries_served and not industry.startswith("Q"):
                            industries_served.append(industry)
                
                elif query_idx == 2:  # Locations query
                    for result in results["results"]["bindings"]:
                        location = result.get("locationLabel", {}).get("value", "")
                        if location and location not in locations and not location.startswith("Q"):
                            locations.append(location)
                
                elif query_idx == 3:  # Clients query
                    for result in results["results"]["bindings"]:
                        client = result.get("clientLabel", {}).get("value", "")
                        if client and client not in clients and not client.startswith("Q"):
                            clients.append(client)
                
                elif query_idx == 4:  # Work and awards query
                    for result in results["results"]["bindings"]:
                        work = result.get("workLabel", {}).get("value", "")
                        if work and work not in featured_work and not work.startswith("Q"):
                            featured_work.append(work)
                        
                        award = result.get("awardLabel", {}).get("value", "")
                        if award and award not in awards and not award.startswith("Q"):
                            awards.append(award)
                
                elif query_idx == 5:  # Platforms query
                    for result in results["results"]["bindings"]:
                        platform = result.get("platformLabel", {}).get("value", "")
                        if platform and platform not in platform_integrations and not platform.startswith("Q"):
                            platform_integrations.append(platform)
                
                # Success, break retry loop
                break
                
            except Exception as e:
                retry_count += 1
                print(f"Error getting entity details for {entity_id} (query {query_idx+1}/{len(queries)}): {e}")
                
                # Longer wait time between retries
                wait_time = 5 * retry_count
                print(f"Retrying in {wait_time} seconds (attempt {retry_count}/{max_retries})...")
                time.sleep(wait_time)
                
                if retry_count >= max_retries:
                    print(f"Failed to retrieve entity details after {max_retries} attempts. Skipping query.")
    
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
    
    print("Extracting media and talent agencies from Wikidata...")
    
    try:
        for batch_num in range(start_batch, max_batches):
            offset = batch_num * batch_size
            print(f"Retrieving batch {batch_num+1}/{max_batches} (offset {offset})...")
            
            batch = query_wikidata_media_talent_agencies(batch_size, offset, user_agent)
            if not batch:
                print("No more results or error occurred. Stopping.")
                break
                
            processed_batch = process_results(batch)
            
            for i, entity in enumerate(processed_batch):
                print(f"  Getting data for {entity['agency_name']} ({i+1}/{len(processed_batch)})...")
                
                # Get entity details with improved error handling
                service_types, industries_served, locations, clients, years_active, website, featured_work, platform_integrations = get_entity_details(entity["id"], user_agent=user_agent)
                processed_batch[i]["service_types"] = service_types
                processed_batch[i]["industries_served"] = industries_served
                processed_batch[i]["locations"] = locations
                processed_batch[i]["top_clients"] = clients
                processed_batch[i]["years_active"] = years_active
                processed_batch[i]["website"] = website
                processed_batch[i]["featured_work"] = featured_work
                processed_batch[i]["platform_integrations"] = platform_integrations
                
                # Delay between entities - longer delay to avoid timeouts
                time.sleep(3)
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Longer delay between batches to avoid timeouts
            time.sleep(10)
        
        print(f"\nProcessing complete. Total media and talent agencies: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the arrays and nested fields
        csv_file = "media_talent_agencies_data.csv"
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
        json_file = "media_talent_agencies_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total media and talent agencies: {len(all_data)}")
        
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
        print("\nSample data (first 3 media/talent agencies):")
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
            df_for_csv.to_csv("partial_media_talent_agencies_data.csv", index=False)
            with open("partial_media_talent_agencies_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} media/talent agencies)")
    
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
    main(max_batches=5, batch_size=10, start_batch=0)  # Reduced batch size to 10 