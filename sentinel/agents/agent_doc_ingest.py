import uuid

def ingest_document(raw_text):
    doc_id = str(uuid.uuid4())
    text = raw_text.strip()
    
    text_lower = text.lower()
    
    if "credit memo" in text_lower:
        doc_type = "credit_memo"
    elif "loan" in text_lower:
        doc_type = "loan_agreement"
    else:
        doc_type = "general"
    
    return {
        "doc_id": doc_id,
        "text": text,
        "doc_type": doc_type
    }

# Made with Bob
