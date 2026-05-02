import uuid
import time

def log_audit(doc_id, doc_type, violations, scored_violations, remediations):
    audit_id = str(uuid.uuid4())
    timestamp = int(time.time())
    
    return {
        "audit_id": audit_id,
        "timestamp": timestamp,
        "doc_id": doc_id,
        "doc_type": doc_type,
        "violations": violations,
        "scored_violations": scored_violations,
        "remediations": remediations
    }

# Made with Bob
