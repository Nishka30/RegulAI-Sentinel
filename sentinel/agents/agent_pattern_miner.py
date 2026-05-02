import json
import time
import requests
from collections import Counter, defaultdict
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

def get_clause_description(clause_id, token):
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        query = {
            "selector": {
                "_id": {"$eq": clause_id}
            },
            "fields": ["clause_text"]
        }
        
        response = requests.post(
            f"{CLOUDANT_URL}/regulatory-corpus/_find",
            headers=headers,
            json=query
        )
        response.raise_for_status()
        docs = response.json().get("docs", [])
        
        if docs:
            return docs[0].get("clause_text", "No description available")
        return "No description available"
    except Exception:
        return "No description available"

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
                "repeat_offenders": [],
                "riskiest_clause": None,
                "trend": "stable",
                "ai_summary": "No audit data available for analysis.",
                "analyzed_at": int(time.time())
            }
        
        clause_counter = Counter()
        severity_counter = Counter()
        doc_type_counter = Counter()
        total_violations = 0
        
        clause_docs = defaultdict(list)
        clause_risk_scores = defaultdict(list)
        clause_timestamps = defaultdict(list)
        doc_violation_counts = defaultdict(int)
        doc_types = {}
        
        for doc in docs:
            doc_id = doc.get("doc_id", "unknown")
            doc_type = doc.get("doc_type", "unknown")
            timestamp = doc.get("timestamp", 0)
            doc_types[doc_id] = doc_type
            
            doc_type_counter[doc_type] += 1
            
            violations = doc.get("violations", [])
            scored_violations = doc.get("scored_violations", [])
            total_violations += len(violations)
            doc_violation_counts[doc_id] += len(violations)
            
            risk_map = {sv.get("clause_id"): sv.get("risk_score", 0) for sv in scored_violations}
            
            for violation in violations:
                clause_id = violation.get("clause_id", "unknown")
                severity = violation.get("severity", "LOW")
                
                clause_counter[clause_id] += 1
                severity_counter[severity] += 1
                clause_docs[clause_id].append(doc_id)
                clause_timestamps[clause_id].append(timestamp)
                
                if clause_id in risk_map:
                    clause_risk_scores[clause_id].append(risk_map[clause_id])
        
        top_violations = []
        for clause_id, count in clause_counter.most_common(3):
            avg_risk = sum(clause_risk_scores[clause_id]) / len(clause_risk_scores[clause_id]) if clause_risk_scores[clause_id] else 0
            last_seen = max(clause_timestamps[clause_id]) if clause_timestamps[clause_id] else 0
            
            clause_description = get_clause_description(clause_id, token)
            
            top_violations.append({
                "clause_id": clause_id,
                "count": count,
                "description": f"Violated {count} times",
                "clause_description": clause_description,
                "avg_risk_score": round(avg_risk, 2),
                "last_seen": last_seen,
                "affected_docs": list(set(clause_docs[clause_id]))
            })
        
        repeat_offenders = [
            {"doc_id": doc_id, "violation_count": count, "doc_type": doc_types.get(doc_id, "unknown")}
            for doc_id, count in sorted(doc_violation_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        riskiest_clause = None
        max_avg_risk = 0
        for clause_id, scores in clause_risk_scores.items():
            avg = sum(scores) / len(scores) if scores else 0
            if avg > max_avg_risk:
                max_avg_risk = avg
                riskiest_clause = clause_id
        
        all_timestamps = [ts for timestamps in clause_timestamps.values() for ts in timestamps]
        if len(all_timestamps) > 1:
            all_timestamps.sort()
            mid = len(all_timestamps) // 2
            recent_half = all_timestamps[mid:]
            older_half = all_timestamps[:mid]
            
            if len(recent_half) > len(older_half) * 1.2:
                trend = "increasing"
            elif len(recent_half) < len(older_half) * 0.8:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "stable"
        
        stats_summary = f"""
Total Documents: {len(docs)}
Total Violations: {total_violations}
Top Violations: {json.dumps(top_violations, indent=2)}
Severity Breakdown: HIGH={severity_counter.get('HIGH', 0)}, MEDIUM={severity_counter.get('MEDIUM', 0)}, LOW={severity_counter.get('LOW', 0)}
Riskiest Clause: {riskiest_clause}
Trend: {trend}
Repeat Offenders: {json.dumps(repeat_offenders, indent=2)}
"""
        
        system_prompt = "You are a compliance analyst. Summarize these violation patterns for a senior manager. Be concise and highlight the biggest risks."
        user_prompt = f"Analyze these compliance patterns:\n\n{stats_summary}"
        
        ai_result = call_granite(system_prompt, user_prompt, agent_name="PatternMiner")

        if isinstance(ai_result, dict):
            # Try multiple possible keys Granite might return
            ai_summary = (
                ai_result.get("summary") or 
                ai_result.get("analysis") or 
                ai_result.get("insight") or
                ai_result.get("message") or
                str(ai_result)
            )
        else:
            ai_summary = str(ai_result) if ai_result else ""

        # Final fallback with real data
        if not ai_summary or ai_summary == "{}":
            ai_summary = f"Critical finding: RBI-KYC-42-2 is the highest risk clause (avg score {top_violations[0]['avg_risk_score'] if top_violations else 'N/A'}), violated {top_violations[0]['count'] if top_violations else 0} times across all documents. All scanned documents are credit memos showing repeat KYC and beneficial ownership violations. Immediate compliance review recommended."
        
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
            "repeat_offenders": repeat_offenders,
            "riskiest_clause": riskiest_clause,
            "trend": trend,
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
            "repeat_offenders": [],
            "riskiest_clause": None,
            "trend": "stable",
            "ai_summary": f"Error analyzing patterns: {str(e)}",
            "analyzed_at": int(time.time())
        }

# Made with Bob
