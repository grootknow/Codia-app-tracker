import requests

def test_save_setup_wizard_configuration():
    base_url = "http://localhost:3000"
    endpoint = "/localStorage"
    url = base_url + endpoint
    token = "sbp_845afe7751703c7886a2312562357c274b31b918"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "businessName": "Test Business Inc",
        "domain": "testbusiness.com",
        "vpsProvider": "TestVPSProvider",
        "bank": "Test Bank",
        "aiModels": [
            "gpt-4",
            "custom-ai-model-1",
            "custom-ai-model-2"
        ]
    }
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    assert response.status_code == 200 or response.status_code == 201, \
        f"Expected status code 200 or 201, got {response.status_code}"
    try:
        response_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    # Validate that response contains saved data matching payload
    for key in payload:
        assert key in response_json, f"Response JSON missing key '{key}'"
        assert response_json[key] == payload[key], f"Mismatch for key '{key}': expected {payload[key]}, got {response_json[key]}"
    # Additional validation if response has a confirmation or specific success field
    if "success" in response_json:
        assert response_json["success"] is True, "Expected success True in response"
    if "message" in response_json:
        assert isinstance(response_json["message"], str) and len(response_json["message"]) > 0, "Expected non-empty message in response"

test_save_setup_wizard_configuration()