from dotenv import load_dotenv
import os

load_dotenv()

WATSONX_URL = os.getenv("WATSONX_URL")
WATSONX_APIKEY = os.getenv("WATSONX_APIKEY")
PROJECT_ID = os.getenv("PROJECT_ID")
CLOUDANT_URL = os.getenv("CLOUDANT_URL")
CLOUDANT_APIKEY = os.getenv("CLOUDANT_APIKEY")