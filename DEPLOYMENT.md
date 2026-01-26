# GreenScale Deployment Guide

Professional deployment instructions for GreenScale backend and frontend.

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] API documentation reviewed
- [ ] CORS origins updated
- [ ] SSL certificates ready (for HTTPS)

## 🚀 Backend Deployment

### Production Environment Setup

1. **Database Setup:**
   ```bash
   # Create production database
   mysql -u root -p -e "CREATE DATABASE greenscale_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env.production
   # Update .env.production with production values
   ```

3. **Install Dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Initialize Database:**
   ```bash
   ENVIRONMENT=production python init_db.py
   ```

5. **Run with Gunicorn (Production Server):**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 main:app
   ```

### Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM python:3.9-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   ENV ENVIRONMENT=production
   ENV DEBUG=false

   CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "main:app"]
   ```

2. **Build and Run:**
   ```bash
   docker build -t greenscale-api .
   docker run -d -p 8000:8000 --env-file .env.production greenscale-api
   ```

### Systemd Service (Linux)

Create `/etc/systemd/system/greenscale-api.service`:

```ini
[Unit]
Description=GreenScale API
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/var/www/greenscale-backend
Environment="PATH=/var/www/greenscale-backend/venv/bin"
ExecStart=/var/www/greenscale-backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable greenscale-api
sudo systemctl start greenscale-api
```

## 🎨 Frontend Deployment

### Build for Production

```bash
cd greenscale-frontend
npm install
npm run build
```

Output in `dist/` directory.

### Vercel Deployment

```bash
npm install -g vercel
vercel --prod
```

### Netlify Deployment

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Self-Hosted (Nginx)

1. **Build:**
   ```bash
   npm run build
   ```

2. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       root /var/www/greenscale-frontend/dist;
       index index.html;
       
       location / {
           try_files $uri /index.html;
       }
       
       location /api {
           proxy_pass http://backend-server:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable SSL (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## 🔒 Security Best Practices

### Backend Security

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong SECRET_KEY
   - Rotate API keys regularly

2. **Database:**
   - Use strong passwords
   - Enable SSL for connections
   - Regular backups
   - Principle of least privilege

3. **API:**
   - Enable CORS properly
   - Add rate limiting
   - Validate all inputs
   - Use HTTPS only
   - Add request logging

4. **Dependencies:**
   - Regularly update packages: `pip list --outdated`
   - Monitor security advisories
   - Remove unused dependencies

### Frontend Security

1. **Code:**
   - Minify and obfuscate
   - Remove debug code
   - Validate inputs
   - Sanitize API responses

2. **Headers:**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   add_header Referrer-Policy "strict-origin-when-cross-origin";
   ```

## 📊 Monitoring

### Application Monitoring

1. **Logs:**
   ```bash
   tail -f /var/log/greenscale-api.log
   ```

2. **Metrics:**
   - Response times
   - Error rates
   - Database performance
   - Memory usage

3. **Tools:**
   - New Relic
   - Sentry (error tracking)
   - Datadog
   - Prometheus

### Health Checks

```bash
# Regular health check
curl http://localhost:8000/health

# Response:
# {
#   "status": "healthy",
#   "service": "GreenScale API",
#   "timestamp": "2024-01-24T10:00:00"
# }
```

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        env:
          SSH_KEY: ${{ secrets.SSH_KEY }}
          HOST: ${{ secrets.HOST }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh -o StrictHostKeyChecking=no user@$HOST 'cd /var/www/greenscale-backend && git pull && pip install -r requirements.txt && systemctl restart greenscale-api'
      
      - name: Deploy Frontend
        run: |
          npm ci
          npm run build
          # Deploy to Vercel or Netlify
```

## 🆘 Troubleshooting

### Backend Issues

**Port Already in Use:**
```bash
lsof -i :8000
kill -9 <PID>
```

**Database Connection Error:**
```bash
# Check MySQL status
sudo systemctl status mysql

# Check credentials
mysql -u root -p -h localhost
```

**Import Errors:**
```bash
pip install --upgrade --force-reinstall -r requirements.txt
```

### Frontend Issues

**Build Fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Blank Page:**
- Check browser console for errors
- Verify API_URL is correct
- Check CORS configuration

## 📞 Support & Maintenance

### Regular Maintenance

- Weekly: Monitor logs and metrics
- Monthly: Update dependencies
- Quarterly: Security audit
- Annually: Major version updates

### Backup Strategy

```bash
# Daily database backup
0 2 * * * mysqldump -u root -p greenscale_prod > /backups/greenscale_$(date +\%Y\%m\%d).sql

# Weekly backup to S3
0 3 * * 0 aws s3 sync /backups s3://backup-bucket/greenscale/
```

## 📈 Scaling

### Horizontal Scaling

1. Load balancer (Nginx, HAProxy)
2. Multiple API instances
3. Connection pooling
4. Caching layer (Redis)

### Vertical Scaling

1. Increase server resources
2. Optimize database queries
3. Enable caching
4. Use CDN for frontend

## 🎓 Learning Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Gunicorn Documentation](https://gunicorn.org/)
- [React Production Build](https://react.dev/learn/deployment)
- [Nginx Documentation](https://nginx.org/en/docs/)
