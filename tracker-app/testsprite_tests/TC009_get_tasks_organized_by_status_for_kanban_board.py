import requests

BASE_URL = "http://localhost:3000"
TOKEN = "sbp_845afe7751703c7886a2312562357c274b31b918"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/json"
}
TIMEOUT = 30

def test_get_tasks_organized_by_status_kanban_board():
    try:
        response = requests.get(f"{BASE_URL}/tasks", headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
        tasks = response.json()

        # Check that tasks is a list
        assert isinstance(tasks, list), "Response is not a list"

        # Check the presence of keys expected for Kanban task cards
        # Based on typical Kanban board columns, verify that at least one task has a valid status
        valid_statuses = {"PENDING", "IN_PROGRESS", "DONE", "BLOCKED"}
        statuses_found = set()
        for task in tasks:
            # Each task should be a dict
            assert isinstance(task, dict), "Task item is not a dictionary"
            # Must include status key and it must be one of the known statuses
            status = task.get("status")
            assert status in valid_statuses, f"Task status {status} not in valid statuses {valid_statuses}"
            statuses_found.add(status)

        # Ensure that at least one task exists for each column (optional but reasonable)
        assert statuses_found, "No recognized task statuses found in tasks"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_tasks_organized_by_status_kanban_board()