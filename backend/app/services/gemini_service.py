import os
import json
import google.generativeai as genai
from typing import Dict, Any, Optional, List

# Initialize Gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def decompose_prompt(prompt: str) -> Dict[str, Any]:
    """
    Decompose user prompt into major tasks with prioritized search queries.

    Args:
        prompt: User's natural language prompt

    Returns:
        Dictionary with 'tasks' list, where each task has 'task_name' and 'search_queries'
    """
    model = genai.GenerativeModel("gemini-2.5-flash")

    instruction = f"""You are an expert at decomposing automation requests into distinct major tasks. 
    
Your goal is to break down the user's prompt into separate, independent tasks (like "Move Outlook Email to Folder" or "reply to Outlook Email"). 
For each task, generate a prioritized list of search queries (from most specific to least specific) that would help find n8n workflow templates.

IMPORTANT:
- Each task should be a distinct, independent action
- Search queries should be ordered from MOST SPECIFIC to LEAST SPECIFIC
- Use 2-5 words per search query
- Focus on integrations (Outlook, Gmail, Slack) and actions (move folder, auto-reply, send notification) but generalise the action name and make it more generic. Example: "Auto-reply" -> "Reply", "Email Reminder" -> "Email"

Example:
User prompt: "Make a workflow to review my outlook emails, check which course is it relevant for, if related to my course, and assign it relevant folder."

Output:
{{
  "tasks": [
    {{
      "task_name": "Move Outlook Email to Folder",
      "search_queries": [
        "outlook email move folder",
        "outlook automation folder",
        "outlook organize email"
      ]
    }},
    {{
      "task_name": "Auto-reply to Outlook Email",
      "search_queries": [
        "outlook reply",
        "email reply",
        "outlook automated response"
      ]
    }}
  ]
}}

User prompt: {prompt}

Return ONLY valid JSON in the exact format above, nothing else:"""

    try:
        response = model.generate_content(instruction)

        response_text = response.text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        # Try to extract JSON from the response
        # Sometimes the response might have extra text, so find the JSON object
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}") + 1

        if start_idx >= 0 and end_idx > start_idx:
            response_text = response_text[start_idx:end_idx]

        decomposed = json.loads(response_text)

        # Validate structure
        if "tasks" not in decomposed or not isinstance(decomposed["tasks"], list):
            raise ValueError("Invalid response structure: missing 'tasks' list")

        # Ensure each task has required fields
        for task in decomposed["tasks"]:
            if "task_name" not in task or "search_queries" not in task:
                raise ValueError(
                    "Invalid task structure: missing 'task_name' or 'search_queries'"
                )
            if (
                not isinstance(task["search_queries"], list)
                or len(task["search_queries"]) == 0
            ):
                raise ValueError(
                    "Invalid task: 'search_queries' must be a non-empty list"
                )

        return decomposed

    except Exception as e:
        print(f"Error decomposing prompt: {e}")
        # Fallback: create a single task with basic search queries
        words = prompt.split()[:5]
        return {
            "tasks": [
                {
                    "task_name": "Main Automation Task",
                    "search_queries": [
                        " ".join(words),
                        " ".join(words[:3]),
                        " ".join(words[:2]),
                    ],
                }
            ]
        }


def evaluate_workflow_for_task(
    task_description: str, workflow_json: Dict[str, Any]
) -> bool:
    """
    Evaluate if a single workflow template fits a specific task.

    Args:
        task_description: Description of the task (e.g., "Move Outlook Email to Folder")
        workflow_json: The workflow JSON to evaluate

    Returns:
        True if the workflow can be modified to fit the task, False otherwise
    """
    model = genai.GenerativeModel("gemini-2.5-flash")

    # Extract workflow name and basic info
    workflow_name = workflow_json.get("name", "Unknown Workflow")
    node_count = len(workflow_json.get("nodes", []))

    instruction = f"""You are evaluating if an n8n workflow template can be modified to accomplish a specific task.

Task: {task_description}

Workflow Name: {workflow_name}
Number of Nodes: {node_count}

Your task:
1. Determine if this workflow can be reasonably modified (by changing parameters only) to accomplish the task
2. Consider if the workflow structure (nodes and connections) is compatible with the task
3. Respond with ONLY "YES" if it can be modified, or "NO" if it cannot

Your response (YES or NO):"""

    try:
        response = model.generate_content(instruction)
        response_text = response.text.strip().upper()

        return "YES" in response_text and "NO" not in response_text

    except Exception as e:
        print(f"Error evaluating workflow for task: {e}")
        # Fallback: assume it fits
        return True


def assemble_workflows(
    prompt: str, workflows: List[Dict[str, Any]], task_names: List[str]
) -> Dict[str, Any]:
    """
    The "AI Assembler" - Intelligently merges multiple workflow templates into a single workflow.
    Now includes n8n documentation awareness and Code node generation capability.

    Args:
        prompt: User's original natural language prompt
        workflows: List of workflow JSON objects to merge
        task_names: List of task names corresponding to each workflow

    Returns:
        Merged workflow JSON, or raises an exception if assembly fails
    """
    from app.utils.n8n_docs_loader import (
        load_n8n_documentation,
        get_documentation_summary,
    )

    model = genai.GenerativeModel("gemini-2.5-pro")

    # Load n8n documentation
    n8n_docs = load_n8n_documentation()
    knowledge_base = get_documentation_summary(n8n_docs, max_length=50000)

    # Prepare workflow summaries for the prompt
    workflow_summaries = []
    for i, (wf, task_name) in enumerate(zip(workflows, task_names)):
        workflow_summaries.append(
            f"Workflow {i+1} (Task: {task_name}):\n"
            f"  Name: {wf.get('name', 'Unknown')}\n"
            f"  Nodes: {len(wf.get('nodes', []))}\n"
            f"  JSON: {json.dumps(wf, indent=2)}"
        )

    context_json = "\n\n".join(workflow_summaries)

    instruction = f"""You are a Staff n8n Architect and a senior Python/JavaScript developer. Your job is to generate a single, valid, and logical n8n workflow JSON that achieves the user's goal.

=== USER_GOAL ===
{prompt}

=== KNOWLEDGE_BASE (n8n Documentation) ===
{knowledge_base}

=== CONTEXT_JSON (Templates to Merge) ===
{context_json}

=== CRITICAL RULE: THE "CODE" NODE ===

If a user's task (like "extract specific text from an HTML body," "parse a complex custom string," "perform a unique calculation," or "call an unsupported API") cannot be done by a standard node in the KNOWLEDGE_BASE, you MUST generate a n8n-nodes-base.code node.

Choose the best language (JavaScript or Python) based on the task:
- Use JavaScript for: DOM manipulation, JSON parsing, string operations, array/object transformations
- Use Python for: Complex data analysis, mathematical operations, file operations, advanced string processing

Write the jsCode or pythonCode to perform the custom task. The code should:
- Process items from $input.all() (JavaScript) or _input.all() (Python)
- Return the processed items
- Access previous node data using $json, $binary, etc. (JavaScript) or item.json, item.binary (Python)

Logically connect this Code node in the workflow.

Here are the JSON templates for the Code node:

JavaScript (n8n-nodes-base.code):
{{
  "parameters": {{
    "jsCode": "// Your custom JavaScript code here\\nfor (const item of $input.all()) {{\\n  item.json.myNewField = 'myComputedValue';\\n}}\\nreturn $input.all();"
  }},
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "name": "Run Custom JavaScript"
}}

Python (n8n-nodes-base.code):
{{
  "parameters": {{
    "language": "python",
    "pythonCode": "# Your custom Python code here\\nfor item in _input.all():\\n  item.json['myNewField'] = 'myComputedValue'\\nreturn _input.all()"
  }},
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "name": "Run Custom Python"
}}

=== ASSEMBLY RULES ===

1. Merge nodes from all workflows into a single workflow
2. Connect nodes logically to create a flow that accomplishes all tasks
3. Remove duplicate nodes (e.g., if multiple workflows have the same trigger)
4. Ensure the final workflow has a logical flow from start to finish
5. You may need to add connection nodes or modify node parameters to link workflows together
6. Use Code nodes when standard nodes cannot accomplish a task
7. If a task is impossible to integrate or conflicts with another task, you can declare it undoable
8. Return the complete merged workflow JSON

If you determine that a specific task cannot be integrated, respond with:
"UNDOABLE_TASKS: [task_name1, task_name2]"

Then provide the merged workflow JSON for the remaining tasks.

If ALL tasks are undoable, respond with:
"ALL_UNDOABLE: [task_name1, task_name2, ...]"

Otherwise, return the complete merged workflow JSON.

Your response:"""

    try:
        response = model.generate_content(instruction)

        response_text = response.text.strip()

        # Check for undoable tasks
        if "ALL_UNDOABLE:" in response_text:
            undoable_tasks = (
                response_text.split("ALL_UNDOABLE:")[1].split("\n")[0].strip()
            )
            raise ValueError(f"All tasks are undoable: {undoable_tasks}")

        if "UNDOABLE_TASKS:" in response_text:
            undoable_part = (
                response_text.split("UNDOABLE_TASKS:")[1].split("\n")[0].strip()
            )
            # Extract the merged workflow (after the undoable declaration)
            json_start = response_text.find(
                "{", response_text.find("UNDOABLE_TASKS:") + len("UNDOABLE_TASKS:")
            )
            if json_start > 0:
                response_text = response_text[json_start:]
            print(f"Warning: Some tasks are undoable: {undoable_part}")

        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        # Extract JSON
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}") + 1

        if start_idx >= 0 and end_idx > start_idx:
            response_text = response_text[start_idx:end_idx]

        merged_workflow = json.loads(response_text)
        return merged_workflow

    except json.JSONDecodeError as e:
        print(f"Error parsing assembled workflow JSON: {e}")
        print(f"Response text: {response_text[:500]}")
        raise ValueError("Failed to parse assembled workflow JSON")
    except Exception as e:
        print(f"Error assembling workflows: {e}")
        raise


def debug_workflow(
    original_prompt: str, generated_json: Dict[str, Any], bug_message: str
) -> Optional[Dict[str, Any]]:
    """
    Debug and fix a workflow based on user feedback.
    Now includes n8n documentation awareness and Code node generation capability.

    Args:
        original_prompt: The user's original goal/prompt
        generated_json: The previously generated workflow JSON that has issues
        bug_message: The user's description of what's wrong

    Returns:
        Fixed workflow JSON, or None on error
    """
    from app.utils.n8n_docs_loader import (
        load_n8n_documentation,
        get_documentation_summary,
    )

    model = genai.GenerativeModel("gemini-2.5-pro")

    # Load n8n documentation
    n8n_docs = load_n8n_documentation()
    knowledge_base = get_documentation_summary(n8n_docs, max_length=50000)

    instruction = f"""You are a Staff n8n Architect and a senior Python/JavaScript developer. Your job is to debug and fix an n8n workflow JSON that has issues.

=== USER_GOAL ===
{original_prompt}

=== KNOWLEDGE_BASE (n8n Documentation) ===
{knowledge_base}

=== CONTEXT_JSON (Workflow to Fix) ===
{json.dumps(generated_json, indent=2)}

=== BUG_REPORT ===
{bug_message}

=== CRITICAL RULE: THE "CODE" NODE ===

If fixing the bug requires functionality that cannot be done by a standard node in the KNOWLEDGE_BASE, you MUST generate a n8n-nodes-base.code node.

Choose the best language (JavaScript or Python) based on the task:
- Use JavaScript for: DOM manipulation, JSON parsing, string operations, array/object transformations
- Use Python for: Complex data analysis, mathematical operations, file operations, advanced string processing

Write the jsCode or pythonCode to perform the custom task. The code should:
- Process items from $input.all() (JavaScript) or _input.all() (Python)
- Return the processed items
- Access previous node data using $json, $binary, etc. (JavaScript) or item.json, item.binary (Python)

Logically connect this Code node in the workflow.

Here are the JSON templates for the Code node:

JavaScript (n8n-nodes-base.code):
{{
  "parameters": {{
    "jsCode": "// Your custom JavaScript code here\\nfor (const item of $input.all()) {{\\n  item.json.myNewField = 'myComputedValue';\\n}}\\nreturn $input.all();"
  }},
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "name": "Run Custom JavaScript"
}}

Python (n8n-nodes-base.code):
{{
  "parameters": {{
    "language": "python",
    "pythonCode": "# Your custom Python code here\\nfor item in _input.all():\\n  item.json['myNewField'] = 'myComputedValue'\\nreturn _input.all()"
  }},
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "name": "Run Custom Python"
}}

=== YOUR TASK ===

Analyze all the information above. Find the error in the parameters, connections, or logic of the provided JSON. Then, return the full, corrected, and valid n8n workflow JSON.

If the bug fix requires custom logic that standard nodes can't handle, use a Code node.

Respond only with the raw, corrected JSON object and nothing else."""

    try:
        response = model.generate_content(instruction)

        response_text = response.text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        # Extract JSON
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}") + 1

        if start_idx >= 0 and end_idx > start_idx:
            response_text = response_text[start_idx:end_idx]

        fixed_workflow = json.loads(response_text)
        return fixed_workflow

    except json.JSONDecodeError as e:
        print(f"Error parsing debug workflow JSON: {e}")
        print(f"Response text: {response_text[:500]}")
        return None
    except Exception as e:
        print(f"Error debugging workflow: {e}")
        return None


def this_subtask_is_undoable(task_name: str) -> bool:
    """
    Checks if a subtask is fundamentally impossible for n8n.

    This is called *after* a template search fails. It uses an LLM to
    differentiate between:
    1.  **Possible (but custom)** tasks (e.g., "fetch data from unsupported API")
        -> This function will return **False**.
    2.  **Impossible** tasks (e.g., "print a document")
        -> This function will return **True**.

    Args:
        task_name: The name of the subtask (e.g., "print the invoice")

    Returns:
        True if the LLM classifies the task as impossible, False otherwise.
    """
    try:
        # Using a valid, fast model
        model = genai.GenerativeModel("gemini-2.5-flash")

        # This is the new, improved prompt that you pass to the model.
        # It correctly includes the `task_name` variable.
        instruction = f"""You are an n8n automation expert. I will give you a task. You must decide if this task is **fundamentally impossible** for a server-side automation tool like n8n, or if it is just a custom/unsupported task.

- Respond **YES** if the task is **impossible**.
  - **Impossible** tasks involve controlling a user's local hardware (e.g., "print a document", "scan a file", "control my mouse"), or interacting with their local OS (e.g., "open a window on my desktop").

- Respond **NO** if the task is **possible** (even if it's hard or custom).
  - **Possible** tasks include:
    - Accessing *any* 3rd party API, even if it's unsupported (this can be done with the 'HTTP Request' or 'Code' node).
    - Performing complex data transformations.
    - Connecting to any database.
    - E.g., "Fetch data from the 'MySpecificCRM' API" -> NO
    - E.g., "Calculate the a-star path for my data" -> NO

---
TASK: "{task_name}"
---

Is this task fundamentally impossible for n8n? Respond with only YES or NO.
"""

        # The prompt MUST be passed to generate_content
        response = model.generate_content(instruction)

        # Make the check more robust
        response_text = response.text.strip().upper()

        # Return True only if the response is "YES"
        return response_text == "YES"

    except Exception as e:
        print(f"Error in is_task_fundamentally_impossible: {e}")
        # Default to "False" (assume it's possible) to be optimistic
        return False
