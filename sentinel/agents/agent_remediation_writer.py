import json
from granite_client import call_granite

def write_remediations(violations):
    system_prompt = "You are a compliance editor. Return only valid JSON. No explanations. No markdown."

    remediations = []

    for v in violations:
        user_prompt = f"""Fix this compliance violation by rewriting the section.

CLAUSE: {v['clause_id']}
VIOLATING TEXT: {v['section']}
REASON: {v['explanation']}

Return exactly this JSON:
{{
  "clause_id": "{v['clause_id']}",
  "original": "{v['section']}",
  "rewrite": "corrected version here"
}}"""

        result = call_granite(system_prompt, user_prompt)
        if result:
            remediations.append(result)

    return {"remediations": remediations}