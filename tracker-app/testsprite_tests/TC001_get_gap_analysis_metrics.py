import requests

def test_get_gap_analysis_metrics():
    base_url = "http://localhost:3000"
    endpoint = "/gap_analysis"
    headers = {
        "Authorization": "Bearer sbp_845afe7751703c7886a2312562357c274b31b918",
        "Accept": "application/json"
    }
    timeout = 30

    try:
        response = requests.get(f"{base_url}{endpoint}", headers=headers, timeout=timeout)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

    data = response.json()

    # Validate keys exist in response
    assert isinstance(data, dict), "Response is not a JSON object"
    expected_keys = ["total_tasks", "completed", "in_progress", "pending", "gap_percentage"]
    for key in expected_keys:
        assert key in data, f"Key '{key}' missing in response"

    # Validate types
    assert isinstance(data["total_tasks"], int), "total_tasks should be integer"
    assert isinstance(data["completed"], int), "completed should be integer"
    assert isinstance(data["in_progress"], int), "in_progress should be integer"
    assert isinstance(data["pending"], int), "pending should be integer"
    assert isinstance(data["gap_percentage"], (float, int)), "gap_percentage should be number"

    # Validate values are logical and consistent
    total = data["total_tasks"]
    completed = data["completed"]
    in_progress = data["in_progress"]
    pending = data["pending"]
    gap_percentage = data["gap_percentage"]

    assert total >= 0, "total_tasks should be non-negative"
    assert completed >= 0, "completed should be non-negative"
    assert in_progress >= 0, "in_progress should be non-negative"
    assert pending >= 0, "pending should be non-negative"

    sum_status = completed + in_progress + pending
    # The sum of statuses should not exceed total_tasks (some tasks may be in other states or overlap)
    assert sum_status <= total, "Sum of completed, in_progress and pending should not exceed total_tasks"

    # Verify gap_percentage is between 0 and 100 inclusive
    assert 0 <= gap_percentage <= 100, "gap_percentage should be between 0 and 100"

test_get_gap_analysis_metrics()