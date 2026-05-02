FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir ibm-watsonx-ai python-dotenv requests fastmcp starlette
EXPOSE 8000
CMD ["python", "-m", "sentinel.mcp.mcp_server"]

# Made with Bob
