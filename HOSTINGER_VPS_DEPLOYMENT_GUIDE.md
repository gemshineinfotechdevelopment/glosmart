# Complete Hostinger VPS Deployment Guide for Glosmart

This guide will walk you through setting up your **Node.js/Express Backend**, **React Frontend (Vite)**, **MongoDB Database**, **PM2 Process Manager**, **Nginx Reverse Proxy**, and **SSL (HTTPS)** on your Hostinger VPS (Ubuntu/Debian).

---

## Quick Reference Summary

| Service | Port / Location | Description |
| :--- | :--- | :--- |
| **MongoDB** | `127.0.0.1:27017` | Local Database Service |
| **Backend API** | `127.0.0.1:5000` | Node.js / Express Server (Managed by PM2) |
| **Frontend** | `/var/www/glosmart/dist` | Compiled Vite Static Files |
| **Web Server / Proxy** | `80` (HTTP) / `443` (HTTPS) | Nginx Reverse Proxy & Static Host |

---

## Step 1: Update Server Packages & Install Base Tools

Run this on your VPS terminal:

```bash
# Update package list and system packages
sudo apt update && sudo apt upgrade -y

# Install common utilities, curl, git, ufw, and build essentials
sudo apt install -y curl wget git build-essential ufw
```

---

## Step 2: Install Node.js (v20 or v22 LTS)

Use the official NodeSource repository to install Node.js:

```bash
# Download and install NodeSource repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation (should be v20.x and npm 10.x)
node -v
npm -v
```

---

## Step 3: Install and Configure MongoDB on VPS

### 3.1 Install MongoDB Community Edition (Ubuntu 22.04 / 24.04)

```bash
# Install gnupg and curl if not already present
sudo apt install -y gnupg curl

# Import the MongoDB public GPG Key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor --yes

# Add MongoDB APT repository for Ubuntu 22.04 (Jammy)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt update

# Install MongoDB packages
sudo apt install -y mongodb-org
```

> **Note for Ubuntu 24.04 (Noble)**: If you are running Ubuntu 24.04, replace `jammy` with `jammy` or use MongoDB 8.0 / 7.0 repo compatible with your kernel.

### 3.2 Start & Enable MongoDB Service

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to automatically start on VPS boot
sudo systemctl enable mongod

# Check MongoDB status (should show 'active (running)')
sudo systemctl status mongod
```

### 3.3 Verify MongoDB Connection

Enter the MongoDB shell:
```bash
mongosh
```
Inside the `mongosh` prompt, test with:
```javascript
show dbs
exit
```

### 3.4 (Optional but Recommended) Create Database User with Authentication

In `mongosh`:
```javascript
use admin
db.createUser({
  user: "adminUser",
  pwd: "YourStrongPasswordHere123!",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, { role: "readWriteAnyDatabase", db: "admin" } ]
})
exit
```

#### MongoDB Connection String:
- **Without Auth (Local only, default)**:
  `MONGODB_URI=mongodb://127.0.0.1:27017/glosmart`
- **With Auth**:
  `MONGODB_URI=mongodb://adminUser:YourStrongPasswordHere123!@127.0.0.1:27017/glosmart?authSource=admin`

---

## Step 4: Install PM2 and Nginx

```bash
# Install PM2 globally to manage Node.js processes in the background
sudo npm install -g pm2

# Install Nginx web server
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 5: Setup and Build the Glosmart Project

Assuming you cloned the repository into `/var/www/glosmart` (or your home directory `~/glosmart-team`):

```bash
# Navigate to your project directory (adjust path if needed)
cd ~/glosmart-team

# 1. Install root dependencies (Frontend)
npm install

# 2. Install backend dependencies
cd server
npm install
cd ..
```

### 5.1 Configure Backend Environment (`server/.env`)

Create or edit `server/.env`:
```bash
nano server/.env
```

Paste your production configuration:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/glosmart
CLIENT_URL=https://yourdomain.com

# JWT Secret (if used)
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary / File storage keys (if used)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay / Payment Keys (if used)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
*(Press `Ctrl + O`, `Enter` to save, and `Ctrl + X` to exit nano)*

### 5.2 Configure Frontend Environment (`.env`)

Create or edit `.env` in the root project folder:
```bash
nano .env
```

Set the backend API URL:
```env
# If using domain with reverse proxy (recommended):
VITE_API_URL=https://yourdomain.com

# If testing with VPS IP directly before domain setup:
# VITE_API_URL=http://YOUR_VPS_IP:5000
```
*(Press `Ctrl + O`, `Enter` to save, and `Ctrl + X` to exit nano)*

### 5.3 Build the React Frontend

```bash
# Run build from root directory
npm run build
```
This generates the optimized production bundle inside the `dist/` directory.

### 5.4 (Optional) Seed Database Data

If you need to seed initial database collections:
```bash
node server/seed.js
```

---

## Step 6: Start Backend with PM2

```bash
# Start backend server from project root
pm2 start server/server.js --name "glosmart-backend"

# Verify that the server is running
pm2 status

# View backend logs to ensure MongoDB connection succeeded
pm2 logs glosmart-backend --lines 20

# Save PM2 process list to auto-start on server reboot
pm2 startup
# (Run the sudo env PATH=... command that pm2 outputs if prompted)
pm2 save
```

---

## Step 7: Configure Nginx as Reverse Proxy

Create a new Nginx server configuration:

```bash
sudo nano /etc/nginx/sites-available/glosmart
```

Paste the following configuration (replace `yourdomain.com` and `/root/glosmart-team` with your actual domain and project path):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # Or your VPS IP if no domain yet

    # Root directory for Vite React Frontend
    root /root/glosmart-team/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Serve static frontend files with SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy WebSocket (Socket.io) requests
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads / Static uploads if served by backend
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 7.1 Enable Site & Restart Nginx

```bash
# Enable the site configuration by creating a symlink
sudo ln -s /etc/nginx/sites-available/glosmart /etc/nginx/sites-enabled/

# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# If syntax is ok, restart Nginx
sudo systemctl restart nginx
```

> **Permission Tip**: Ensure Nginx can read your build files:
> ```bash
> sudo chmod -R 755 /root
> sudo chmod -R 755 /root/glosmart-team/dist
> ```

---

## Step 8: Configure Firewall (UFW)

Secure your VPS by allowing only required ports:

```bash
# Allow SSH so you don't get locked out!
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 9: Setup Free SSL (HTTPS) with Certbot

Once your domain DNS A-Record points to your VPS IP:

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Obtain and configure SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the prompts (enter your email, accept terms). Certbot will automatically update your Nginx config to use HTTPS and setup auto-renewal.

---

## Step 10: Helpful Maintenance Commands

### Updating the App in the Future
Create a simple `deploy.sh` script in your project root:

```bash
nano deploy.sh
```

Paste:
```bash
#!/bin/bash
echo "Pulling latest changes from git..."
git pull origin main

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Installing backend dependencies..."
cd server && npm install && cd ..

echo "Restarting backend PM2 process..."
pm2 restart glosmart-backend

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```
Run whenever you push code changes:
```bash
./deploy.sh
```

### PM2 Common Commands
- `pm2 status` - View running processes
- `pm2 logs glosmart-backend` - View live logs
- `pm2 restart glosmart-backend` - Restart the backend
- `pm2 stop glosmart-backend` - Stop the backend





Step-by-Step Summary for Your VPS
1. Install Node.js 20 LTS & Build Tools
Run these commands on your VPS terminal:

bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw nginx
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
# Install PM2 globally
sudo npm install -g pm2
2. Install & Start MongoDB on the VPS
Install MongoDB Community Edition (Ubuntu 22.04 / 24.04):
bash
# Import MongoDB GPG Key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
# Update & Install MongoDB
sudo apt update
sudo apt install -y mongodb-org
Start & Enable MongoDB:
bash
sudo systemctl daemon-reload
sudo systemctl start mongod
sudo systemctl enable mongod
# Verify it is active:
sudo systemctl status mongod
Test MongoDB connection:
bash
mongosh
Inside the mongosh terminal, test with show dbs and type exit to return to bash.

3. Connect MongoDB to Your Project
In your backend environment file (server/.env):

env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/glosmart
CLIENT_URL=https://yourdomain.com
4. Build the Frontend & Start the Backend
Inside your cloned repository on the VPS:

bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..
# 2. Configure environment files (.env in root and server/.env)
# 3. Build React Frontend
npm run build
# 4. Start backend with PM2
pm2 start server/server.js --name "glosmart-backend"
# 5. Enable PM2 to auto-start on VPS reboot
pm2 startup
pm2 save
5. Configure Nginx Reverse Proxy
Create an Nginx configuration file:

bash
sudo nano /etc/nginx/sites-available/glosmart
Add:

nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # Point to your React build directory
    root /root/glosmart-team/dist;
    index index.html;
    # Frontend routes fallback (Single Page App)
    location / {
        try_files $uri $uri/ /index.html;
    }
    # API endpoints proxy to Express backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # Socket.io WebSocket proxy
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
Enable the configuration and reload Nginx:

bash
sudo ln -s /etc/nginx/sites-available/glosmart /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
6. Enable HTTPS / SSL with Free Let's Encrypt (Certbot)
bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com