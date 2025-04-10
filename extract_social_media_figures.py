import pandas as pd
import json
import time
import requests
from tqdm import tqdm
from SPARQLWrapper import SPARQLWrapper, JSON

def query_wikidata_social_media_figures(limit=100, offset=0, user_agent="WikiDataExtract/1.0"):
    """
    Query Wikidata for social media and digital personalities
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    # SPARQL query for social media and digital personalities
    query = f"""
    SELECT ?person ?personLabel 
    WHERE {{
      VALUES ?occupation {{
        wd:Q4429696  # social media personality 
        wd:Q56947864 # YouTuber
        wd:Q28835376 # social media influencer
        wd:Q15265344 # youtuber
        wd:Q30857156 # Instagrammer
        wd:Q85391221 # Twitch streamer
        wd:Q24461932 # video blogger
        wd:Q15895027 # internet personality
        wd:Q13591440 # blogger
        wd:Q28437425 # streamer
        wd:Q1622272  # content creator
        wd:Q17125263 # comedian (filtering for digital)
        wd:Q3455803  # director (filtering for digital)
        wd:Q205375   # podcaster
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
                return query_wikidata_social_media_figures(limit // 2, offset, user_agent)
        return []

def get_follower_count(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get follower count for a specific person across platforms
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?platform ?platformLabel ?followers ?followerDate
    WHERE {{
      # Various social media follower predicates
      {{
        wd:{person_id} wdt:P8687 ?followers. # Instagram followers (P8687)
        BIND("Instagram" AS ?platform)
      }} UNION {{
        wd:{person_id} wdt:P3744 ?followers. # YouTube subscribers (P3744) 
        BIND("YouTube" AS ?platform)
      }} UNION {{
        wd:{person_id} wdt:P8687 ?followers. # TikTok followers (P8687)
        BIND("TikTok" AS ?platform)
      }} UNION {{
        wd:{person_id} wdt:P3744 ?followers. # Twitter followers (P3744)
        BIND("Twitter" AS ?platform)
      }} UNION {{
        wd:{person_id} wdt:P8687 ?followers. # Facebook followers (P8687)
        BIND("Facebook" AS ?platform)
      }} UNION {{
        wd:{person_id} wdt:P3744 ?followers. # Twitch followers (P3744)
        BIND("Twitch" AS ?platform)
      }} UNION {{
        wd:{person_id} p:P8687 ?followerNode.
        ?followerNode ps:P8687 ?followers;
                      pq:P2241 ?platformItem.
        ?platformItem rdfs:label ?platformLabel.
        FILTER(LANG(?platformLabel) = "en")
        OPTIONAL {{ ?followerNode pq:P585 ?followerDate. }}
      }}
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            follower_data = []
            
            for result in results["results"]["bindings"]:
                platform_name = result.get("platformLabel", {}).get("value", result.get("platform", {}).get("value", ""))
                followers = result.get("followers", {}).get("value", "")
                date = result.get("followerDate", {}).get("value", "")
                
                if platform_name and followers:
                    follower_data.append({
                        "platform": platform_name,
                        "followers": followers,
                        "date": date
                    })
            
            return follower_data
        
        except Exception as e:
            print(f"Error getting follower data for {person_id}: {e}")
            time.sleep(2)
    
    return []

def get_platform_specialty(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get platform specialty and type of content
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?account ?accountLabel ?platform ?platformLabel ?fieldOfWork ?fieldOfWorkLabel
    WHERE {{
      # Social media accounts
      OPTIONAL {{
        ?account wdt:P554 wd:{person_id}. # Wikidata item of featured person (P554)
        ?account wdt:P31 ?platformType. # instance of social media account
        OPTIONAL {{ ?account wdt:P400 ?platform. }} # platform
      }}
      
      # Field of work
      OPTIONAL {{ wd:{person_id} wdt:P101 ?fieldOfWork. }} # field of work
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 50
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            specialty_data = []
            
            # Extract fields of work
            fields_of_work = set()
            for result in results["results"]["bindings"]:
                if "fieldOfWorkLabel" in result and result["fieldOfWorkLabel"]["value"]:
                    fields_of_work.add(result["fieldOfWorkLabel"]["value"])
            
            # Extract platforms
            platforms = set()
            for result in results["results"]["bindings"]:
                if "platformLabel" in result and result["platformLabel"]["value"]:
                    platforms.add(result["platformLabel"]["value"])
                elif "platform" in result and "value" in result["platform"]:
                    platforms.add(result["platform"]["value"].split("/")[-1])
            
            specialty_data = {
                "platforms": list(platforms),
                "fields_of_work": list(fields_of_work)
            }
            
            return specialty_data
        
        except Exception as e:
            print(f"Error getting platform specialty data for {person_id}: {e}")
            time.sleep(2)
    
    return {"platforms": [], "fields_of_work": []}

def get_engagement_rate(person_id, max_retries=3, user_agent="WikiDataExtract/1.0"):
    """
    Get engagement metrics and calculate engagement rate where possible
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.addCustomHttpHeader("User-Agent", user_agent)
    
    query = f"""
    SELECT ?views ?likes ?comments ?statementTime ?platform ?platformLabel
    WHERE {{
      # Various engagement metrics
      OPTIONAL {{
        wd:{person_id} p:P5436 ?viewsStatement. # YouTube view count (P5436)
        ?viewsStatement ps:P5436 ?views.
        OPTIONAL {{ ?viewsStatement pq:P585 ?statementTime. }}
        BIND("YouTube" AS ?platform)
      }}
      
      OPTIONAL {{
        wd:{person_id} p:P1651 ?likesStatement. # TikTok/Instagram hearts/likes (P1651)
        ?likesStatement ps:P1651 ?likes.
        OPTIONAL {{ ?likesStatement pq:P585 ?statementTime. }}
        OPTIONAL {{ ?likesStatement pq:P400 ?platform. }}
      }}
      
      OPTIONAL {{
        wd:{person_id} p:P5436 ?commentsStatement. # Comments count (reusing view property)
        ?commentsStatement ps:P5436 ?comments.
        ?commentsStatement pq:P642 ?commentType. # Comment type qualifier
        FILTER(?commentType = wd:Q1257856) # Comments
        OPTIONAL {{ ?commentsStatement pq:P585 ?statementTime. }}
        OPTIONAL {{ ?commentsStatement pq:P400 ?platform. }}
      }}
      
      # Get labels
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
    }}
    LIMIT 30
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    for attempt in range(max_retries):
        try:
            results = sparql.query().convert()
            engagement_data = {
                "views": {},
                "likes": {},
                "comments": {},
                "engagement_rate": {}
            }
            
            for result in results["results"]["bindings"]:
                platform = result.get("platformLabel", {}).get("value", result.get("platform", {}).get("value", "Unknown"))
                
                if "views" in result:
                    engagement_data["views"][platform] = result["views"]["value"]
                
                if "likes" in result:
                    engagement_data["likes"][platform] = result["likes"]["value"]
                
                if "comments" in result:
                    engagement_data["comments"][platform] = result["comments"]["value"]
            
            # Calculate engagement rate where possible (basic estimation)
            for platform in set(list(engagement_data["views"].keys()) + list(engagement_data["likes"].keys())):
                views = float(engagement_data["views"].get(platform, 0)) or 1  # Avoid division by zero
                likes = float(engagement_data["likes"].get(platform, 0))
                comments = float(engagement_data["comments"].get(platform, 0))
                
                # Simple engagement rate calculation: (likes + comments) / views
                if views > 0 and (likes > 0 or comments > 0):
                    engagement_rate = ((likes + comments) / views) * 100
                    engagement_data["engagement_rate"][platform] = f"{engagement_rate:.2f}%"
            
            return engagement_data
        
        except Exception as e:
            print(f"Error getting engagement data for {person_id}: {e}")
            time.sleep(2)
    
    return {"views": {}, "likes": {}, "comments": {}, "engagement_rate": {}}

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
            "follower_count": [],
            "platform_specialty": {"platforms": [], "fields_of_work": []},
            "engagement_rate": {"views": {}, "likes": {}, "comments": {}, "engagement_rate": {}}
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
    
    print("Extracting social media and digital personalities data from Wikidata...")
    
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
                    batch = query_wikidata_social_media_figures(batch_size, offset, user_agent)
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
                
                # Get follower count data
                retry_count = 0
                base_wait_time = 1
                max_data_retries = 3
                
                while retry_count < max_data_retries:
                    try:
                        follower_data = get_follower_count(person["id"], user_agent=user_agent)
                        processed_batch[i]["follower_count"] = follower_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve follower data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["follower_count"] = []
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving follower data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get platform specialty data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        specialty_data = get_platform_specialty(person["id"], user_agent=user_agent)
                        processed_batch[i]["platform_specialty"] = specialty_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve platform specialty data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["platform_specialty"] = {"platforms": [], "fields_of_work": []}
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving platform specialty data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                # Get engagement rate data
                retry_count = 0
                
                while retry_count < max_data_retries:
                    try:
                        engagement_data = get_engagement_rate(person["id"], user_agent=user_agent)
                        processed_batch[i]["engagement_rate"] = engagement_data
                        break  # Success, exit retry loop
                    except Exception as e:
                        retry_count += 1
                        if retry_count >= max_data_retries:
                            print(f"Failed to retrieve engagement data after {max_data_retries} attempts. Skipping.")
                            processed_batch[i]["engagement_rate"] = {"views": {}, "likes": {}, "comments": {}, "engagement_rate": {}}
                            break
                        
                        wait_time = base_wait_time * (2 ** (retry_count - 1))  # Exponential back-off
                        print(f"Error retrieving engagement data: {e}. Retrying in {wait_time} seconds (attempt {retry_count}/{max_data_retries})...")
                        time.sleep(wait_time)
                
                time.sleep(1)  # Base delay between people
            
            all_data.extend(processed_batch)
            print(f"Retrieved {len(processed_batch)} records")
            
            if len(batch) < batch_size:
                print("Reached end of results.")
                break
                
            # Base delay between batches
            time.sleep(2)
        
        print(f"\nProcessing complete. Total social media personalities: {len(all_data)}")
        
        if not all_data:
            print("No data was retrieved. Please check your internet connection or try again later.")
            return
        
        # Create DataFrame for analysis
        df = pd.DataFrame(all_data)
        
        # Save to CSV - handling the complex fields
        csv_file = "social_media_figures_data.csv"
        df_for_csv = df.copy()
        
        df_for_csv['follower_count'] = df_for_csv['follower_count'].apply(
            lambda followers: ', '.join([f"{f['platform']}: {f['followers']}{' (as of '+f['date']+')' if f['date'] else ''}" for f in followers]) if followers else ''
        )
        
        df_for_csv['platform_specialty_platforms'] = df_for_csv['platform_specialty'].apply(
            lambda specialty: ', '.join(specialty['platforms']) if specialty and specialty['platforms'] else ''
        )
        
        df_for_csv['platform_specialty_fields'] = df_for_csv['platform_specialty'].apply(
            lambda specialty: ', '.join(specialty['fields_of_work']) if specialty and specialty['fields_of_work'] else ''
        )
        
        df_for_csv['engagement_rate'] = df_for_csv['engagement_rate'].apply(
            lambda engagement: ', '.join([f"{platform}: {rate}" for platform, rate in engagement['engagement_rate'].items()]) if engagement and engagement['engagement_rate'] else ''
        )
        
        # Drop the complex columns and replace with flattened ones
        df_for_csv = df_for_csv.drop(columns=['platform_specialty'])
        
        df_for_csv.to_csv(csv_file, index=False)
        print(f"Data saved to {csv_file}")
        
        # Save to JSON
        json_file = "social_media_figures_data.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {json_file}")
        
        # Display some statistics and sample data
        print("\nStatistics:")
        print(f"Total social media personalities: {len(all_data)}")
        
        # Count people with follower info
        people_with_followers = sum(1 for person in all_data if person['follower_count'])
        print(f"People with follower info: {people_with_followers}")
        
        # Count people with platform specialty data
        people_with_specialty = sum(1 for person in all_data if person['platform_specialty']['platforms'] or person['platform_specialty']['fields_of_work'])
        print(f"People with platform specialty info: {people_with_specialty}")
        
        # Count people with engagement rate data
        people_with_engagement = sum(1 for person in all_data if person['engagement_rate']['engagement_rate'])
        print(f"People with engagement rate info: {people_with_engagement}")
        
        # Sample of people
        print("\nSample data (first 3 social media personalities):")
        for i, person in enumerate(all_data[:3]):
            print(f"\n{i+1}. {person['name']} ({person['id']})")
            
            if person['follower_count']:
                print(f"   Follower Counts:")
                for follower in person['follower_count']:
                    date_info = f" (as of {follower['date']})" if follower['date'] else ""
                    print(f"      - {follower['platform']}: {follower['followers']}{date_info}")
            
            if person['platform_specialty']['platforms'] or person['platform_specialty']['fields_of_work']:
                print(f"   Platform Specialty:")
                if person['platform_specialty']['platforms']:
                    platforms_str = ", ".join(person['platform_specialty']['platforms'])
                    print(f"      - Platforms: {platforms_str}")
                if person['platform_specialty']['fields_of_work']:
                    fields_str = ", ".join(person['platform_specialty']['fields_of_work'])
                    print(f"      - Content focus: {fields_str}")
            
            if person['engagement_rate']['engagement_rate']:
                print(f"   Engagement Rates:")
                for platform, rate in person['engagement_rate']['engagement_rate'].items():
                    print(f"      - {platform}: {rate}")
    
    except KeyboardInterrupt:
        print("\nExtraction interrupted by user. Saving partial data...")
        if all_data:
            # Save partial data
            df = pd.DataFrame(all_data)
            df_for_csv = df.copy()
            
            df_for_csv['follower_count'] = df_for_csv['follower_count'].apply(
                lambda followers: ', '.join([f"{f['platform']}: {f['followers']}{' (as of '+f['date']+')' if f['date'] else ''}" for f in followers]) if followers else ''
            )
            
            df_for_csv['platform_specialty_platforms'] = df_for_csv['platform_specialty'].apply(
                lambda specialty: ', '.join(specialty['platforms']) if specialty and specialty['platforms'] else ''
            )
            
            df_for_csv['platform_specialty_fields'] = df_for_csv['platform_specialty'].apply(
                lambda specialty: ', '.join(specialty['fields_of_work']) if specialty and specialty['fields_of_work'] else ''
            )
            
            df_for_csv['engagement_rate'] = df_for_csv['engagement_rate'].apply(
                lambda engagement: ', '.join([f"{platform}: {rate}" for platform, rate in engagement['engagement_rate'].items()]) if engagement and engagement['engagement_rate'] else ''
            )
            
            # Drop the complex columns and replace with flattened ones
            df_for_csv = df_for_csv.drop(columns=['platform_specialty'])
            
            df_for_csv.to_csv("partial_social_media_figures_data.csv", index=False)
            with open("partial_social_media_figures_data.json", 'w', encoding='utf-8') as f:
                json.dump(all_data, f, ensure_ascii=False, indent=2)
            print(f"Partial data saved ({len(all_data)} social media personalities)")
    
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