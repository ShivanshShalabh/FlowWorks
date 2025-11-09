# FlowWorks Backend

Python FastAPI backend for FlowWorks - AI-powered n8n workflow generator.

## Setup

1. Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

5. (Optional) Configure n8n documentation source:
   - By default, the system will try to load documentation from a GitHub URL
   - You can override the URL by setting `N8N_DOCS_URL` in your `.env` file
   - Alternatively, place `n8n_documentation_cleaned_improved.json` in `backend/data/` for local loading
   - Set `N8N_DOCS_LOCAL_PATH` in `.env` to specify a custom local path

## Running the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/generate` - Generate workflow from prompt
  - Request body: `{ "prompt": "your prompt here" }`
  - Response: `{ "workflowJson": {...}, "reactFlowData": { "nodes": [...], "edges": [...] } }`

## Development

The backend uses:

- FastAPI for the web framework
- Google Gemini API for AI processing
- BeautifulSoup for web scraping
- Requests for HTTP calls

## n8n Documentation

The system automatically loads n8n documentation to provide context-aware workflow generation. The documentation is:

- Loaded from a configurable URL (default: GitHub raw file)
- Cached in memory after first load
- Used to inform the AI about available n8n nodes and their capabilities
- Enables intelligent Code node generation when standard nodes can't handle a task

The assembler function (`assemble_workflows`) and debug function (`debug_workflow`) both use this documentation to:

- Understand available n8n nodes
- Generate appropriate Code nodes (JavaScript or Python) when needed
- Create more accurate and functional workflows
