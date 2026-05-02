import os
from fastmcp import FastMCP
from sentinel.pipeline.pipeline import run_pipeline

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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    mcp.run(transport="sse", host="0.0.0.0", port=port)