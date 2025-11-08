import requests
from datetime import datetime, timezone
import time

BASE_URL = "http://localhost:3000"
HEADERS = {
    "Authorization": "Bearer sbp_845afe7751703c7886a2312562357c274b31b918",
    "Content-Type": "application/json",
}
TIMEOUT = 30

def test_update_task_status_on_kanban_drag_drop():
    task_id = None
    original_task_data = None

    try:
        # Step 1: Create a new task to update (since ID is not provided, create one first)
        new_task_payload = {
            "status": "PENDING",
            "started_at": None,
            "completed_at": None
        }
        # Assuming we can create a task with POST /tasks endpoint for test setup
        create_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"status": "PENDING"},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert create_response.status_code == 201, f"Failed to create task for test setup: {create_response.text}"
        task = create_response.json()
        task_id = task.get("id")
        assert task_id is not None, "Created task does not have an 'id'."

        # Store original data to revert later
        original_task_data = {
            "status": task.get("status"),
            "started_at": task.get("started_at"),
            "completed_at": task.get("completed_at"),
        }

        # Step 2: Prepare updated status simulating Kanban drag & drop
        updated_status = "IN_PROGRESS"
        now_iso = datetime.now(timezone.utc).isoformat()

        update_payload = {
            "status": updated_status,
            "started_at": now_iso,
            "completed_at": None,
        }

        # Step 3: Send PUT request to update task status
        put_response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            json=update_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert put_response.status_code == 200, f"PUT /tasks/{task_id} failed: {put_response.text}"

        updated_task = put_response.json()
        assert updated_task.get("status") == updated_status, "Task status not updated correctly."
        assert updated_task.get("started_at") is not None, "started_at not set in updated task."
        assert updated_task.get("completed_at") is None, "completed_at should be None for in-progress task."

        # Step 4: Validate real-time sync simulation by fetching the same task again and checking updated status
        get_response = requests.get(
            f"{BASE_URL}/tasks/{task_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert get_response.status_code == 200, f"GET /tasks/{task_id} failed: {get_response.text}"
        fetched_task = get_response.json()
        assert fetched_task.get("status") == updated_status, "Real-time sync failed: status mismatch on fetch."
        assert fetched_task.get("started_at") == updated_task.get("started_at"), "started_at mismatch on fetch."
        assert fetched_task.get("completed_at") == updated_task.get("completed_at"), "completed_at mismatch on fetch."

    finally:
        # Cleanup: revert task to original status or delete task if possible
        if task_id is not None:
            if original_task_data:
                try:
                    requests.put(
                        f"{BASE_URL}/tasks/{task_id}",
                        json=original_task_data,
                        headers=HEADERS,
                        timeout=TIMEOUT,
                    )
                except Exception:
                    pass
            try:
                requests.delete(
                    f"{BASE_URL}/tasks/{task_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT,
                )
            except Exception:
                pass

test_update_task_status_on_kanban_drag_drop()