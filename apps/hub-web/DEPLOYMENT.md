# Deployment Guide

This project supports deployment to Render with both FastAPI backend and Next.js frontend capabilities.

## Render Deployment

### Backend (FastAPI) - Primary Service

The main service is configured to deploy the FastAPI backend using `render.yaml`:

```yaml
services:
  - type: web
    name: oaa-api-library
    env: python
    plan: starter
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    healthCheckPath: /health
```

**Environment Variables:**
- `ORIGINS`: CORS origins (comma-separated)
- `CIVIC_LEDGER_URL`: Civic Ledger service URL
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `REDIS_URL`: Redis connection string (optional)

### Frontend (Next.js) - Static Site

For the Next.js frontend, you can deploy it as a static site:

1. **Build Command:** `npm run build`
2. **Publish Directory:** `out` (if using static export)
3. **Node Version:** 18+

### Deployment Steps

1. **Connect Repository:**
   - Connect your GitHub repository to Render
   - Select the main branch

2. **Configure Service:**
   - Render will automatically detect the `render.yaml` configuration
   - The FastAPI backend will be deployed as the primary service

3. **Environment Variables:**
   - Set the required environment variables in the Render dashboard
   - `ORIGINS` should include your frontend domain

4. **Health Check:**
   - The service includes a health check at `/health`
   - Monitor the service status in the Render dashboard

### API Endpoints

Once deployed, the FastAPI backend will be available at:
- **Health Check:** `GET /health`
- **Agent Registration:** `POST /agents/register`
- **Agent Query:** `POST /agents/query`
- **Learning Submission:** `POST /oaa/learn/submit`
- **API Documentation:** `GET /docs` (Swagger UI)
- **Alternative Docs:** `GET /redoc` (ReDoc)

### CORS Configuration

The FastAPI backend is configured with CORS middleware to allow requests from:
- `https://kaizencycle.org`
- `https://reflections-app.onrender.com`
- `http://localhost:3000` (development)

You can modify the `ORIGINS` environment variable to include additional domains.

### Database Integration

Currently, the service uses in-memory storage for the agent registry. For production, consider:
- Adding a PostgreSQL database
- Implementing Redis for caching
- Adding persistent storage for learning artifacts

### Monitoring

- Health checks are available at `/health`
- Render provides built-in monitoring and logging
- API documentation is available at `/docs`

## Local Development

### Backend
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
npm install
npm run dev
```

## Troubleshooting

1. **Build Failures:**
   - Check Python version (3.11+)
   - Verify all dependencies in `requirements.txt`

2. **CORS Issues:**
   - Update `ORIGINS` environment variable
   - Check frontend domain configuration

3. **Health Check Failures:**
   - Verify the service is running on the correct port
   - Check logs for startup errors


