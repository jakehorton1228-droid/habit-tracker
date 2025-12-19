# Deployment Guide

This guide walks through deploying the Habit Tracker app to a VPS (Virtual Private Server).

## Overview

The production setup consists of:

```
┌─────────────────────────────────────────┐
│                  VPS                     │
│                                          │
│   Nginx (reverse proxy)                  │
│      │                                   │
│      ├── /* → Frontend (static files)   │
│      └── /api/* → Gunicorn (Django)     │
│                                          │
│   PostgreSQL (database)                  │
│   Systemd (process management)           │
└─────────────────────────────────────────┘
```

**Why this architecture?**
- **Nginx**: Efficiently serves static files and routes requests
- **Gunicorn**: Production-grade WSGI server for Django (the built-in `runserver` is for development only)
- **PostgreSQL**: Robust production database (SQLite isn't recommended for production)
- **Systemd**: Keeps the app running and auto-restarts on crashes/reboots

## Prerequisites

- A VPS (Ubuntu 22.04 or 24.04 recommended)
- SSH access to the server
- A domain name (optional, but required for HTTPS)

## Step 1: Initial Server Setup

### Connect to your server

```bash
ssh root@YOUR_SERVER_IP
```

### Update the system

```bash
apt update && apt upgrade -y
```

**Why?** Ensures you have the latest security patches and package versions.

### Create a non-root user

```bash
adduser yourname
usermod -aG sudo yourname
```

**Why?** Running as root is risky—a mistake could break the entire system. A sudo user can run admin commands when needed but operates safely by default.

### Set up the firewall

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

**Why?** Only expose necessary ports:
- **22 (SSH)**: Your remote access
- **80 (HTTP)**: Web traffic
- **443 (HTTPS)**: Secure web traffic

### Copy SSH key to the new user

```bash
rsync --archive --chown=yourname:yourname ~/.ssh /home/yourname
```

**Why?** Lets you SSH directly as your new user instead of root.

### Switch to the new user

```bash
su - yourname
```

## Step 2: Install Dependencies

```bash
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx postgresql postgresql-contrib git
```

| Package | Purpose |
|---------|---------|
| python3, pip, venv | Run Django backend |
| nodejs, npm | Build React frontend |
| nginx | Web server / reverse proxy |
| postgresql | Production database |
| git | Clone the repository |

## Step 3: Set Up PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE USER habituser WITH PASSWORD 'your-secure-password';
CREATE DATABASE habitdb OWNER habituser;
\q
```

**Why PostgreSQL over SQLite?**
- Handles concurrent connections properly
- Better performance under load
- Proper data integrity and ACID compliance
- Standard for production Django apps

## Step 4: Clone and Configure the App

### Clone the repository

```bash
mkdir ~/apps
cd ~/apps
git clone https://github.com/YOUR_USERNAME/habit-tracker.git
cd habit-tracker
```

### Set up the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### Create the backend environment file

```bash
nano .env
```

```env
SECRET_KEY=your-long-random-secret-key-here
DEBUG=False
ALLOWED_HOSTS=YOUR_SERVER_IP,localhost,127.0.0.1
DB_NAME=habitdb
DB_USER=habituser
DB_PASSWORD=your-database-password
DB_HOST=localhost
DATABASE_URL=postgres
CORS_ORIGIN=http://YOUR_SERVER_IP
```

**Why these settings?**
- **SECRET_KEY**: Django uses this for cryptographic signing—must be secret in production
- **DEBUG=False**: Never run with DEBUG=True in production (exposes sensitive info)
- **ALLOWED_HOSTS**: Prevents HTTP Host header attacks
- **DATABASE_URL**: Triggers PostgreSQL configuration instead of SQLite
- **CORS_ORIGIN**: Allows the frontend to make API requests

### Run migrations

```bash
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

### Set up the frontend

```bash
cd ~/apps/habit-tracker/frontend
nano .env
```

```env
VITE_API_URL=http://YOUR_SERVER_IP/api
```

```bash
npm install
npm run build
```

**Why build the frontend?** In production, we serve pre-built static files instead of running a dev server. This is faster and more efficient.

## Step 5: Configure Gunicorn (Django Process Manager)

### Create a systemd service

```bash
sudo nano /etc/systemd/system/habittracker.service
```

```ini
[Unit]
Description=Habit Tracker Django App
After=network.target

[Service]
User=yourname
Group=www-data
WorkingDirectory=/home/yourname/apps/habit-tracker/backend
Environment=PATH=/home/yourname/apps/habit-tracker/backend/venv/bin
ExecStart=/home/yourname/apps/habit-tracker/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 core.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Why Gunicorn?**
- Django's `runserver` is single-threaded and not secure for production
- Gunicorn handles multiple requests concurrently
- The `--workers 3` flag spawns 3 worker processes for better performance

**Why systemd?**
- Starts the app automatically on server boot
- Restarts automatically if it crashes
- Provides logging via `journalctl`

### Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl start habittracker
sudo systemctl enable habittracker
```

### Check status

```bash
sudo systemctl status habittracker
```

## Step 6: Configure Nginx (Web Server)

### Create the site configuration

```bash
sudo nano /etc/nginx/sites-available/habittracker
```

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    # Frontend (React build)
    location / {
        root /home/yourname/apps/habit-tracker/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django static files
    location /static/ {
        alias /home/yourname/apps/habit-tracker/backend/staticfiles/;
    }
}
```

**Why Nginx?**
- Serves static files much faster than Django/Gunicorn
- Acts as a reverse proxy—frontend and backend appear as one site
- Handles SSL/HTTPS termination (when configured)
- The `try_files` directive enables React Router to work properly

### Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/habittracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Fix permissions (if needed)

```bash
chmod 755 /home/yourname
chmod -R 755 /home/yourname/apps
```

**Why?** Nginx runs as the `www-data` user, which needs read access to your files.

## Step 7: Verify Deployment

Visit `http://YOUR_SERVER_IP` in your browser. You should see your app!

## Troubleshooting

### Check Gunicorn logs

```bash
sudo journalctl -u habittracker -n 50 --no-pager
```

### Check Nginx logs

```bash
sudo tail -20 /var/log/nginx/error.log
```

### Restart services

```bash
sudo systemctl restart habittracker
sudo systemctl restart nginx
```

### Common issues

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Gunicorn isn't running—check `systemctl status habittracker` |
| 403 Forbidden | Permission issue—run `chmod 755 /home/yourname` |
| CORS errors | Check `CORS_ORIGIN` in backend `.env` matches your URL |
| Static files 404 | Run `python manage.py collectstatic` |
| Database errors | Verify `.env` credentials match PostgreSQL user |

## Next Steps

### Add HTTPS (Recommended)

For HTTPS, you'll need a domain name. Then use Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Set up automatic updates

```bash
# Pull latest code
cd ~/apps/habit-tracker
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Update frontend
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl restart habittracker
```

## Architecture Summary

| Component | Role | Port |
|-----------|------|------|
| Nginx | Reverse proxy, static files | 80/443 |
| Gunicorn | Django WSGI server | 8000 (internal) |
| PostgreSQL | Database | 5432 (internal) |
| React | Frontend (pre-built static files) | N/A |
