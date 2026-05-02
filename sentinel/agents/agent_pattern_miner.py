import json
import time
import requests
from collections import Counter
from sentinel.config.settings import CLOUDANT_URL, CLOUDANT_APIKEY
from sentinel.core.granite_client import call_granite

def get_iam_token(api_key):
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "urn:ibm:params:oauth:grant-type:apikey", "apikey": api_key}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def mine_patterns():
    try:
        token = get_iam_token(CLOUDANT_APIKEY)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{CLOUDANT_URL}/sentinel-audit-trail/_all_docs",
            headers=headers,
            params={"include_docs": "true"}
        )
        response.raise_for_status()
        
        docs = [row["doc"] for row in response.json().get("rows", []) if "doc" in row]
        
        if not docs:
            return {
                "total_documents_analyzed": 0,
                "total_violations": 0,
                "top_violations": [],
                "severity_breakdown": {"HIGH": 0, "MEDIUM": 0, "LOW": 0},
                "doc_type_breakdown": {},
                "ai_summary": "No audit data available for analysis.",
                "analyzed_at": int(time.time())
            }
        
        clause_counter = Counter()
        severity_counter = Counter()
        doc_type_counter = Counter()
        total_violations = 0
        
        for doc in docs:
            doc_type = doc.get("doc_type", "unknown")
            doc_type_counter[doc_type] += 1
            
            violations = doc.get("violations", [])
            total_violations += len(violations)
            
            for violation in violations:
                clause_id = violation.get("clause_id", "unknown")
                severity = violation.get("severity", "LOW")
                
                clause_counter[clause_id] += 1
                severity_counter[severity] += 1
        
        top_violations = [
            {"clause_id": clause_id, "count": count, "description": f"Violated {count} times"}
            for clause_id, count in clause_counter.most_common(3)
        ]
        
        stats_summary = f"""
Total Documents: {len(docs)}
Total Violations: {total_violations}
Top Violations: {json.dumps(top_violations, indent=2)}
Severity Breakdown: HIGH={severity_counter.get('HIGH', 0)}, MEDIUM={severity_counter.get('MEDIUM', 0)}, LOW={severity_counter.get('LOW', 0)}
Document Types: {dict(doc_type_counter)}
"""
        
        system_prompt = "You are a compliance analyst. Summarize these violation patterns for a senior manager. Be concise and highlight the biggest risks."
        user_prompt = f"Analyze these compliance patterns:\n\n{stats_summary}"
        
        ai_result = call_granite(system_prompt, user_prompt, agent_name="PatternMiner")
        ai_summary = ai_result.get("summary", "Analysis complete. Review detailed statistics.") if isinstance(ai_result, dict) else str(ai_result)
        
        return {
            "total_documents_analyzed": len(docs),
            "total_violations": total_violations,
            "top_violations": top_violations,
            "severity_breakdown": {
                "HIGH": severity_counter.get("HIGH", 0),
                "MEDIUM": severity_counter.get("MEDIUM", 0),
                "LOW": severity_counter.get("LOW", 0)
            },
            "doc_type_breakdown": dict(doc_type_counter),
            "ai_summary": ai_summary,
            "analyzed_at": int(time.time())
        }
        
    except Exception as e:
        return {
            "total_documents_analyzed": 0,
            "total_violations": 0,
            "top_violations": [],
            "severity_breakdown": {"HIGH": 0, "MEDIUM": 0, "LOW": 0},
            "doc_type_breakdown": {},
            "ai_summary": f"Error analyzing patterns: {str(e)}",
            "analyzed_at": int(time.time())
        }

# Made with Bob
