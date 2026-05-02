FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir ibm-watsonx-ai python-dotenv requests fastmcp fastapi uvicorn
EXPOSE 8000
CMD ["python", "-m", "sentinel.api.api_server"]

# Made with Bob
