# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build & Run Commands

**Backend:**
```bash
# Install dependencies (no poetry, uses pip with pyproject.toml)
pip install -e .

# Run API server (must use module syntax, not direct file execution)
python -m sentinel.api.api_server

# Run MCP server (stdio transport for Claude Desktop integration)
python -m sentinel.mcpserver.mcp_server
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Vite dev server
```

## Critical Non-Obvious Patterns

### Granite AI Response Handling
- **CRITICAL**: `granite_client.py` has aggressive JSON cleanup logic (lines 74-107)
- Strips everything before first `{`, removes markdown fences, fixes control chars
- Auto-closes unclosed braces/brackets if JSON parsing fails
- Falls back to regex extraction `\{.*\}` as last resort
- All agents MUST return pure JSON (no explanations, no markdown)

### Cloudant Database Integration
- **Two separate databases**: `governance-logs` (AI call logs) and `sentinel-audit-trail` (audit results)
- **Third database**: `regulatory-corpus` stores compliance clauses with `doc_types` array field
- IAM token fetched per request (no caching) - function duplicated across 3 files
- All Cloudant operations silently fail (wrapped in try/except pass) - no error propagation
- `agent_reg_map.py` uses Cloudant `$elemMatch` selector to query by doc_type

### Agent Pipeline Flow
- Pipeline in `pipeline.py` is **sequential** (not parallel) - each agent waits for previous
- `agent_doc_ingest.py` does simple keyword detection ("credit memo", "loan") for doc_type
- `agent_reg_map.py` has hardcoded fallback frameworks if Cloudant query fails
- `agent_risk_scorer.py` has local SEVERITY_MAP fallback if Granite returns empty
- `agent_remediation_writer.py` validates response structure and provides "Manual review required" fallback

### Frontend PDF Handling
- PDF.js extracts text **client-side** (never uploaded to server)
- Text extraction is silent - user never sees raw extracted text
- `documentText` state holds extracted content, sent to `/scan` endpoint
- PDF viewer is iframe with 400px height, dark border styling

### Environment Variables
- Backend requires: `WATSONX_URL`, `WATSONX_APIKEY`, `PROJECT_ID`, `CLOUDANT_URL`, `CLOUDANT_APIKEY`
- Frontend requires: `VITE_API_URL` (default: http://localhost:8000)
- Uses `python-dotenv` for loading (not python-decouple or other libs)

### Model Configuration
- Hardcoded model: `ibm/granite-4-h-small` (not configurable via env)
- Params: greedy decoding, max 1500 tokens, min 5 tokens, repetition penalty 1.1
- No temperature setting (uses defaults)

## Code Style

- All files end with `# Made with Bob` comment
- Import order: stdlib → third-party → local (sentinel.*)
- No type hints used (pure Python 3.8+ without typing)
- Error handling: silent failures with pass (no logging)
- JSON responses: agents return dicts, not JSON strings