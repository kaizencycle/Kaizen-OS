FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    bash \
    timeout \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir fastapi uvicorn pydantic httpx pyjwt cryptography

# Copy application code
COPY src ./src

# Set Python path
ENV PYTHONPATH=/app

# Run as non-root user
RUN useradd -m -u 1000 gatekeeper && chown -R gatekeeper:gatekeeper /app
USER gatekeeper

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8080/health', timeout=2)"

# Run application
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8080"]
