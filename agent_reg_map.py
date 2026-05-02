import requests
import json

CLOUDANT_URL = "https://caa33a5a-b6f9-4a40-9f5d-b66edffcb10d-bluemix.cloudantnosqldb.appdomain.cloud"
CLOUDANT_APIKEY = "GX9x7GMIc489tQcH7W4_phqR6nPwlOoH5ZmPAxMDw6mE"

def get_iam_token(api_key):
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "urn:ibm:params:oauth:grant-type:apikey", "apikey": api_key}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def get_frameworks(doc_type):
    try:
        token = get_iam_token(CLOUDANT_APIKEY)
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Query by doc_type using Cloudant selector
        query = {
            "selector": {
                "doc_types": {"$elemMatch": {"$eq": doc_type}}
            },
            "fields": ["_id", "framework", "section", "clause_text", "severity_if_violated", "regulatory_body"]
        }

        response = requests.post(
            f"{CLOUDANT_URL}/regulatory-corpus/_find",
            headers=headers,
            json=query
        )
        response.raise_for_status()
        docs = response.json().get("docs", [])

        frameworks = [
            {
                "clause_id": doc["_id"],
                "name": f"{doc['framework']} §{doc['section']}",
                "description": doc["clause_text"],
                "severity": doc.get("severity_if_violated", "MEDIUM"),
                "regulatory_body": doc.get("regulatory_body", "")
            }
            for doc in docs
        ]

        # Fallback to hardcoded if Cloudant returns nothing
        if not frameworks:
            return get_hardcoded_frameworks()

        return {"frameworks": frameworks}

    except Exception as e:
        return get_hardcoded_frameworks()


def get_hardcoded_frameworks():
    return {
        "frameworks": [
            {"clause_id": "RBI_01", "name": "KYC Requirements", "description": "All financial institutions must verify customer identity using government-issued documents."},
            {"clause_id": "RBI_02", "name": "LTV Ratio Limits", "description": "Housing loans must not exceed 90% LTV for loans up to Rs 30 lakh."},
            {"clause_id": "FCA_01", "name": "Fair Treatment", "description": "Financial institutions must treat customers fairly and provide clear information."},
            {"clause_id": "GDPR_01", "name": "Data Processing", "description": "Personal data must be processed lawfully with explicit consent."}
        ]
    }