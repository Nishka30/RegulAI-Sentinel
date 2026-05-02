import json
from sentinel.agents.agent_doc_ingest import ingest_document
from sentinel.agents.agent_reg_map import get_frameworks
from sentinel.agents.agent_violation_detector import detect_violations
from sentinel.agents.agent_risk_scorer import score_risks
from sentinel.agents.agent_remediation_writer import write_remediations
from sentinel.agents.agent_audit_logger import log_audit

def run_pipeline(text):
    doc_result = ingest_document(text)
    doc_id = doc_result["doc_id"]
    doc_type = doc_result["doc_type"]
    doc_text = doc_result["text"]
    
    frameworks_result = get_frameworks(doc_type)
    frameworks = frameworks_result["frameworks"]
    
    violations_result = detect_violations(doc_text, frameworks)
    violations = violations_result.get("violations", [])
    
    scored_result = score_risks(violations)
    scored_violations = scored_result.get("scored_violations", [])
    
    remediations_result = write_remediations(violations)
    remediations = remediations_result.get("remediations", [])
    
    audit_result = log_audit(doc_id, doc_type, violations, scored_violations, remediations)
    
    return audit_result

if __name__ == "__main__":
    sample_text = """
    Credit Memo
    
    Date: January 15, 2024
    Customer: ABC Corporation
    Amount: Rs 50,00,000
    
    This credit memo approves a loan of fifty lakhs to ABC Corporation for business expansion.
    The loan will be disbursed within 5 business days upon acceptance of terms.
    
    Terms:
    - Interest rate: 12% per annum
    - Tenure: 5 years
    - Processing fee: 2% of loan amount
    
    Note: Customer verification pending. PAN card and address proof to be collected post-disbursement.
    """
    
    result = run_pipeline(sample_text)

# Made with Bob
