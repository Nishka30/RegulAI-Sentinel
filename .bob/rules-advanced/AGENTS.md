# Advanced Mode Rules (Non-Obvious Only)

## Critical Coding Patterns

### Granite Client JSON Handling
- `granite_client.py` lines 74-107: Aggressive JSON cleanup strips markdown, fixes control chars, auto-closes braces
- All agent responses MUST be pure JSON - no explanations, no markdown fences
- Fallback chain: strip prefix → remove fences → fix control chars → auto-close → regex extract

### Cloudant Operations
- IAM token function duplicated in 3 files: `granite_client.py`, `agent_audit_logger.py`, `agent_pattern_miner.py`
- No token caching - fetched per request
- All Cloudant operations wrapped in try/except pass - errors never propagate
- `agent_reg_map.py` uses `$elemMatch` selector for `doc_types` array field

### Agent Response Validation
- `agent_remediation_writer.py` lines 29-46: Validates dict structure before accepting
- Provides "Manual review required" fallback if validation fails
- `agent_risk_scorer.py` lines 32-43: Falls back to local SEVERITY_MAP if Granite returns empty
- `agent_pattern_miner.py` lines 175-189: Tries multiple dict keys for AI summary extraction

### Module Execution
- Backend servers MUST use module syntax: `python -m sentinel.api.api_server`
- Direct file execution will fail due to relative imports

### Pipeline Architecture
- `pipeline.py` is sequential (not parallel) - each agent blocks on previous
- No error handling between pipeline steps - failures propagate up
- `agent_doc_ingest.py` uses simple keyword matching for doc_type classification

### MCP Server Integration
- `mcpserver/mcp_server.py` uses FastMCP with stdio transport
- Exposes 4 tools: scan_document, get_violations, get_audit_report, get_pattern_report
- All tools wrap pipeline calls with try/except returning error dicts

## Code Style Enforcement

- All files end with `# Made with Bob` comment
- Import order: stdlib → third-party → local (sentinel.*)
- No type hints anywhere in codebase
- Silent error handling: try/except pass (no logging)
- Agents return dicts, not JSON strings