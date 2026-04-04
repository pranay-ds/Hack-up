import urllib.request
import json

try:
    with urllib.request.urlopen('http://localhost:8000/api/v1/health', timeout=2) as response:
        print(response.read().decode())
except Exception as e:
    print(f"Error: {e}")
