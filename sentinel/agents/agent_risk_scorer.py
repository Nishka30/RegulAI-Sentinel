import json
from sentinel.core.granite_client import call_granite

SEVERITY_MAP = {"HIGH": 5, "MEDIUM": 3, "LOW": 1}

def score_risks(violations):
    if not violations:
        return {"scored_violations": []}

    system_prompt = "You are a risk analyst. Return only valid JSON. No explanations."

    user_prompt = f"""Score each violation with risk_score and priority (1-5).

VIOLATIONS:
{json.dumps(violations, indent=2)}

Return exactly this JSON:
{{
  "scored_violations": [
    {{
      "clause_id": "string",
      "severity": "HIGH|MEDIUM|LOW",
      "risk_score": 1-5,
      "priority": 1-5
    }}
  ]
}}"""

    result = call_granite(system_prompt, user_prompt, agent_name="RiskScorer")

    # If Granite returns empty, score locally using severity map
    if not result or not result.get("scored_violations"):
        return {
            "scored_violations": [
                {
                    "clause_id": v.get("clause_id", ""),
                    "severity": v.get("severity", "LOW"),
                    "risk_score": SEVERITY_MAP.get(v.get("severity", "LOW"), 1),
                    "priority": SEVERITY_MAP.get(v.get("severity", "LOW"), 1)
                }
                for v in violations
            ]
        }

    return result