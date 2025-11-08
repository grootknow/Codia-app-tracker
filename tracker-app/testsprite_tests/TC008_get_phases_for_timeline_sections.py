import requests

def test_get_phases_for_timeline_sections():
    base_url = "http://localhost:3000"
    endpoint = "/phases"
    url = base_url + endpoint
    token = "sbp_845afe7751703c7886a2312562357c274b31b918"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        
        json_data = response.json()
        assert isinstance(json_data, list), "Response JSON is not a list"
        assert len(json_data) > 0, "Phases list is empty"
        
        for phase in json_data:
            assert isinstance(phase, dict), "Phase entry is not a dictionary"
            assert "id" in phase, "'id' key missing in phase entry"
            assert isinstance(phase["id"], int), "'id' field is not an integer"
            assert "name" in phase or "title" in phase, "Phase entry must have 'name' or 'title'"
            # Optionally check phase has description or order fields if applicable
            
    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_get_phases_for_timeline_sections()