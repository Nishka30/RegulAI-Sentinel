import json
import re
import uuid
import time
import requests
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params
from sentinel.config.settings import WATSONX_URL, WATSONX_APIKEY, PROJECT_ID, CLOUDANT_URL, CLOUDANT_APIKEY

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

def get_iam_token(api_key):
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "urn:ibm:params:oauth:grant-type:apikey", "apikey": api_key}
    )
    response.raise_for_status()
    return response.json()["access_token"]

def log_governance(agent_name, full_prompt, response, status):
    try:
        log_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
        log_doc = {
            "_id": log_id,
            "log_id": log_id,
            "timestamp": timestamp,
            "agent_name": agent_name,
            "model_id": "ibm/granite-4-h-small",
            "input_length": len(full_prompt),
            "output_length": len(response),
            "output_preview": response[:200],
            "status": status
        }
        
        token = get_iam_token(CLOUDANT_APIKEY)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        requests.put(
            f"{CLOUDANT_URL}/governance-logs/{log_id}",
            headers=headers,
            json=log_doc
        )
    except Exception:
        pass

def call_granite(system_prompt, user_prompt, agent_name="unknown"):
    full_prompt = f"{system_prompt}\n\n{user_prompt}"
    
    try:
        response = model.generate_text(full_prompt)
        response = str(response).strip()
        
        log_governance(agent_name, full_prompt, response, "success")

        # Strip everything before first {
        json_start = response.find('{')
        if json_start > 0:
            response = response[json_start:]

        # Remove markdown fences
        cleaned = re.sub(r'^```json\s*', '', response)
        cleaned = re.sub(r'^```\s*', '', cleaned)
        cleaned = re.sub(r'\s*```$', '', cleaned)
        cleaned = cleaned.strip()

        if not cleaned:
            return {}

        # Fix control characters inside string values
        cleaned = cleaned.replace('\r', ' ').replace('\t', ' ')
        cleaned = re.sub(r'(?<!\\)\n', ' ', cleaned)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            try:
                open_braces = cleaned.count('{') - cleaned.count('}')
                open_brackets = cleaned.count('[') - cleaned.count(']')
                cleaned += ']' * open_brackets + '}' * open_braces
                return json.loads(cleaned)
            except json.JSONDecodeError:
                match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if match:
                    try:
                        return json.loads(match.group())
                    except:
                        return {}
                return {}
    except Exception as e:
        log_governance(agent_name, full_prompt, str(e), "error")
        raise