# FlowWorks

An AI-powered tool that transforms natural language prompts into valid, copy-paste-able n8n workflow JSON.

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- Python FastAPI
- Google Gemini API
- BeautifulSoup4 (web scraping)
- Requests

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Google Gemini API key

### Frontend Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file:

```bash
cp .env.example .env
```

5. Add your Gemini API key to `.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

6. Run the backend server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## Usage

1. Start both the frontend and backend servers
2. Open `http://localhost:3000` in your browser
3. Enter a natural language prompt describing your workflow (e.g., "Send a Slack notification when a new GitHub issue is created")
4. Click "Generate Workflow" or use the "Watch Me Work (Demo)" button to see an example
5. View the generated workflow visualization and JSON
6. Copy the JSON to use in n8n

## Features

- **Natural Language Processing**: Describe workflows in plain English
- **Real n8n Templates**: Fetches and modifies actual n8n workflow templates
- **Copy-Paste Ready**: Get valid n8n JSON you can use immediately
- **Keyboard Shortcuts**:
  - `Enter` to generate
  - `Escape` to clear prompt
- **Demo Mode**: One-click demo with example prompts

## Project Structure

```
/home/shiva/UB/UBHacking/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   ├── types.ts           # TypeScript types
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Hero.tsx          # Hero section with prompt input
│   ├── JsonViewer.tsx    # JSON display component
│   └── DemoButton.tsx    # Demo button component
├── lib/                   # Utility functions
│   ├── api.ts            # API client
│   └── mockData.ts       # Mock data for development
├── backend/               # Python backend
│   ├── main.py           # FastAPI app entry point
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── requirements.txt  # Python dependencies
└── package.json          # Node.js dependencies
```

## License

MIT
