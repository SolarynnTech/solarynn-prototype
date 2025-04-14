# MongoDB import script for JSON files
# This script imports all JSON files from the 50_batch_run_figures_2025_04_14 directory into MongoDB


# Path to directory containing JSON files
$jsonDir = ".\50_batch_run_figures_2025_04_14"

# Check if the directory exists
if (!(Test-Path -Path $jsonDir)) {
    Write-Error "Directory not found: $jsonDir"
    exit 1
}

# Get all JSON files in the directory
$jsonFiles = Get-ChildItem -Path $jsonDir -Filter "*.json"

if ($jsonFiles.Count -eq 0) {
    Write-Error "No JSON files found in $jsonDir"
    exit 1
}

Write-Output "Found $($jsonFiles.Count) JSON files to import."

# Import each JSON file
foreach ($file in $jsonFiles) {
    $filePath = $file.FullName
    $fileName = $file.Name
    
    Write-Output "Importing $fileName..."

    # Get password from environment variable
    $mongoPassword = $env:MONGO_PASSWORD
    if (-not $mongoPassword) {
        Write-Error "Environment variable MONGO_PASSWORD is not set"
        exit 1
    }
    
    $collectionName = $file.BaseName  # Gets the filename without extension
    C:\Users\antho\Downloads\mongodb-database-tools-windows-x86_64-100.12.0\mongodb-database-tools-windows-x86_64-100.12.0\bin\mongoimport --uri "mongodb+srv://doadmin:$mongoPassword@db-mongodb-nyc3-70884-8fa4f215.mongo.ondigitalocean.com/admin?replicaSet=db-mongodb-nyc3-70884&tls=true&authSource=admin" --collection $collectionName --file $filePath --jsonArray
    
    if ($LASTEXITCODE -eq 0) {
        Write-Output "Successfully imported $fileName"
    } else {
        Write-Error "Failed to import $fileName"
    }
}

Write-Output "Import process completed." 