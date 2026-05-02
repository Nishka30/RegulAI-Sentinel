FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir .
EXPOSE 8000
CMD ["python", "-m", "sentinel.mcpserver.mcp_server", "--transport", "sse", "--port", "8000"]

# Made with Bob
