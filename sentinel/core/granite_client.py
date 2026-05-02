import json
import re
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params
from config.settings import WATSONX_URL, WATSONX_APIKEY, PROJECT_ID

model = ModelInference(
    model_id="ibm/granite-4-h-small",
    credentials={
        "url": WATSONX_URL,
        "apikey": WATSONX_APIKEY
    },
    project_id=PROJECT_ID,
    params={
        Params.DECODING_METHOD: "greedy",
        Params.MAX_NEW_TOKENS: 1500,
        Params.MIN_NEW_TOKENS: 5,
        Params.REPETITION_PENALTY: 1.1
    }
)

def call_granite(system_prompt, user_prompt):
    full_prompt = f"{system_prompt}\n\n{user_prompt}"
    
    response = model.generate_text(full_prompt)
    response = str(response).strip()
    print("RAW RESPONSE:", repr(response))
    
    cleaned = re.sub(r'^```json\s*', '', response)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    cleaned = cleaned.strip()
    
    if not cleaned:
        return {}
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {}