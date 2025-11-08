import requests

def test_load_milestone_tasks_for_setup_wizard():
    base_url = "http://localhost:3000"
    endpoint = "/tracker_app_data"
    headers = {
        "Authorization": "Bearer sbp_845afe7751703c7886a2312562357c274b31b918",
        "Accept": "application/json"
    }
    params = {"is_milestone": "true"}

    try:
        response = requests.get(f"{base_url}{endpoint}", headers=headers, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        # Basic validation: response should be a list (assumed) or dict containing milestone tasks
        assert isinstance(data, (list, dict)), "Response is not a list or dict as expected"

        # If list, validate that returned tasks have keys indicating milestone tasks data
        if isinstance(data, list):
            for task in data:
                assert isinstance(task, dict), "Task item is not a dict"
                # Check some common fields that milestone tasks likely have: id and milestone flag
                assert "id" in task, "Task missing 'id'"
                # Since filtered by is_milestone=true, verify milestone property is True or equivalent
                milestone_value = task.get("is_milestone") or task.get("milestone") or task.get("isMilestone") 
                # It's acceptable if API returns some equivalent - check truthy
                assert milestone_value in [True, "true", "True", 1, "1"], "Task is not marked as milestone"

        elif isinstance(data, dict):
            # If dict, we expect keys related to milestones - check for at least one key
            assert any(data.values()), "Response dict is empty or has no milestone tasks"

    except requests.exceptions.RequestException as e:
        assert False, f"Request to load milestone tasks failed: {e}"

test_load_milestone_tasks_for_setup_wizard()