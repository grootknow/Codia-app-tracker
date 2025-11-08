import requests

BASE_URL = "http://localhost:3000"
TOKEN = "sbp_845afe7751703c7886a2312562357c274b31b918"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/json"
}

def test_get_tracker_app_data_by_phase():
    phase_id = 1  # Example phase_id to test; adjust as necessary

    try:
        response = requests.get(
            f"{BASE_URL}/tracker_app_data",
            headers=HEADERS,
            params={"phase_id": phase_id},
            timeout=30
        )
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    data = response.json()

    assert isinstance(data, list), "Response data should be a list"

    for task in data:
        assert isinstance(task, dict), "Each task should be a dictionary"
        # Validate presence of enriched data fields
        assert "parent" in task, "Task missing 'parent' field"
        assert "children" in task, "Task missing 'children' field"
        assert "dependencies" in task, "Task missing 'dependencies' field"
        # Validate that parent is either None or dict
        parent = task["parent"]
        assert parent is None or isinstance(parent, dict), "'parent' field should be None or dict"
        # Validate children is a list
        children = task["children"]
        assert isinstance(children, list), "'children' field should be a list"
        for child in children:
            assert isinstance(child, dict), "Each child should be a dict"
        # Validate dependencies is a list
        dependencies = task["dependencies"]
        assert isinstance(dependencies, list), "'dependencies' field should be a list"
        for dep in dependencies:
            assert isinstance(dep, dict), "Each dependency should be a dict"

test_get_tracker_app_data_by_phase()