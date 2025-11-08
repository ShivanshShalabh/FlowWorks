import requests
from typing import Optional, List, Dict, Any


def search_workflows(query: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Search for n8n workflows using the product API endpoint.

    Args:
        query: Search query string
        max_results: Maximum number of workflows to return (default: 20)

    Returns:
        List of dictionaries with 'id', 'name', and 'description' keys
    """
    try:
        # Calculate number of pages needed
        rows_per_page = 10
        pages_needed = (max_results + rows_per_page - 1) // rows_per_page

        all_workflows = []

        for page in range(1, pages_needed + 1):
            # Build the API URL
            api_url = f"https://n8n.io/api/product-api/workflows/search"
            params = {"search": query, "rows": rows_per_page, "page": page}

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            }

            response = requests.get(api_url, params=params, headers=headers, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract workflows from response
            workflows = data.get("workflows", [])

            if not workflows:
                break  # No more results

            # Extract relevant information
            for workflow in workflows:
                workflow_info = {
                    "id": str(workflow.get("id", "")),
                    "name": workflow.get("name", ""),
                    "description": workflow.get("description", ""),
                }

                # Only add if we have an ID and name
                if workflow_info["id"] and workflow_info["name"]:
                    all_workflows.append(workflow_info)

                # Stop if we have enough results
                if len(all_workflows) >= max_results:
                    break

            # If we got fewer results than requested, we've reached the end
            if len(workflows) < rows_per_page:
                break

        return all_workflows[:max_results]

    except Exception as e:
        print(f"Error searching workflows: {e}")
        return []


def get_template_workflow(template_id: str) -> Optional[dict]:
    """
    Fetch the workflow JSON from n8n API using the template ID.

    Args:
        template_id: n8n template ID

    Returns:
        Workflow JSON object or None if not found
    """
    try:
        api_url = f"https://api.n8n.io/api/workflows/templates/{template_id}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
        }

        response = requests.get(api_url, headers=headers, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Extract the workflow object from the response
        # The API might return it in different formats, so we check common structures
        if "workflow" in data:
            return data["workflow"]
        elif "data" in data and "workflow" in data["data"]:
            return data["data"]["workflow"]
        elif "nodes" in data:
            # If the response is already a workflow object
            return data
        else:
            # Return the whole response if structure is unclear
            return data

    except Exception as e:
        print(f"Error fetching template workflow: {e}")
        return None
