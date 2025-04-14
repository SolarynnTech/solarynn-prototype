import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_music_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for music industry public figures
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for music artists
    query = f"""
    SELECT ?person ?personLabel ?genreLabel ?recordLabelLabel
    WHERE {{
      ?person wdt:P106 wd:Q639669. # occupation: musician
      
      # Genre
      OPTIONAL {{ ?person wdt:P136 ?genre. }}
      
      # Record Label 
      OPTIONAL {{ ?person wdt:P264 ?recordLabel. }}
      
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
                return query_wikidata_music_figures(limit // 2, offset, user_agent)
        return []

def get_chart_data(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get top charts data for a specific musician
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?songLabel ?chartsLabel ?peakPosition
    WHERE {{
      ?song wdt:P175 wd:{person_id}. # performed by
      
      OPTIONAL {{ 
        ?song p:P1411 ?chartPosition.
        ?chartPosition ps:P1411 ?charts.
        OPTIONAL {{ ?chartPosition pq:P1352 ?peakPosition. }}
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
            chart_data = []
            
            for result in results["results"]["bindings"]:
                song_name = result.get("songLabel", {}).get("value", "")
                chart_name = result.get("chartsLabel", {}).get("value", "")
                peak_position = result.get("peakPosition", {}).get("value", "")
                
                if song_name and chart_name:
                    chart_data.append({
                        "song": song_name,
                        "chart": chart_name,
                        "peak_position": peak_position
                    })
            
            return chart_data
        
        except Exception as e:
            print(f"Error getting chart data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_tour_data(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Make a separate query to get tour information for a specific musician
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?tourLabel ?startDate ?endDate
    WHERE {{
      ?tour wdt:P31 wd:Q2097352. # instance of concert tour
      ?tour wdt:P710 wd:{person_id}. # participant
      
      OPTIONAL {{ ?tour wdt:P580 ?startDate. }}
      OPTIONAL {{ ?tour wdt:P582 ?endDate. }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 100
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            tour_data = []
            
            for result in results["results"]["bindings"]:
                tour_name = result.get("tourLabel", {}).get("value", "")
                start_date = result.get("startDate", {}).get("value", "")
                end_date = result.get("endDate", {}).get("value", "")
                
                if tour_name:
                    tour_data.append({
                        "name": tour_name,
                        "start_date": start_date,
                        "end_date": end_date
                    })
            
            return tour_data
        
        except Exception as e:
            print(f"Error getting tour data for {person_id}: {e}")
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
            "genre": result.get("genreLabel", {}).get("value", ""),
            "record_label": result.get("recordLabelLabel", {}).get("value", ""),
            "chart_data": [],  # Will be populated separately
            "tour_data": []    # Will be populated separately
        }
        
        processed_data.append(person_data)
    
    return processed_data

def main():
    # Configure parameters
    batch_size = 100
    start_batch = 0
    max_batches = 8
    user_agent = "WikiDataExtract/1.0 (github.com/example/wikiDataExtract)"
    
    all_data = []
    
    print("Extracting music industry figures data from Wikidata...")
    
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
                    batch = query_wikidata_music_figures(batch_size, offset, user_agent)
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
            
            for i, artist in enumerate(processed_batch):
                print(f"  Getting additional data for {artist['name']} ({i+1}/{len(processed_batch)})...")
                
                # Get chart data
                retry_count = 0
                base_wait_time = 1
                max_chart_retries = 3
                
                while retry_count < max_chart_retries:
                    try:
                        chart_data = get_chart_data(artist["id"], user_agent=user_agent)
                        processed_batch[i]["chart_data"] = chart_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_chart_retries:
                            print(f"Failed to retrieve chart data after {max_chart_retries} attempts. Skipping.")
                            processed_batch[i]["chart_data"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving chart data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_chart_retries})...")
                        time.sleep(wait_time)
                
                # Get tour data
                retry_count = 0
                
                while retry_count < max_chart_retries:
                    try:
                        tour_data = get_tour_data(artist["id"], user_agent=user_agent)
                        processed_batch[i]["tour_data"] = tour_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_chart_retries:
                            print(f"Failed to retrieve tour data after {max_chart_retries} attempts. Skipping.")
                            processed_batch[i]["tour_data"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving tour data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_chart_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between artists
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total music artists: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV
        csv_file = "music_figures_data.csv"
        df_for_csv = df.copy()
        
        # Process chart data for CSV
        df_for_csv['chart_data'] = df_for_csv['chart_data'].apply(
            lambda charts: ', '.join([f"{c['song']} on {c['chart']}{' (#'+c['peak_position']+')' if c['peak_position'] else ''}" for c in charts]) if charts else ''
        )
        
        # Process tour data for CSV
        df_for_csv['tour_data'] = df_for_csv['tour_data'].apply(
            lambda tours: ', '.join([f"{t['name']}{' ('+t['start_date']+' to '+t['end_date']+')' if t['start_date'] and t['end_date'] else ''}" for t in tours]) if tours else ''
        )
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "music_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total artists: {len(all_data)}")
        
        # Count artists with genre info
        artists_with_genre = sum(1 for artist in all_data if artist['genre'])
        print(f"Artists with genre info: {artists_with_genre}")
        
        # Count artists with chart data
        artists_with_charts = sum(1 for artist in all_data if artist['chart_data'])
        print(f"Artists with chart data: {artists_with_charts}")
        
        # Count artists with tour data
        artists_with_tours = sum(1 for artist in all_data if artist['tour_data'])
        print(f"Artists with tour data: {artists_with_tours}")
        
        # Sample of artists
        print("\nSample data (first 3 artists):")
        for i, artist in enumerate(all_data[:3]):
            print(f"\n{i+1}. {artist['name']} ({artist['id']})")
            print(f"   Genre: {artist['genre']}")
            print(f"   Record Label: {artist['record_label']}")
            
            if artist['chart_data']:
                print(f"   Chart appearances:")
                for chart in artist['chart_data'][:3]:  # Show only first 3 chart entries
                    position_info = f" (#{chart['peak_position']})" if chart['peak_position'] else ""
                    print(f"      - {chart['song']} on {chart['chart']}{position_info}")
                if len(artist['chart_data']) > 3:
                    print(f"      ... and {len(artist['chart_data'])-3} more chart entries")
            
            if artist['tour_data']:
                print(f"   Tours:")
                for tour in artist['tour_data'][:3]:  # Show only first 3 tours
                    date_info = f" ({tour['start_date']} to {tour['end_date']})" if tour['start_date'] and tour['end_date'] else ""
                    print(f"      - {tour['name']}{date_info}")
                if len(artist['tour_data']) > 3:
                    print(f"      ... and {len(artist['tour_data'])-3} more tours")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            df_for_csv['chart_data'] = df_for_csv['chart_data'].apply(
                lambda charts: ', '.join([f"{c['song']} on {c['chart']}{' (#'+c['peak_position']+')' if c['peak_position'] else ''}" for c in charts]) if charts else ''
            )
            df_for_csv['tour_data'] = df_for_csv['tour_data'].apply(
                lambda tours: ', '.join([f"{t['name']}{' ('+t['start_date']+' to '+t['end_date']+')' if t['start_date'] and t['end_date'] else ''}" for t in tours]) if tours else ''
            )
            df_for_csv.to_csv("partial_music_figures_data.csv", index=False)
            with open("partial_music_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} artists)")
    
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