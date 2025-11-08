from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.workflow_processor import process_workflow
from app.services.gemini_service import debug_workflow
from app.utils.reactflow_converter import convert_n8n_to_reactflow

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str


class GenerateResponse(BaseModel):
    workflowJson: dict
    reactFlowData: dict


class DebugRequest(BaseModel):
    original_prompt: str
    generated_json: dict
    bug_message: str


@router.post("/api/generate", response_model=GenerateResponse)
async def generate_workflow(request: GenerateRequest):
    """
    Generate an n8n workflow from a natural language prompt.

    Args:
        request: JSON body with 'prompt' field

    Returns:
        Workflow JSON and React Flow formatted data
    """
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        result = process_workflow(request.prompt.strip())

        if not result:
            raise HTTPException(
                status_code=404,
                detail="I couldn't find a suitable workflow template for your request. The available workflows don't match what you're looking for. Please try rephrasing your prompt or describing a different workflow.",
            )

        return GenerateResponse(
            workflowJson=result["workflowJson"], reactFlowData=result["reactFlowData"]
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating the workflow: {str(e)}",
        )


@router.post("/api/debug", response_model=GenerateResponse)
async def debug_workflow_endpoint(request: DebugRequest):
    """
    Debug and fix an existing workflow based on user feedback.

    Args:
        request: JSON body with 'original_prompt', 'generated_json', and 'bug_message' fields

    Returns:
        Fixed workflow JSON and React Flow formatted data
    """
    if not request.original_prompt or not request.original_prompt.strip():
        raise HTTPException(status_code=400, detail="Original prompt cannot be empty")

    if not request.generated_json:
        raise HTTPException(status_code=400, detail="Generated JSON cannot be empty")

    if not request.bug_message or not request.bug_message.strip():
        raise HTTPException(status_code=400, detail="Bug message cannot be empty")

    try:
        fixed_workflow = debug_workflow(
            request.original_prompt.strip(),
            request.generated_json,
            request.bug_message.strip(),
        )

        if not fixed_workflow:
            raise HTTPException(
                status_code=500,
                detail="Failed to fix the workflow. Please try again with a more specific bug description.",
            )

        # Convert to React Flow format
        reactflow_data = convert_n8n_to_reactflow(fixed_workflow)

        return GenerateResponse(
            workflowJson=fixed_workflow, reactFlowData=reactflow_data
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in debug endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while debugging the workflow: {str(e)}",
        )
