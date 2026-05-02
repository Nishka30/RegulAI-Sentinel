import uuid
import time
import requests
from sentinel.config.settings import CLOUDANT_URL, CLOUDANT_APIKEY

def get_iam_token(api_key):
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "urn:ibm:params:oauth:grant-type:apikey", "apikey": api_key}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def log_audit(doc_id, doc_type, violations, scored_violations, remediations):
    audit_id = str(uuid.uuid4())
    timestamp = int(time.time())
    
    audit_result = {
        "audit_id": audit_id,
        "timestamp": timestamp,
        "doc_id": doc_id,
        "doc_type": doc_type,
        "violations": violations,
        "scored_violations": scored_violations,
        "remediations": remediations
    }
    
    try:
        token = get_iam_token(CLOUDANT_APIKEY)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        cloudant_doc = {
            "_id": audit_id,
            **audit_result
        }
        
        requests.put(
            f"{CLOUDANT_URL}/sentinel-audit-trail/{audit_id}",
            headers=headers,
            json=cloudant_doc
        )
    except Exception:
        pass
    
    return audit_result

# Made with Bob
