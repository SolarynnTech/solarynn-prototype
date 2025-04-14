import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_tech_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for technology and innovation public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for technology and innovation figures
    query = f"""
    SELECT ?person ?personLabel 
    WHERE {{
      VALUES ?occupation {{
        wd:Q188094   # computer scientist
        wd:Q82594    # inventor
        wd:Q5482740  # programmer
        wd:Q205375   # engineer
        wd:Q4964182  # software engineer
        wd:Q2259532  # technologist
        wd:Q11303721 # technology entrepreneur
        wd:Q1622272  # university teacher (filtering for tech fields)
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
                return query_wikidata_tech_figures(limit // 2, offset, user_agent)
        return []

def get_patents(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get patent information for a specific person
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?patent ?patentLabel ?number ?date ?country ?countryLabel
    WHERE {{
      wd:{person_id} wdt:P800 ?patent. # inventor of
      
      OPTIONAL {{ ?patent wdt:P1246 ?number. }} # patent number
      OPTIONAL {{ ?patent wdt:P577 ?date. }} # publication date
      OPTIONAL {{ ?patent wdt:P17 ?country. }} # country
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            patent_data = []
            
            for result in results["results"]["bindings"]:
                patent_name = result.get("patentLabel", {}).get("value", "")
                patent_number = result.get("number", {}).get("value", "")
                date = result.get("date", {}).get("value", "")
                country = result.get("countryLabel", {}).get("value", "")
                
                patent_data.append({
                    "name": patent_name,
                    "number": patent_number,
                    "date": date,
                    "country": country
                })
            
            return patent_data
        
        except Exception as e:
            print(f"Error getting patent data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_companies_built(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get companies founded by the person
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?company ?companyLabel ?foundedDate ?industry ?industryLabel
    WHERE {{
      VALUES ?founderProp {{ wdt:P112 wdt:P169 wdt:P170 }}
      ?company ?founderProp wd:{person_id}.
      
      OPTIONAL {{ ?company wdt:P571 ?foundedDate. }} # inception date
      OPTIONAL {{ ?company wdt:P452 ?industry. }} # industry
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            company_data = []
            
            for result in results["results"]["bindings"]:
                company_name = result.get("companyLabel", {}).get("value", "")
                founded_date = result.get("foundedDate", {}).get("value", "")
                industry = result.get("industryLabel", {}).get("value", "")
                
                if company_name:
                    company_data.append({
                        "name": company_name,
                        "founded_date": founded_date,
                        "industry": industry
                    })
            
            return company_data
        
        except Exception as e:
            print(f"Error getting company data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_product_contributions(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get products or notable works the person contributed to
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?product ?productLabel ?role ?roleLabel ?date
    WHERE {{
      # Notable work
      {{ wd:{person_id} wdt:P800 ?product. }} # inventor of
      UNION {{ wd:{person_id} wdt:P1066 ?product. }} # student of
      UNION {{ wd:{person_id} wdt:P170 ?product. }} # creator
      UNION {{ wd:{person_id} wdt:P178 ?product. }} # developer
      UNION {{ wd:{person_id} wdt:P6379 ?product. }} # has works in collection
      
      OPTIONAL {{
        ?product p:P2670 ?developerStatement.  # developer statement
        ?developerStatement ps:P2670 wd:{person_id}.
        OPTIONAL {{ ?developerStatement pq:P794 ?role. }}
        OPTIONAL {{ ?developerStatement pq:P577 ?date. }}
      }}
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            product_data = []
            
            for result in results["results"]["bindings"]:
                product_name = result.get("productLabel", {}).get("value", "")
                role = result.get("roleLabel", {}).get("value", "")
                date = result.get("date", {}).get("value", "")
                
                if product_name:
                    product_data.append({
                        "name": product_name,
                        "role": role,
                        "date": date
                    })
            
            return product_data
        
        except Exception as e:
            print(f"Error getting product contribution data for {person_id}: {e}")
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
            "patents": [],
            "companies_built": [],
            "product_contributions": []
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
    
    print("Extracting technology and innovation figures data from Wikidata...")
    
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
                    batch = query_wikidata_tech_figures(batch_size, offset, user_agent)
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
                
                # Get patent data
                retry_count = 0
                base_wait_time = 1
                max_data_retries = 3
                
                while retry_count < max_data_retries:
                    try:
                        patent_data = get_patents(person["id"], user_agent=user_agent)
                        processed_batch[i]["patents"] = patent_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve patent data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["patents"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving patent data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get companies built data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        companies_data = get_companies_built(person["id"], user_agent=user_agent)
                        processed_batch[i]["companies_built"] = companies_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve companies data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["companies_built"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving companies data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get product contributions data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        product_data = get_product_contributions(person["id"], user_agent=user_agent)
                        processed_batch[i]["product_contributions"] = product_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve product data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["product_contributions"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving product data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between people
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total technology figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the complex fields
        csv_file = "technology_figures_data.csv"
        df_for_csv = df.copy()
        
        df_for_csv['patents'] = df_for_csv['patents'].apply(
            lambda patents: ', '.join([f"{p['name']}{' ('+p['number']+')' if p['number'] else ''}{' - '+p['country'] if p['country'] else ''}" for p in patents]) if patents else ''
        )
        
        df_for_csv['companies_built'] = df_for_csv['companies_built'].apply(
            lambda companies: ', '.join([f"{c['name']}{' (founded: '+c['founded_date']+')' if c['founded_date'] else ''}{' - '+c['industry'] if c['industry'] else ''}" for c in companies]) if companies else ''
        )
        
        df_for_csv['product_contributions'] = df_for_csv['product_contributions'].apply(
            lambda products: ', '.join([f"{p['name']}{' as '+p['role'] if p['role'] else ''}{' ('+p['date']+')' if p['date'] else ''}" for p in products]) if products else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "technology_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total technology figures: {len(all_data)}")
        
        # Count people with patent info
        people_with_patents = sum(1 for person in all_data if person['patents'])
        print(f"People with patent info: {people_with_patents}")
        
        # Count people with company data
        people_with_companies = sum(1 for person in all_data if person['companies_built'])
        print(f"People who built companies: {people_with_companies}")
        
        # Count people with product contributions
        people_with_products = sum(1 for person in all_data if person['product_contributions'])
        print(f"People with product contributions: {people_with_products}")
        
        # Sample of people
        print("\nSample data (first 3 technology figures):")
        for i, person in enumerate(all_data[:3]):
            print(f"\n{i+1}. {person['name']} ({person['id']})")
            
            if person['patents']:
                print(f"   Patents:")
                for patent in person['patents'][:3]:  # Show only first 3 patents
                    country_info = f" ({patent['country']})" if patent['country'] else ""
                    number_info = f" - {patent['number']}" if patent['number'] else ""
                    date_info = f" (filed: {patent['date']})" if patent['date'] else ""
                    print(f"      - {patent['name']}{country_info}{number_info}{date_info}")
                if len(person['patents']) > 3:
                    print(f"      ... and {len(person['patents']) - 3} more patents")
            
            if person['companies_built']:
                print(f"   Companies Built:")
                for company in person['companies_built']:
                    industry_info = f" ({company['industry']})" if company['industry'] else ""
                    date_info = f" founded: {company['founded_date']}" if company['founded_date'] else ""
                    print(f"      - {company['name']}{industry_info}{date_info}")
            
            if person['product_contributions']:
                print(f"   Product Contributions:")
                for product in person['product_contributions'][:3]:  # Show only first 3 products
                    role_info = f" as {product['role']}" if product['role'] else ""
                    date_info = f" ({product['date']})" if product['date'] else ""
                    print(f"      - {product['name']}{role_info}{date_info}")
                if len(person['product_contributions']) > 3:
                    print(f"      ... and {len(person['product_contributions']) - 3} more products")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            
            df_for_csv['patents'] = df_for_csv['patents'].apply(
                lambda patents: ', '.join([f"{p['name']}{' ('+p['number']+')' if p['number'] else ''}{' - '+p['country'] if p['country'] else ''}" for p in patents]) if patents else ''
            )
            
            df_for_csv['companies_built'] = df_for_csv['companies_built'].apply(
                lambda companies: ', '.join([f"{c['name']}{' (founded: '+c['founded_date']+')' if c['founded_date'] else ''}{' - '+c['industry'] if c['industry'] else ''}" for c in companies]) if companies else ''
            )
            
            df_for_csv['product_contributions'] = df_for_csv['product_contributions'].apply(
                lambda products: ', '.join([f"{p['name']}{' as '+p['role'] if p['role'] else ''}{' ('+p['date']+')' if p['date'] else ''}" for p in products]) if products else ''
            )
            
            df_for_csv.to_csv("partial_technology_figures_data.csv", index=False)
            with open("partial_technology_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} technology figures)")
    
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