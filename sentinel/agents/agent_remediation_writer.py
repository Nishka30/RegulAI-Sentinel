import json
from sentinel.core.granite_client import call_granite

def write_remediations(violations):
    system_prompt = """
Return ONLY valid JSON.
No explanations.
No extra text.
"""

    remediations = []

    for v in violations:
        user_prompt = f"""
CLAUSE: {v.get('clause_id', '')}
TEXT: {v.get('section', '')}
REASON: {v.get('explanation', '')}

OUTPUT FORMAT:
{{
  "clause_id": "string",
  "original": "string",
  "rewrite": "string"
}}
"""

        result = call_granite(system_prompt, user_prompt, agent_name="RemediationWriter")

        # 🔥 VALIDATION (VERY IMPORTANT)
        if isinstance(result, dict):
            if all(k in result for k in ["clause_id", "original", "rewrite"]):
                remediations.append(result)
            else:
                # fallback if model messed up
                remediations.append({
                    "clause_id": v.get("clause_id"),
                    "original": v.get("section"),
                    "rewrite": "Manual review required"
                })
        else:
            # fallback if parsing failed
            remediations.append({
                "clause_id": v.get("clause_id"),
                "original": v.get("section"),
                "rewrite": "Manual review required"
            })

    return {"remediations": remediations}