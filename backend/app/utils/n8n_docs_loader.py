import json
import requests
import os
from typing import Dict, Any, Optional

# Cache for the documentation
_n8n_docs_cache: Optional[Dict[str, Any]] = None

# Default URL - can be overridden via environment variable
N8N_DOCS_URL = os.getenv(
    "N8N_DOCS_URL",
    "https://raw.githubusercontent.com/msavich/n8n_documentation_cleaned/refs/heads/master/n8n_documentation_cleaned_improved.json",
)


def load_n8n_documentation() -> Dict[str, Any]:
    """
    Load n8n documentation from URL or local file.
    Uses caching to avoid reloading on every call.

    Returns:
        Dictionary containing n8n documentation
    """
    global _n8n_docs_cache

    # Return cached version if available
    if _n8n_docs_cache is not None:
        return _n8n_docs_cache

    # Try to load from URL first
    try:
        print(f"Loading n8n documentation from URL: {N8N_DOCS_URL}")
        response = requests.get(N8N_DOCS_URL, timeout=30)
        response.raise_for_status()
        _n8n_docs_cache = response.json()
        print(
            f"Successfully loaded n8n documentation from URL ({len(_n8n_docs_cache)} entries)"
        )
        return _n8n_docs_cache
    except Exception as e:
        print(f"Failed to load from URL: {e}")

    # Fallback to local file
    try:
        if os.path.exists(N8N_DOCS_LOCAL_PATH):
            print(f"Loading n8n documentation from local file: {N8N_DOCS_LOCAL_PATH}")
            with open(N8N_DOCS_LOCAL_PATH, "r", encoding="utf-8") as f:
                _n8n_docs_cache = json.load(f)
            print(
                f"Successfully loaded n8n documentation from local file ({len(_n8n_docs_cache)} entries)"
            )
            return _n8n_docs_cache
    except Exception as e:
        print(f"Failed to load from local file: {e}")

    # If both fail, return empty dict with a note
    print("Warning: Could not load n8n documentation. Using empty knowledge base.")
    _n8n_docs_cache = {
        "_error": "Documentation not available",
        "_message": "n8n documentation could not be loaded. Code node generation may be limited.",
    }
    return _n8n_docs_cache


def get_documentation_summary(docs: Dict[str, Any], max_length: int = 50000) -> str:
    """
    Create a summarized version of the documentation for use in prompts.

    Args:
        docs: Full documentation dictionary
        max_length: Maximum length of the summary string

    Returns:
        Summarized documentation as string
    """
    if not docs or "_error" in docs:
        return "n8n documentation not available. Use standard n8n nodes and Code nodes as needed."

    # Convert to JSON string
    docs_str = json.dumps(docs, indent=2)

    # If it's too long, truncate intelligently
    if len(docs_str) > max_length:
        # Try to keep it at a reasonable size by truncating
        docs_str = docs_str[:max_length] + "\n... (documentation truncated)"

    return docs_str


def clear_docs_cache():
    """Clear the documentation cache (useful for testing or reloading)"""
    global _n8n_docs_cache
    _n8n_docs_cache = None
