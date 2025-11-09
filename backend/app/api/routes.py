from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.workflow_processor import process_workflow
from app.services.gemini_service import debug_workflow
from app.utils.reactflow_converter import convert_n8n_to_reactflow
from app.utils.status_emitter import StatusEmitter
import json
import asyncio
import queue
import concurrent.futures

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


async def generate_workflow_stream(request: GenerateRequest):
    """
    Generate workflow with streaming status updates via Server-Sent Events.
    """
    if not request.prompt or not request.prompt.strip():
        yield f"data: {json.dumps({'status': 'error', 'message': 'Prompt cannot be empty'})}\n\n"
        return

    status_emitter = StatusEmitter()
    result_container = {"value": None, "error": None}
    
    def run_workflow_sync():
        """Run workflow processing synchronously in a thread."""
        try:
            result = process_workflow(request.prompt.strip(), status_emitter)
            result_container["value"] = result
        except Exception as e:
            result_container["error"] = str(e)
        finally:
            status_emitter.close()
    
    # Start workflow processing in a background thread
    loop = asyncio.get_event_loop()
    executor = concurrent.futures.ThreadPoolExecutor()
    future = loop.run_in_executor(executor, run_workflow_sync)
    
    # Stream status updates while processing
    try:
        while not future.done():
            try:
                # Try to get an update (non-blocking with timeout)
                update = status_emitter.queue.get(timeout=0.5)
                if update.get("status") == "closed":
                    break
                yield f"data: {json.dumps(update)}\n\n"
            except queue.Empty:
                # Queue empty, check if still processing
                await asyncio.sleep(0.1)
                continue
        
        # Wait for the result
        await future
        
        # Get any remaining updates
        while True:
            try:
                update = status_emitter.queue.get_nowait()
                if update.get("status") == "closed":
                    break
                yield f"data: {json.dumps(update)}\n\n"
            except queue.Empty:
                break
        
        # Check for errors
        if result_container["error"]:
            yield f"data: {json.dumps({'status': 'error', 'message': result_container['error']})}\n\n"
            return
        
        result = result_container["value"]
        if not result:
            yield f"data: {json.dumps({'status': 'error', 'message': 'I couldn\'t find a suitable workflow template for your request. The available workflows don\'t match what you\'re looking for. Please try rephrasing your prompt or describing a different workflow.'})}\n\n"
            return
        
        # Send final result
        yield f"data: {json.dumps({'status': 'complete', 'result': result})}\n\n"
        
    except Exception as e:
        error_msg = f"An error occurred while generating the workflow: {str(e)}"
        yield f"data: {json.dumps({'status': 'error', 'message': error_msg})}\n\n"
    finally:
        executor.shutdown(wait=False)


@router.post("/api/generate")
async def generate_workflow(request: GenerateRequest):
    """
    Generate an n8n workflow from a natural language prompt with streaming status updates.

    Args:
        request: JSON body with 'prompt' field

    Returns:
        Server-Sent Events stream with status updates and final result
    """
    return StreamingResponse(
        generate_workflow_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
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
