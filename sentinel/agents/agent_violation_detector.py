import json
from core.granite_client import call_granite

def detect_violations(text, frameworks):
    system_prompt = "You are a compliance analyst. Return only valid JSON. No explanations. No markdown."

    clauses_text = "\n".join([
        f"{clause['clause_id']}: {clause['description']}"
        for clause in frameworks
    ])

    user_prompt = f"""Analyze this document against the clauses and return violations.

DOCUMENT: {text}

CLAUSES:
{clauses_text}

Return exactly this JSON and nothing else:
{{
  "violations": [
    {{
      "clause_id": "clause id",
      "section": "relevant text from document",
      "explanation": "why it violates",
      "severity": "HIGH or MEDIUM or LOW"
    }}
  ]
}}

If no violations, return {{"violations": []}}"""

    result = call_granite(system_prompt, user_prompt)
    
    if not result:
        return {"violations": []}
    
    return result