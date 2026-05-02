import os
import json
from fastmcp import FastMCP
from sentinel.pipeline.pipeline import run_pipeline
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.middleware.cors import CORSMiddleware
import uvicorn

mcp = FastMCP("RegulAI Sentinel")

@mcp.tool()
def scan_document(text: str) -> dict:
    """Scan a document through the full RegulAI Sentinel pipeline."""
    try:
        return run_pipeline(text)
    except Exception as e:
        return {"error": str(e)}

@mcp.tool()
def get_violations(text: str) -> list:
    """Get only the violations list from a document scan."""
    try:
        return run_pipeline(text).get("violations", [])
    except Exception:
        return []

@mcp.tool()
def get_audit_report(text: str) -> dict:
    """Get a summary audit report."""
    try:
        result = run_pipeline(text)
        return {
            "audit_id": result.get("audit_id"),
            "timestamp": result.get("timestamp"),
            "violations": result.get("violations", [])
        }
    except Exception as e:
        return {"error": str(e)}

@mcp.tool()
def get_pattern_report() -> dict:
    """Analyze historical compliance data and return violation patterns"""
    from sentinel.agents.agent_pattern_miner import mine_patterns
    return mine_patterns()

async def scan_endpoint(request: Request):
    body = await request.json()
    text = body.get("text", "")
    result = run_pipeline(text)
    return JSONResponse(result)

async def health(request: Request):
    return JSONResponse({"status": "ok"})

async def patterns_endpoint(request: Request):
    from sentinel.agents.agent_pattern_miner import mine_patterns
    return JSONResponse(mine_patterns())

routes = [
    Route("/scan", scan_endpoint, methods=["POST"]),
    Route("/health", health, methods=["GET"]),
    Route("/patterns", patterns_endpoint, methods=["GET"]),
]

rest_app = Starlette(routes=routes)
rest_app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(rest_app, host="0.0.0.0", port=port)