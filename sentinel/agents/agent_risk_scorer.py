import json
from core.granite_client import call_granite

def score_risks(violations):
    severity_map = {
        "HIGH": 5,
        "MEDIUM": 3,
        "LOW": 1
    }
    
    system_prompt = "You are a risk assessment analyst. Assign priority scores (1-5) to compliance violations based on their severity and business impact. Return ONLY JSON."
    
    violations_text = json.dumps(violations, indent=2)
    
    user_prompt = f"""Violations:
{violations_text}

For each violation, assign a priority score from 1-5 based on:
- Severity level (HIGH=5, MEDIUM=3, LOW=1)
- Business impact
- Regulatory consequences

Return JSON in this exact format:
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
    
    result = call_granite(system_prompt, user_prompt)
    
    for violation in result.get("scored_violations", []):
        if "risk_score" not in violation:
            violation["risk_score"] = severity_map.get(violation.get("severity", "LOW"), 1)
        if "priority" not in violation:
            violation["priority"] = violation["risk_score"]
    
    return result

# Made with Bob
