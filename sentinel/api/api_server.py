import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentinel.pipeline.pipeline import run_pipeline
from sentinel.agents.agent_pattern_miner import mine_patterns
import uvicorn

app = FastAPI(title="RegulAI Sentinel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    text: str

@app.post("/scan")
async def scan_document(request: ScanRequest):
    """Scan a document through the RegulAI Sentinel pipeline"""
    result = run_pipeline(request.text)
    return result

@app.get("/patterns")
async def get_patterns():
    """Get historical compliance violation patterns"""
    result = mine_patterns()
    return result

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

# Made with Bob
