# Deployment Guide

## 🚀 Public Deployment Options

### Render (Recommended)

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configure Environment**
   ```bash
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Set Environment Variables**
   - `ADMIN_TOKEN`: Your secure admin token
   - `ADMIN_KEY`: Your secure admin key
   - `LEDGER_HMAC_KEY`: Your secure HMAC key
   - `DEMO_MODE`: false

### Railway

1. **Deploy from GitHub**
   - Connect your repository
   - Set environment variables
   - Deploy automatically

### Heroku

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Configure Environment**
   ```bash
   heroku config:set ADMIN_TOKEN=your_token
   heroku config:set ADMIN_KEY=your_key
   heroku config:set LEDGER_HMAC_KEY=your_hmac_key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Build and Run**
   ```bash
   docker build -t lab4-proof .
   docker run -p 8000:8000 --env-file .env lab4-proof
   ```

## 🔧 Environment Configuration

### Required Variables
```bash
ADMIN_TOKEN=your_secure_admin_token_here
ADMIN_KEY=your_secure_admin_key_here
LEDGER_HMAC_KEY=your_secure_hmac_key_here
```

### Optional Variables
```bash
DEMO_MODE=false
OPENAI_API_KEY=your_openai_key_here
RENDER_API_TOKEN=your_render_token_here
NODE_ID=cursor
AUTHOR=Your Name
NETWORK_ID=Kaizen-DVA
VERSION=0.12.0
```

## 🛡️ Security Checklist

Before deploying publicly:

- [ ] All secrets are in environment variables
- [ ] No `.env` files in repository
- [ ] CORS origins are configured
- [ ] Admin endpoints are protected
- [ ] HTTPS is enabled
- [ ] Dependencies are updated

## 📊 Monitoring

### Health Checks
- `GET /health` - Basic health check
- `GET /healthz` - Kubernetes health check
- `GET /ping` - Simple ping endpoint

### Logs
- Application logs are available in deployment platform
- Error tracking can be added with services like Sentry

## 🔄 Auto-Deployment

The repository includes GitHub Actions for:
- Auto-merge workflows
- Automated testing
- Security scanning

## 🆘 Troubleshooting

### Common Issues

1. **Import Errors**
   - Check Python version (3.11+)
   - Verify all dependencies installed

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly

3. **CORS Issues**
   - Verify `ALLOWED_ORIGINS` includes your domain
   - Check frontend URL configuration

4. **Database Issues**
   - Ensure data directory is writable
   - Check file permissions

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
uvicorn app.main:app --reload --log-level debug
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer for multiple instances
- Implement Redis for session storage
- Use external database for data persistence

### Vertical Scaling
- Increase memory and CPU
- Optimize database queries
- Implement caching

---

**Ready to deploy? Follow the security checklist and choose your platform!**
