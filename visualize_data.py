import pandas as pd
import matplotlib.pyplot as plt
import json
import os
from collections import Counter

def load_data():
    """Load data from the CSV file"""
    if not os.path.exists("sports_figures_data.csv"):
        print("Error: sports_figures_data.csv not found. Please run the extraction script first.")
        return None
    
    return pd.read_csv("sports_figures_data.csv")

def visualize_top_sports(df, top_n=10):
    """Visualize the top N sports by number of athletes"""
    if df is None or df.empty:
        return
        
    # Count sports
    sport_counts = df['sport_type'].value_counts().head(top_n)
    
    # Create plot
    plt.figure(figsize=(12, 8))
    bars = plt.bar(sport_counts.index, sport_counts.values, color='skyblue')
    plt.title(f'Top {top_n} Sports by Number of Athletes', fontsize=16)
    plt.xlabel('Sport', fontsize=12)
    plt.ylabel('Number of Athletes', fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    # Add count labels on top of bars
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                 f'{height:.0f}', ha='center', va='bottom')
    
    # Save the plot
    plt.savefig('top_sports.png')
    print(f"Plot saved to top_sports.png")
    
    # Show plot if running in interactive mode
    plt.show()

def visualize_olympic_medals():
    """Visualize Olympic medal statistics from the JSON data"""
    if not os.path.exists("sports_figures_data.json"):
        print("Error: sports_figures_data.json not found. Please run the extraction script first.")
        return
    
    # Load JSON data since it has more detailed Olympic info
    with open("sports_figures_data.json", 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Collect medal counts
    medals = []
    for athlete in data:
        if "olympic_data" in athlete and athlete["olympic_data"]:
            for event in athlete["olympic_data"]:
                if event.get("medal"):
                    medals.append(event["medal"])
    
    if not medals:
        print("No Olympic medal data found.")
        return
        
    # Count medals
    medal_counter = Counter(medals)
    
    # Sort medals in traditional order (gold, silver, bronze)
    medal_order = ["gold medal", "silver medal", "bronze medal"]
    medal_counts = {medal: medal_counter.get(medal, 0) for medal in medal_order if medal in medal_counter}
    
    # Add other medals if any
    for medal in medal_counter:
        if medal not in medal_counts:
            medal_counts[medal] = medal_counter[medal]
    
    # Create plot
    plt.figure(figsize=(10, 6))
    colors = ['gold', 'silver', 'dimgray'] + ['lightblue'] * (len(medal_counts) - 3)
    bars = plt.bar(medal_counts.keys(), medal_counts.values(), color=colors)
    
    plt.title('Olympic Medals Distribution', fontsize=16)
    plt.xlabel('Medal Type', fontsize=12)
    plt.ylabel('Count', fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    # Add count labels on top of bars
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                 f'{height:.0f}', ha='center', va='bottom')
    
    # Save the plot
    plt.savefig('olympic_medals.png')
    print(f"Plot saved to olympic_medals.png")
    
    # Show plot if running in interactive mode
    plt.show()

def main():
    print("Loading sports figures data...")
    df = load_data()
    
    if df is not None:
        print(f"Loaded data for {len(df)} athletes")
        
        # Visualize top sports
        print("\nVisualizing top sports...")
        visualize_top_sports(df)
        
        # Visualize Olympic medals
        print("\nVisualizing Olympic medals...")
        visualize_olympic_medals()
        
        print("\nData visualization complete.")

if __name__ == "__main__":
    main() 