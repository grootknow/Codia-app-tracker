import requests

def test_display_founder_guide_content():
    base_url = "http://localhost:3000"
    endpoint = "/static_content"
    url = base_url + endpoint
    headers = {
        "Authorization": "Bearer sbp_845afe7751703c7886a2312562357c274b31b918",
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    data = response.json()
    # Assert that the response contains founder guide content with expected structure
    # According to PRD, Founder Guide has 6 sections: Accounts, Domain, Finance, Security, Dev Tools, Legal
    # We test presence of these keys or sections in the response

    assert isinstance(data, dict), "Response JSON is not a dictionary"
    expected_sections = ["Accounts", "Domain", "Finance", "Security", "Dev Tools", "Legal"]

    for section in expected_sections:
        assert section in data, f"Missing founder guide section: {section}"
        # Check that section content is not empty
        assert data[section], f"Founder guide section '{section}' is empty or falsy"

    # Further test that the content is accessible and expandable/collapsible means sections can be expanded:
    # We assume response includes a field per section with 'content' and possibly 'expanded' flags (if applicable)
    # This is not explicit, so we check for presence of meaningful text content inside each section
    for section in expected_sections:
        content = data.get(section)
        assert isinstance(content, (str, dict, list)), f"Section '{section}' content is not string/dict/list"
        # If dict or list, check non-empty
        if isinstance(content, (dict, list)):
            assert len(content) > 0, f"Section '{section}' content is empty"

test_display_founder_guide_content()