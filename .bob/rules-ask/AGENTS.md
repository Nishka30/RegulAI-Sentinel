# Ask Mode Rules (Non-Obvious Only)

## Project Documentation Context

### Directory Structure Quirks
- `sentinel/mcp/` exists but is unused - active MCP server is in `sentinel/mcpserver/`
- Both directories have identical `__init__.py` and `mcp_server.py` files
- Frontend uses Vite (not Create React App) - config in `vite.config.js`

### Database Architecture
- **Three separate Cloudant databases** (not one unified DB):
  - `governance-logs`: AI model call logs (input/output tracking)
  - `sentinel-audit-trail`: Audit results with violations/remediations
  - `regulatory-corpus`: Compliance clauses with `doc_types` array field
- No database schema files - structure inferred from agent code

### Frontend Architecture
- PDF.js loaded via CDN in `index.html` (not npm package)
- Text extraction happens client-side - PDF never uploaded to server
- `documentText` state holds extracted content invisibly
- API calls use `import.meta.env.VITE_API_URL` (Vite-specific, not process.env)

### Agent Pipeline Flow
- Sequential execution: ingest → reg_map → violation_detector → risk_scorer → remediation_writer → audit_logger
- Each agent is independent file in `sentinel/agents/` directory
- No shared state between agents - data passed via return values
- Pipeline orchestration in `sentinel/pipeline/pipeline.py`

### Environment Configuration
- Backend uses `python-dotenv` (not python-decouple)
- Frontend uses Vite env vars (VITE_ prefix required)
- No `.env.example` files exist - must infer from `settings.py`

### Model Configuration
- Hardcoded to `ibm/granite-4-h-small` in `granite_client.py` line 11
- Not configurable via environment variables
- Model params set at initialization (greedy, max 1500 tokens)