from typing import Dict, Any, Optional, List
from app.services.gemini_service import (
    decompose_prompt,
    evaluate_workflow_for_task,
    assemble_workflows,
    this_subtask_is_undoable,
)
from app.services.n8n_scraper import search_workflows, get_template_workflow
from app.utils.reactflow_converter import convert_n8n_to_reactflow


def process_workflow(prompt: str) -> Optional[Dict[str, Any]]:
    """
    Orchestrate the full RAG pipeline with iterative task-based search:
    1. Decompose prompt into major tasks with prioritized search queries
    2. For each task, iteratively search through queries until a match is found
    3. Collect successfully found templates (one per task)
    4. Assemble multiple workflows into a single merged workflow
    5. Convert to React Flow format

    Args:
        prompt: User's natural language prompt

    Returns:
        Dictionary with 'workflowJson' and 'reactFlowData', or None on error
    """
    try:
        # Step 1: Decompose prompt into tasks
        print(f"Step 1: Decomposing prompt into tasks")
        decomposed = decompose_prompt(prompt)
        tasks = decomposed.get("tasks", [])
        print(f"Identified {len(tasks)} major tasks")
        print(f"Tasks: {tasks}")

        if not tasks:
            print("No tasks identified from prompt")
            return None

        # Step 2: Iterative search loop for each task
        found_workflows = []  # List of (workflow_json, task_name) tuples
        failed_tasks = []

        for task_idx, task in enumerate(tasks):
            task_name = task.get("task_name", f"Task {task_idx + 1}")
            search_queries = task.get("search_queries", [])

            print(f"\nProcessing Task {task_idx + 1}: {task_name}")
            print(f"  Search queries: {search_queries}")

            task_found = False

            # Iterate through search queries from most specific to least specific
            for query_idx, query in enumerate(search_queries):
                print(
                    f"  Trying query {query_idx + 1}/{len(search_queries)}: '{query}'"
                )

                # Search for workflows using the new API
                workflow_results = search_workflows(query, max_results=20)
                print(f"    Found {len(workflow_results)} workflows")

                if not workflow_results:
                    print(
                        f"    No workflows found for query '{query}', trying next query..."
                    )
                    continue

                # Try each workflow until we find a good match
                for workflow_info in workflow_results:
                    template_id = workflow_info["id"]
                    workflow_name = workflow_info["name"]
                    print(
                        f"    Evaluating workflow {template_id}: '{workflow_name}'..."
                    )

                    # Fetch the full workflow JSON
                    workflow_json = get_template_workflow(template_id)
                    if not workflow_json:
                        print(f"    Failed to fetch workflow {template_id}")
                        continue

                    # Evaluate if this workflow fits the task
                    if evaluate_workflow_for_task(task_name, workflow_json):
                        print(
                            f"    ✓ Template {template_id} ('{workflow_name}') fits task '{task_name}'"
                        )
                        found_workflows.append((workflow_json, task_name))
                        task_found = True
                        break  # Break inner loop - found a match for this task
                    else:
                        print(
                            f"    ✗ Template {template_id} ('{workflow_name}') does not fit task '{task_name}'"
                        )

                if task_found:
                    break  # Break outer loop - found a match, move to next task

            if not task_found:
                print(f"  ✗ Failed to find a template for task '{task_name}'")
                if this_subtask_is_undoable(task_name):
                    raise ValueError(f"Task '{task_name}' is undoable")
                failed_tasks.append(task_name)

        # Step 3: Handle partial and total failure
        if not found_workflows:
            print("\n✗ Failed to find templates for ALL tasks")
            return None

        if failed_tasks:
            print(
                f"\n⚠ Warning: Failed to find templates for {len(failed_tasks)} task(s): {failed_tasks}"
            )
            print(
                f"  Continuing with {len(found_workflows)} successfully found workflow(s)"
            )

        print(f"\n✓ Successfully found {len(found_workflows)} workflow(s) for assembly")

        # Step 4: Assemble workflows
        print(
            f"\nStep 4: Assembling {len(found_workflows)} workflows into a single workflow"
        )
        workflows = [wf for wf, _ in found_workflows]
        task_names = [name for _, name in found_workflows]

        try:
            merged_workflow = assemble_workflows(prompt, workflows, task_names)
            print(
                f"✓ Successfully assembled workflow with {len(merged_workflow.get('nodes', []))} nodes"
            )
        except ValueError as e:
            error_msg = str(e)
            if "All tasks are undoable" in error_msg:
                print(f"✗ {error_msg}")
                return None
            else:
                print(f"⚠ Warning during assembly: {error_msg}")
                # Try to continue with a simpler merge
                # For now, just use the first workflow as fallback
                if workflows:
                    merged_workflow = workflows[0]
                    print("  Using first workflow as fallback")
                else:
                    return None

        # Step 5: Convert to React Flow format
        print(f"\nStep 5: Converting to React Flow format")
        reactflow_data = convert_n8n_to_reactflow(merged_workflow)

        return {"workflowJson": merged_workflow, "reactFlowData": reactflow_data}

    except Exception as e:
        print(f"Error in workflow processing pipeline: {e}")
        import traceback

        traceback.print_exc()
        return None
