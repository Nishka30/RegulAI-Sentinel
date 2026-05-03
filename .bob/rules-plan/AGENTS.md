# Plan Mode Rules (Non-Obvious Only)

## Architectural Constraints

### Pipeline Design
- **Sequential execution only** - no parallel processing
- Each agent blocks until previous completes
- No retry logic - failures propagate immediately up the stack
- Pipeline defined in `sentinel/pipeline/pipeline.py` with hardcoded agent order

### Agent Coupling
- Agents are loosely coupled via dict return values
- No shared state or global variables between agents
- Each agent independently calls Granite AI (no shared client instance)
- `agent_doc_ingest.py` determines doc_type that affects all downstream agents

### Database Dependencies
- Three separate Cloudant databases with no foreign key relationships
- `regulatory-corpus` must be pre-populated for `agent_reg_map.py` to work
- Hardcoded fallback frameworks exist if Cloudant queries fail
- No database migrations or schema versioning

### Error Handling Strategy
- All Cloudant operations fail silently (try/except pass)
- Granite AI errors propagate but are logged to governance-logs
- Frontend receives full error stack traces (no sanitization)
- No circuit breakers or rate limiting

### Frontend-Backend Contract
- Frontend sends only `text` field in POST /scan
- Backend returns full audit object with nested violations/remediations
- No pagination - all results returned in single response
- PDF processing happens entirely client-side (no backend involvement)

### Scalability Limitations
- IAM token fetched per request (no caching or connection pooling)
- Each agent makes separate Granite AI call (no batching)
- Pattern mining loads entire audit trail into memory
- No background job processing - all synchronous