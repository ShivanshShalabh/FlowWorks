from typing import Dict, Any, Optional, List, Callable
from app.services.gemini_service import (
    decompose_prompt,
    evaluate_workflow_for_task,
    assemble_workflows,
    this_subtask_is_undoable,
)
from app.services.n8n_scraper import search_workflows, get_template_workflow
from app.utils.reactflow_converter import convert_n8n_to_reactflow
from app.utils.status_emitter import StatusEmitter


def process_workflow(prompt: str, status_emitter: Optional[StatusEmitter] = None) -> Optional[Dict[str, Any]]:
    """
    Orchestrate the full RAG pipeline with iterative task-based search:
    1. Decompose prompt into major tasks with prioritized search queries
    2. For each task, iteratively search through queries until a match is found
    3. Collect successfully found templates (one per task)
    4. Assemble multiple workflows into a single merged workflow
    5. Convert to React Flow format

    Args:
        prompt: User's natural language prompt
        status_emitter: Optional StatusEmitter to send status updates to frontend

    Returns:
        Dictionary with 'workflowJson' and 'reactFlowData', or None on error
    """
    def emit(status: str, message: str, details: Optional[dict] = None):
        if status_emitter:
            status_emitter.emit(status, message, details)
        print(f"[{status.upper()}] {message}")
    
    try:
        # Step 1: Decompose prompt into tasks
        emit("info", "Analyzing your request and breaking it down into tasks...")
        decomposed = decompose_prompt(prompt)
        tasks = decomposed.get("tasks", [])
        
        if tasks:
            task_names = [t.get("task_name", "Unknown") for t in tasks]
            emit("success", f"Identified {len(tasks)} major task(s)", {"tasks": task_names})
        else:
            emit("error", "Could not identify tasks from your prompt")

        if not tasks:
            return None

        # Step 2: Iterative search loop for each task
        found_workflows = []  # List of (workflow_json, task_name) tuples
        failed_tasks = []

        for task_idx, task in enumerate(tasks):
            task_name = task.get("task_name", f"Task {task_idx + 1}")
            search_queries = task.get("search_queries", [])

            emit("info", f"Searching for workflow templates for: {task_name}", {
                "taskIndex": task_idx + 1,
                "totalTasks": len(tasks)
            })

            task_found = False

            # Iterate through search queries from most specific to least specific
            for query_idx, query in enumerate(search_queries):
                emit("progress", f"Trying search: '{query}'", {
                    "queryIndex": query_idx + 1,
                    "totalQueries": len(search_queries)
                })

                # Search for workflows using the new API
                workflow_results = search_workflows(query, max_results=20)
                
                if not workflow_results:
                    continue

                emit("info", f"Found {len(workflow_results)} potential workflow(s), evaluating...")

                # Try each workflow until we find a good match
                for workflow_info in workflow_results:
                    template_id = workflow_info["id"]
                    workflow_name = workflow_info["name"]
                    
                    emit("progress", f"Evaluating: {workflow_name}", {
                        "workflowId": template_id
                    })

                    # Fetch the full workflow JSON
                    workflow_json = get_template_workflow(template_id)
                    if not workflow_json:
                        continue

                    # Evaluate if this workflow fits the task
                    if evaluate_workflow_for_task(task_name, workflow_json):
                        emit("success", f"✓ Found matching workflow: {workflow_name}", {
                            "workflowId": template_id,
                            "workflowName": workflow_name
                        })
                        found_workflows.append((workflow_json, task_name))
                        task_found = True
                        break  # Break inner loop - found a match for this task

                if task_found:
                    break  # Break outer loop - found a match, move to next task

            if not task_found:
                emit("warning", f"Could not find a suitable template for: {task_name}")
                if this_subtask_is_undoable(task_name):
                    emit("error", f"Task '{task_name}' is not possible with n8n")
                    raise ValueError(f"Task '{task_name}' is undoable")
                failed_tasks.append(task_name)

        # Step 3: Handle partial and total failure
        if not found_workflows:
            emit("error", "Could not find suitable templates for any task")
            return None

        if failed_tasks:
            emit("warning", f"Continuing with {len(found_workflows)} workflow(s) (some tasks could not be matched)", {
                "failedTasks": failed_tasks,
                "foundWorkflows": len(found_workflows)
            })

        emit("info", f"Assembling {len(found_workflows)} workflow(s) into a single workflow...")

        # Step 4: Assemble workflows
        workflows = [wf for wf, _ in found_workflows]
        task_names = [name for _, name in found_workflows]

        try:
            emit("progress", "Merging workflows and optimizing connections...")
            merged_workflow = assemble_workflows(prompt, workflows, task_names)
            node_count = len(merged_workflow.get('nodes', []))
            emit("success", f"✓ Workflow assembled successfully with {node_count} node(s)", {
                "nodeCount": node_count
            })
        except ValueError as e:
            error_msg = str(e)
            if "All tasks are undoable" in error_msg:
                emit("error", "All tasks are not possible to integrate")
                return None
            else:
                emit("warning", "Using simplified workflow assembly", {"error": error_msg})
                # Try to continue with a simpler merge
                if workflows:
                    merged_workflow = workflows[0]
                    emit("info", "Using first workflow as fallback")
                else:
                    return None

        # Step 5: Convert to React Flow format
        emit("info", "Finalizing workflow format...")
        reactflow_data = convert_n8n_to_reactflow(merged_workflow)
        emit("success", "Workflow generation complete!", {
            "nodeCount": len(merged_workflow.get('nodes', []))
        })

        return {"workflowJson": merged_workflow, "reactFlowData": reactflow_data}

    except Exception as e:
        print(f"Error in workflow processing pipeline: {e}")
        import traceback

        traceback.print_exc()
        return None
