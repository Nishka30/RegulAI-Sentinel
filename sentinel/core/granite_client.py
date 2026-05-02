import json
import re
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as Params
from sentinel.config.settings import WATSONX_URL, WATSONX_APIKEY, PROJECT_ID

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