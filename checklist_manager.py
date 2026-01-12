"""
Checklist Manager for Multi-Session Autonomous Development

This module provides a Python-based checklist system for tracking tasks
across multiple autonomous agent sessions. It maintains state in a JSON file
and can export to Markdown for human readability.

Usage:
    from checklist_manager import ChecklistManager
    from pathlib import Path

    manager = ChecklistManager(Path.cwd())

    # Initialize new project
    manager.initialize(project_name="My Project", tasks=[...])

    # Get next task to work on
    next_task = manager.get_next_task()

    # Update task status
    manager.update_task_status(task_id=1, status="In Progress")
    manager.update_task_status(task_id=1, status="Done", notes="Completed successfully")

    # Add session log
    manager.add_session_log(session_num=1, summary="...")

    # Export to Markdown
    manager.export_to_markdown()
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

# UTF-8 encoding is configured via PYTHONIOENCODING environment variable in autonomous_agent_demo.py


class ChecklistManager:
    """Manages a project checklist with JSON persistence and Markdown export."""

    VALID_STATUSES = ["Todo", "In Progress", "Done", "Blocked", "Skipped"]
    VALID_PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    def __init__(self, project_dir: Path):
        """
        Initialize the ChecklistManager.

        Args:
            project_dir: Path to the project root directory
        """
        self.project_dir = Path(project_dir)
        self.checklist_file = self.project_dir / ".project_checklist.json"
        self.markdown_file = self.project_dir / "CHECKLIST.md"
        self.data: Dict[str, Any] = self._load_or_create()

    def _load_or_create(self) -> Dict[str, Any]:
        """Load existing checklist or create empty structure."""
        if self.checklist_file.exists():
            try:
                with open(self.checklist_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print(f"Warning: Could not parse {self.checklist_file}, creating new checklist")

        return {
            "project_name": "",
            "created_at": "",
            "last_updated": "",
            "phases": [],
            "tasks": [],
            "session_logs": [],
            "success_criteria": []
        }

    def _save(self) -> None:
        """Save checklist to JSON file."""
        self.data["last_updated"] = datetime.now().isoformat()
        with open(self.checklist_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)

    def initialize(
        self,
        project_name: str,
        tasks: List[Dict[str, Any]],
        phases: Optional[List[Dict[str, Any]]] = None,
        success_criteria: Optional[List[str]] = None
    ) -> None:
        """
        Initialize a new checklist with tasks.

        Args:
            project_name: Name of the project
            tasks: List of task dictionaries with keys:
                - title (required): Task title
                - description (optional): Task description
                - priority (optional): CRITICAL, HIGH, MEDIUM, LOW
                - phase (optional): Phase number or name
                - dependencies (optional): List of task IDs this depends on
                - files (optional): List of files to modify
                - verification (optional): How to verify completion
            phases: Optional list of phase dictionaries
            success_criteria: Optional list of success criteria strings
        """
        now = datetime.now().isoformat()

        # Process tasks and assign IDs
        processed_tasks = []
        for i, task in enumerate(tasks, start=1):
            processed_task = {
                "id": i,
                "title": task.get("title", f"Task {i}"),
                "description": task.get("description", ""),
                "priority": task.get("priority", "MEDIUM"),
                "phase": task.get("phase"),
                "status": "Todo",
                "dependencies": task.get("dependencies", []),
                "files": task.get("files", []),
                "verification": task.get("verification", ""),
                "created_at": now,
                "started_at": None,
                "completed_at": None,
                "notes": ""
            }
            processed_tasks.append(processed_task)

        self.data = {
            "project_name": project_name,
            "created_at": now,
            "last_updated": now,
            "phases": phases or [],
            "tasks": processed_tasks,
            "session_logs": [],
            "success_criteria": success_criteria or []
        }

        self._save()
        print(f"Initialized checklist with {len(processed_tasks)} tasks")

    def get_task(self, task_id: int) -> Optional[Dict[str, Any]]:
        """Get a task by ID."""
        for task in self.data["tasks"]:
            if task["id"] == task_id:
                return task
        return None

    def get_next_task(self) -> Optional[Dict[str, Any]]:
        """
        Get the next task to work on.

        Returns the first task that:
        1. Has status "In Progress", OR
        2. Has status "Todo" and all dependencies are "Done"

        Priority order: CRITICAL > HIGH > MEDIUM > LOW
        """
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}

        # First, return any task already in progress
        for task in self.data["tasks"]:
            if task["status"] == "In Progress":
                return task

        # Get all completed task IDs
        done_ids = {t["id"] for t in self.data["tasks"] if t["status"] == "Done"}

        # Find eligible tasks (Todo with all dependencies met)
        eligible = []
        for task in self.data["tasks"]:
            if task["status"] == "Todo":
                deps = set(task.get("dependencies", []))
                if deps.issubset(done_ids):
                    eligible.append(task)

        if not eligible:
            return None

        # Sort by priority
        eligible.sort(key=lambda t: priority_order.get(t.get("priority", "MEDIUM"), 2))
        return eligible[0]

    def get_tasks_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Get all tasks with a specific status."""
        return [t for t in self.data["tasks"] if t["status"] == status]

    def get_tasks_by_phase(self, phase: Any) -> List[Dict[str, Any]]:
        """Get all tasks in a specific phase."""
        return [t for t in self.data["tasks"] if t.get("phase") == phase]

    def update_task_status(
        self,
        task_id: int,
        status: str,
        notes: Optional[str] = None
    ) -> bool:
        """
        Update a task's status.

        Args:
            task_id: The task ID to update
            status: New status (Todo, In Progress, Done, Blocked, Skipped)
            notes: Optional notes about the update

        Returns:
            True if successful, False if task not found
        """
        if status not in self.VALID_STATUSES:
            raise ValueError(f"Invalid status: {status}. Must be one of {self.VALID_STATUSES}")

        for task in self.data["tasks"]:
            if task["id"] == task_id:
                now = datetime.now().isoformat()
                task["status"] = status

                if status == "In Progress" and not task["started_at"]:
                    task["started_at"] = now
                elif status == "Done":
                    task["completed_at"] = now

                if notes:
                    task["notes"] = notes

                self._save()
                print(f"Task #{task_id} updated to: {status}")
                return True

        print(f"Task #{task_id} not found")
        return False

    def add_session_log(self, session_num: int, summary: str) -> None:
        """
        Add a session log entry.

        Args:
            session_num: Session number
            summary: Summary of what was accomplished
        """
        log_entry = {
            "session": session_num,
            "timestamp": datetime.now().isoformat(),
            "summary": summary
        }
        self.data["session_logs"].append(log_entry)
        self._save()
        print(f"Session {session_num} log added")

    def get_progress(self) -> Dict[str, Any]:
        """Get progress statistics."""
        tasks = self.data["tasks"]
        total = len(tasks)

        if total == 0:
            return {"total": 0, "done": 0, "in_progress": 0, "todo": 0, "percentage": 0}

        by_status = {}
        for status in self.VALID_STATUSES:
            by_status[status.lower().replace(" ", "_")] = len([t for t in tasks if t["status"] == status])

        done = by_status.get("done", 0)
        percentage = round((done / total) * 100, 1)

        return {
            "total": total,
            "percentage": percentage,
            **by_status
        }

    def export_to_markdown(self) -> None:
        """Export the checklist to a Markdown file."""
        lines = []

        # Header
        lines.append(f"# {self.data['project_name']} - Checklist")
        lines.append("")

        # Progress summary
        progress = self.get_progress()
        lines.append("## Progress Summary")
        lines.append(f"- **Total Tasks**: {progress['total']}")
        lines.append(f"- **Completed**: {progress.get('done', 0)}")
        lines.append(f"- **In Progress**: {progress.get('in_progress', 0)}")
        lines.append(f"- **Todo**: {progress.get('todo', 0)}")
        lines.append(f"- **Completion**: {progress['percentage']}%")
        lines.append(f"- **Last Updated**: {self.data.get('last_updated', 'N/A')}")
        lines.append("")

        # Group tasks by phase
        phases = self.data.get("phases", [])
        if phases:
            for phase in phases:
                phase_id = phase.get("id") or phase.get("name")
                phase_name = phase.get("name", f"Phase {phase_id}")
                phase_priority = phase.get("priority", "")

                lines.append("---")
                lines.append("")
                priority_badge = f" ({phase_priority})" if phase_priority else ""
                lines.append(f"## {phase_name}{priority_badge}")
                lines.append("")

                if phase.get("description"):
                    lines.append(f"> {phase['description']}")
                    lines.append("")

                phase_tasks = self.get_tasks_by_phase(phase_id)
                for task in phase_tasks:
                    lines.extend(self._format_task(task))
                    lines.append("")
        else:
            # No phases, just list all tasks
            lines.append("---")
            lines.append("")
            lines.append("## Tasks")
            lines.append("")
            for task in self.data["tasks"]:
                lines.extend(self._format_task(task))
                lines.append("")

        # Success criteria
        if self.data.get("success_criteria"):
            lines.append("---")
            lines.append("")
            lines.append("## Success Criteria")
            lines.append("")
            for criterion in self.data["success_criteria"]:
                lines.append(f"- [ ] {criterion}")
            lines.append("")

        # Session logs
        if self.data.get("session_logs"):
            lines.append("---")
            lines.append("")
            lines.append("## Session Logs")
            lines.append("")
            for log in self.data["session_logs"]:
                lines.append(f"### Session {log['session']} - {log['timestamp'][:10]}")
                lines.append("")
                lines.append(log["summary"])
                lines.append("")

        # Write to file
        with open(self.markdown_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(lines))

        print(f"Exported checklist to {self.markdown_file}")

    def _format_task(self, task: Dict[str, Any]) -> List[str]:
        """Format a single task for Markdown output."""
        lines = []

        # Status indicator
        status = task["status"]
        if status == "Done":
            indicator = "[x]"
            emoji = ""
        elif status == "In Progress":
            indicator = "[-]"
            emoji = ""
        elif status == "Blocked":
            indicator = "[!]"
            emoji = ""
        elif status == "Skipped":
            indicator = "[~]"
            emoji = ""
        else:
            indicator = "[ ]"
            emoji = ""

        # Title line
        title = f"### {indicator} Task {task['id']}: {task['title']}"
        lines.append(title)

        # Metadata
        lines.append(f"**Status**: {emoji} {status}")
        if task.get("priority"):
            lines.append(f"**Priority**: {task['priority']}")

        # Description
        if task.get("description"):
            lines.append(f"**Description**: {task['description']}")

        # Files
        if task.get("files"):
            files_str = ", ".join([f"`{f}`" for f in task["files"]])
            lines.append(f"**Files**: {files_str}")

        # Dependencies
        if task.get("dependencies"):
            deps_str = ", ".join([f"Task {d}" for d in task["dependencies"]])
            lines.append(f"**Dependencies**: {deps_str}")

        # Verification
        if task.get("verification"):
            lines.append(f"**Verification**: {task['verification']}")

        # Notes (for completed tasks)
        if task.get("notes"):
            lines.append(f"**Notes**: {task['notes']}")

        # Timestamps
        if task.get("completed_at"):
            lines.append(f"**Completed**: {task['completed_at'][:10]}")

        return lines

    def add_task(
        self,
        title: str,
        description: str = "",
        priority: str = "MEDIUM",
        phase: Any = None,
        dependencies: List[int] = None,
        files: List[str] = None,
        verification: str = ""
    ) -> int:
        """
        Add a new task to the checklist.

        Returns:
            The ID of the new task
        """
        if priority not in self.VALID_PRIORITIES:
            raise ValueError(f"Invalid priority: {priority}. Must be one of {self.VALID_PRIORITIES}")

        # Find the highest existing ID
        max_id = max([t["id"] for t in self.data["tasks"]], default=0)
        new_id = max_id + 1

        new_task = {
            "id": new_id,
            "title": title,
            "description": description,
            "priority": priority,
            "phase": phase,
            "status": "Todo",
            "dependencies": dependencies or [],
            "files": files or [],
            "verification": verification,
            "created_at": datetime.now().isoformat(),
            "started_at": None,
            "completed_at": None,
            "notes": ""
        }

        self.data["tasks"].append(new_task)
        self._save()
        print(f"Added task #{new_id}: {title}")
        return new_id

    def remove_task(self, task_id: int) -> bool:
        """Remove a task by ID."""
        for i, task in enumerate(self.data["tasks"]):
            if task["id"] == task_id:
                del self.data["tasks"][i]
                self._save()
                print(f"Removed task #{task_id}")
                return True
        return False


if __name__ == "__main__":
    # Example usage
    manager = ChecklistManager(Path.cwd())

    # Show current progress if checklist exists
    if manager.data.get("tasks"):
        progress = manager.get_progress()
        print(f"\nCurrent Progress: {progress['percentage']}% ({progress.get('done', 0)}/{progress['total']})")

        next_task = manager.get_next_task()
        if next_task:
            print(f"Next task: #{next_task['id']} - {next_task['title']}")
    else:
        print("No checklist initialized. Run setup_checklist.py to create one.")
