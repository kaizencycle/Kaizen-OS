# Civic Protocol Core - Dockerfile

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data and logs directories
RUN mkdir -p /app/data /app/logs

# Create non-root user
RUN useradd -m -u 1000 civic && \
    chown -R civic:civic /app

# Switch to non-root user
USER civic

# Expose port
EXPOSE 5411

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5411/health || exit 1

# Default command
CMD ["python", "sdk/python/devnode.py"]
