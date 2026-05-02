from sentinel.pipeline.pipeline import run_pipeline

text = "Credit Memo. Customer KYC pending. PAN card to be collected after disbursement. Loan amount Rs 50 lakhs."

result = run_pipeline(text)

import json
print(json.dumps(result, indent=2))

# Made with Bob
