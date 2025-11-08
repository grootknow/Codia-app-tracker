import requests

BASE_URL = "http://localhost:3000"
TOKEN = "sbp_845afe7751703c7886a2312562357c274b31b918"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/json"
}
TIMEOUT = 30

def test_get_tasks_for_visual_gantt_chart():
    try:
        response = requests.get(f"{BASE_URL}/tasks", headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
        
        tasks = response.json()
        assert isinstance(tasks, list), "Response is not a list of tasks"
        assert len(tasks) > 0, "No tasks returned from /tasks endpoint"
        
        # Validate each task has required fields for visual gantt chart
        required_fields = {"id", "status", "started_at", "completed_at", "scheduled_start", "scheduled_end"}
        for task in tasks:
            assert isinstance(task, dict), "Task is not a dictionary"
            assert required_fields.issubset(task.keys()), f"Task missing required fields: {required_fields - set(task.keys())}"
            
            # Validate status is one of the known statuses
            assert task["status"] in {"PENDING", "IN_PROGRESS", "DONE", "BLOCKED"}, f"Unexpected task status: {task['status']}"
            
            # Validate dates have correct format (basic ISO8601 check)
            for date_field in ["started_at", "completed_at", "scheduled_start", "scheduled_end"]:
                if task[date_field] is not None:
                    assert isinstance(task[date_field], str) and len(task[date_field]) >= 10, f"Invalid datetime format in {date_field}"
                    
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"
    except ValueError:
        assert False, "Response content is not valid JSON"

test_get_tasks_for_visual_gantt_chart()