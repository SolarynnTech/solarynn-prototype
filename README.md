# Wiki Sports Figures Data Extractor

This project extracts information about Sports & Athletics public figures from Wikidata, focusing on specific fields:
- Sport Type
- Team(s)
- Olympic Stats
- League

## Requirements

- Python 3.8+
- Required packages (install using `pip install -r requirements.txt`):
  - requests
  - pandas
  - tqdm
  - SPARQLWrapper
  - matplotlib (for visualization)

## Scripts

The project includes three extractor scripts with varying levels of complexity:

### 1. Basic Extractor (`extract_sports_figures.py`)

A simple script that extracts basic information about sports figures:

```bash
python extract_sports_figures.py
```

### 2. Advanced Extractor (`extract_sports_figures_advanced.py`)

An enhanced version that provides more detailed information and better handles multiple values:

```bash
python extract_sports_figures_advanced.py
```

This script includes:
- Multiple teams per athlete
- Olympic medals details
- Country representation
- Birth date information
- Image URLs

**Note:** The advanced script may encounter timeout errors with the Wikidata SPARQL endpoint due to query complexity.

### 3. Simplified Extractor (`extract_sports_figures_simplified.py`) - Recommended

A more robust version that handles Wikidata API limitations better:

```bash
python extract_sports_figures_simplified.py
```

This script:
- Uses a simplified query to avoid timeouts
- Makes separate queries for Olympic data
- Has built-in retry logic with reduced batch sizes
- Limits data collection to a reasonable sample size

### 4. Data Visualization (`visualize_data.py`)

A script to create visualizations from the extracted data:

```bash
python visualize_data.py
```

This script generates:
- Bar chart of the top sports by number of athletes
- Bar chart of Olympic medal distribution

The visualizations are saved as PNG files in the project directory.

## Output

All extractor scripts generate:

1. A CSV file (`sports_figures_data.csv`) for easy data analysis
2. A JSON file (`sports_figures_data.json`) containing the complete structured data

## Usage Example

```bash
# Install dependencies
pip install requests pandas tqdm SPARQLWrapper matplotlib

# Run the simplified extractor (recommended)
python extract_sports_figures_simplified.py

# Visualize the extracted data
python visualize_data.py
```

## Sample Output

The script provides information such as:

```
1. Béla Rajki (Q330959)
   Sport: swimming
   Team: 
   League: 

2. Vítězslav Lavička (Q331332)
   Sport: association football
   Team: AC Sparta Prague
   League: 
   Olympic events:
      - 2017 UEFA European Under-21 Championship
```

## Notes

- The scripts limit the number of records retrieved to avoid overloading the Wikidata servers
- The simplified script is limited to 5 batches (500 athletes) by default
- All scripts include proper delays between requests to be respectful of Wikidata's servers
- For Olympic data, the simplified script only fetches data for the first 10 athletes to keep the runtime reasonable 