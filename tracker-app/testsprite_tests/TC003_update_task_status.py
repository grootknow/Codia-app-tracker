import requests
from datetime import datetime, timezone, timedelta

BASE_URL = "http://localhost:3000"
TOKEN = "sbp_845afe7751703c7886a2312562357c274b31b918"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_update_task_status():
    # Step 1: Get an existing task to update
    get_tasks_resp = requests.get(f"{BASE_URL}/tasks", headers=HEADERS, timeout=TIMEOUT)
    get_tasks_resp.raise_for_status()
    tasks = get_tasks_resp.json()
    assert tasks and len(tasks) > 0, "No tasks available to update."
    task_id = tasks[0].get("id")
    assert task_id is not None, "Task ID not found in fetched tasks."

    # Step 2: Prepare update payload
    new_status = "IN_PROGRESS"
    started_at = datetime.now(timezone.utc).isoformat()

    update_payload = {
        "status": new_status,
        "started_at": started_at
    }

    # Step 3: Update task
    put_response = requests.put(
        f"{BASE_URL}/tasks/{task_id}",
        headers=HEADERS,
        json=update_payload,
        timeout=TIMEOUT
    )
    assert put_response.status_code == 200, f"Unexpected status code on update: {put_response.status_code}"

    updated_task = put_response.json()
    assert updated_task.get("status") == new_status, "Task status was not updated correctly"
    assert updated_task.get("started_at") == started_at, "Task started_at timestamp not updated correctly"
    # completed_at may be null or missing
    assert updated_task.get("completed_at") is None, "Task completed_at timestamp should be None"

    # Step 4: Update status to DONE with completed_at timestamp
    done_status = "DONE"
    completed_time = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
    second_update_payload = {
        "status": done_status,
        "started_at": started_at,
        "completed_at": completed_time
    }

    put_response_done = requests.put(
        f"{BASE_URL}/tasks/{task_id}",
        headers=HEADERS,
        json=second_update_payload,
        timeout=TIMEOUT
    )
    assert put_response_done.status_code == 200, f"Unexpected status code on second update: {put_response_done.status_code}"

    updated_task_done = put_response_done.json()
    assert updated_task_done.get("status") == done_status, "Task status was not updated to DONE correctly"
    assert updated_task_done.get("started_at") == started_at, "started_at changed unexpectedly"
    assert updated_task_done.get("completed_at") == completed_time, "completed_at timestamp not updated correctly"


test_update_task_status()
