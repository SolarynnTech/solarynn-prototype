import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_business_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for business and finance public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for business and finance figures
    query = f"""
    SELECT ?person ?personLabel 
    WHERE {{
      VALUES ?occupation {{
        wd:Q43845    # businessperson
        wd:Q131524   # entrepreneur
        wd:Q1553078  # banker
        wd:Q15987129 # business executive
        wd:Q372436   # financial analyst
        wd:Q1979607  # investor
        wd:Q806798   # banker
        wd:Q484876   # chief executive officer
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
                return query_wikidata_business_figures(limit // 2, offset, user_agent)
        return []

def get_net_worth(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get net worth information for a specific person
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?netWorth ?netWorthUnit ?determinationDate
    WHERE {{
      wd:{person_id} p:P2218 ?netWorthStatement.
      ?netWorthStatement ps:P2218 ?netWorth.
      
      OPTIONAL {{ ?netWorthStatement psv:P2218/wikibase:quantityUnit ?netWorthUnit. }}
      OPTIONAL {{ ?netWorthStatement pq:P585 ?determinationDate. }}
    }}
    LIMIT 10
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            net_worth_data = []
            
            for result in results["results"]["bindings"]:
                amount = result.get("netWorth", {}).get("value", "")
                unit = result.get("netWorthUnit", {}).get("value", "")
                date = result.get("determinationDate", {}).get("value", "")
                
                if amount:
                    unit_id = unit.split("/")[-1] if unit else ""
                    currency = "USD" if unit_id == "Q4917" else (unit_id if unit_id else "")
                    
                    net_worth_data.append({
                        "amount": amount,
                        "currency": currency,
                        "date": date
                    })
            
            return net_worth_data
        
        except Exception as e:
            print(f"Error getting net worth data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_companies(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get companies associated with a specific person
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?company ?companyLabel ?role ?roleLabel ?tickerSymbol ?exchangeLabel ?startDate ?endDate
    WHERE {{
      VALUES ?companyProp {{ wdt:P355 wdt:P108 wdt:P127 wdt:P463 }}
      wd:{person_id} ?companyProp ?company.
      
      # Ensure it's a company
      ?company wdt:P31/wdt:P279* wd:Q4830453.
      
      # Get role if it exists
      OPTIONAL {{ wd:{person_id} p:P108 ?employmentStatement. 
                ?employmentStatement ps:P108 ?company. 
                OPTIONAL {{ ?employmentStatement pq:P794 ?role. }}
                OPTIONAL {{ ?employmentStatement pq:P580 ?startDate. }}
                OPTIONAL {{ ?employmentStatement pq:P582 ?endDate. }}
      }}
      
      # Stock ticker information
      OPTIONAL {{ ?company wdt:P249 ?tickerSymbol. }}
      OPTIONAL {{ ?company wdt:P414 ?exchange. }}
      
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
                role = result.get("roleLabel", {}).get("value", "")
                ticker = result.get("tickerSymbol", {}).get("value", "")
                exchange = result.get("exchangeLabel", {}).get("value", "")
                start_date = result.get("startDate", {}).get("value", "")
                end_date = result.get("endDate", {}).get("value", "")
                
                if company_name:
                    company_data.append({
                        "name": company_name,
                        "role": role,
                        "ticker_symbol": ticker,
                        "stock_exchange": exchange,
                        "start_date": start_date,
                        "end_date": end_date
                    })
            
            return company_data
        
        except Exception as e:
            print(f"Error getting company data for {person_id}: {e}")
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
            "net_worth": [],  # Will be populated separately
            "companies": []   # Will be populated separately
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
    
    print("Extracting business and finance figures data from Wikidata...")
    
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
                    batch = query_wikidata_business_figures(batch_size, offset, user_agent)
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
                
                # Get net worth data
                retry_count = 0
                base_wait_time = 1
                max_data_retries = 3
                
                while retry_count < max_data_retries:
                    try:
                        net_worth_data = get_net_worth(person["id"], user_agent=user_agent)
                        processed_batch[i]["net_worth"] = net_worth_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve net worth data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["net_worth"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving net worth data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get company data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        company_data = get_companies(person["id"], user_agent=user_agent)
                        processed_batch[i]["companies"] = company_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve company data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["companies"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving company data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between people
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total business figures: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the complex fields
        csv_file = "business_figures_data.csv"
        df_for_csv = df.copy()
        
        df_for_csv['net_worth'] = df_for_csv['net_worth'].apply(
            lambda worth: ', '.join([f"{w['amount']} {w['currency']}{' ('+w['date']+')' if w['date'] else ''}" for w in worth]) if worth else ''
        )
        
        df_for_csv['companies'] = df_for_csv['companies'].apply(
            lambda companies: ', '.join([f"{c['name']}{' ('+c['ticker_symbol']+')' if c['ticker_symbol'] else ''}{' - '+c['stock_exchange'] if c['stock_exchange'] else ''}" for c in companies]) if companies else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "business_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total business figures: {len(all_data)}")
        
        # Count people with net worth info
        people_with_net_worth = sum(1 for person in all_data if person['net_worth'])
        print(f"People with net worth info: {people_with_net_worth}")
        
        # Count people with company data
        people_with_companies = sum(1 for person in all_data if person['companies'])
        print(f"People with company data: {people_with_companies}")
        
        # Count people with ticker symbols
        people_with_tickers = sum(1 for person in all_data if any(company.get('ticker_symbol') for company in person['companies']))
        print(f"People with company ticker symbols: {people_with_tickers}")
        
        # Sample of people
        print("\nSample data (first 3 business figures):")
        for i, person in enumerate(all_data[:3]):
            print(f"\n{i+1}. {person['name']} ({person['id']})")
            
            if person['net_worth']:
                print(f"   Net Worth:")
                for worth in person['net_worth']:
                    date_info = f" (as of {worth['date']})" if worth['date'] else ""
                    print(f"      - {worth['amount']} {worth['currency']}{date_info}")
            
            if person['companies']:
                print(f"   Companies:")
                for company in person['companies']:
                    ticker_info = f" ({company['ticker_symbol']})" if company['ticker_symbol'] else ""
                    exchange_info = f" - {company['stock_exchange']}" if company['stock_exchange'] else ""
                    role_info = f" as {company['role']}" if company['role'] else ""
                    print(f"      - {company['name']}{ticker_info}{exchange_info}{role_info}")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            
            df_for_csv['net_worth'] = df_for_csv['net_worth'].apply(
                lambda worth: ', '.join([f"{w['amount']} {w['currency']}{' ('+w['date']+')' if w['date'] else ''}" for w in worth]) if worth else ''
            )
            
            df_for_csv['companies'] = df_for_csv['companies'].apply(
                lambda companies: ', '.join([f"{c['name']}{' ('+c['ticker_symbol']+')' if c['ticker_symbol'] else ''}{' - '+c['stock_exchange'] if c['stock_exchange'] else ''}" for c in companies]) if companies else ''
            )
            
            df_for_csv.to_csv("partial_business_figures_data.csv", index=False)
            with open("partial_business_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} business figures)")
    
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