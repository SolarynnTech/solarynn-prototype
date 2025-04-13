import time
import json
from extract_fashion_figures import main as extract_fashion
from extract_social_media_figures import main as extract_social
from extract_entertainment_figures import main as extract_entertainment
from extract_sports_figures import main as extract_sports

data_list = []

def run_extractions(start_batch, max_batches, batch_size):
    print("Starting WikiData extraction pipeline...")
    
    # Configuration for each extraction
    batch_config = {
        'max_batches': max_batches,  # Reduced from original values for faster testing
        'batch_size': batch_size,  # Smaller batch size to reduce timeouts
        'start_batch': start_batch
    }
    
    try:
        # 1. Fashion Figures
        print("\n=== Extracting Fashion Figures ===")
        data_list.extend(extract_fashion(**batch_config))
        time.sleep(15)  # Cool-down period between extractions
        
        # 2. Social Media Figures
        print("\n=== Extracting Social Media Figures ===")
        data_list.extend(extract_social(**batch_config))
        time.sleep(30)
                
        # 4. Sports Figures
        print("\n=== Extracting Sports Figures ===")
        data_list.extend(extract_sports(**batch_config))
        time.sleep(60)

        print("\n=== Extraction Pipeline Complete ===")
        print("All data has been saved to respective CSV and JSON files:")
        print("- fashion_figures_data.csv/json")
        print("- social_media_figures_data.csv/json")
        print("- entertainment_figures_data.csv/json")
        print("- sports_figures_data.csv/json")
        
    except KeyboardInterrupt:
        print("\nExtraction pipeline interrupted by user.")
        print("Any completed extractions have been saved.")
    except Exception as e:
        print(f"\nAn error occurred during extraction: {e}")
        print("Any completed extractions have been saved.")

if __name__ == "__main__":
    for i in range(0, 50):
        run_extractions(start_batch=i*5, max_batches=5+i*5, batch_size=50)
    for i, data in enumerate(data_list):
        if i % 3 == 1:
            json_file = "social_media_figures_data_combined.json"
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    if not isinstance(existing_data, list):
                        existing_data = [existing_data]
                    if isinstance(data, list):
                        existing_data.extend(data)
                    else:
                        existing_data.append(data)
            except (FileNotFoundError, json.JSONDecodeError):
                existing_data = [data] if not isinstance(data, list) else data
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, ensure_ascii=False, indent=2)
        elif i % 3 == 2:
            json_file = "sports_figures_data_combined.json"
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    if not isinstance(existing_data, list):
                        existing_data = [existing_data]
                    if isinstance(data, list):
                        existing_data.extend(data)
                    else:
                        existing_data.append(data)
            except (FileNotFoundError, json.JSONDecodeError):
                existing_data = [data] if not isinstance(data, list) else data
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, ensure_ascii=False, indent=2)
        elif i % 3 == 0:
            json_file = "fashion_figures_data_combined.json"
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    if not isinstance(existing_data, list):
                        existing_data = [existing_data]
                    if isinstance(data, list):
                        existing_data.extend(data)
                    else:
                        existing_data.append(data)
            except (FileNotFoundError, json.JSONDecodeError):
                existing_data = [data] if not isinstance(data, list) else data
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, ensure_ascii=False, indent=2)

