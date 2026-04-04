import urllib.request, json

# Check graph API
try:
    data = json.loads(urllib.request.urlopen('http://localhost:8000/api/v1/graph').read())
    print(f"Graph API OK: {len(data.get('nodes',[]))} nodes, {len(data.get('links',[]))} links")
    if data.get('nodes'):
        print("Sample node:", data['nodes'][0])
except Exception as e:
    print(f"Graph API FAILED: {e}")

# Check health
try:
    health = urllib.request.urlopen('http://localhost:8000/api/v1/health').read()
    print(f"Health: {health}")
except Exception as e:
    print(f"Health FAILED: {e}")
