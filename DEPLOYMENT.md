# 🚀 Deploying MERN App on AWS EC2 (Free Tier)

This guide walks you through the process of deploying a MERN stack application using AWS EC2. It covers setting up your EC2 instance, backend and frontend deployment, configuring MongoDB, security settings, and connecting both apps seamlessly.

## 📦 Prerequisites

- AWS Free Tier account
- GitHub account with your MERN project pushed
- SSH client (e.g., Terminal, Git Bash, or PuTTY)
- MongoDB Atlas account

## 📁 Folder Structure (Sample)

```bash
project-root/
│
├── backend/
│   └── server.js, .env, etc.
│
├── frontend/
│   └── React App files
```

## 🔑 Step 1: Launch EC2 Instance

1. Sign in to AWS Console → EC2 → Launch Instance
2. Choose Ubuntu (Linux) for better resource management
3. Choose an instance type (e.g., t2.micro for free tier)
4. Create a new key pair (save the .pem file securely)
5. Configure storage and security group:
   - Add Inbound Rules: 
     - HTTP (80)
     - HTTPS (443)
     - Custom ports (e.g., 3000, 5000)
6. Launch instance

## 🌐 Step 2: Assign Elastic IP

1. Navigate to Elastic IPs in EC2
2. Allocate a new address → Associate with your instance
3. This IP will be your static public IP (used in API calls and frontend)

## 🔗 Step 3: SSH into Instance

```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@your-elastic-ip
```

## ⚙️ Step 4: Set Up Node.js & Clone Repo

```bash
# Update system and install Node.js
sudo apt-get update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install node
node -v && npm -v

# Clone your project
git clone https://github.com/yourusername/your-mern-repo.git
cd your-mern-repo
```

## 🔐 Step 5: Backend Setup

```bash
cd backend
npm install

# Create and configure .env securely
nano .env
# Add variables like MONGO_URI, PORT, JWT_SECRET, etc.
```

**Note:** Never upload .env to GitHub!

```bash
node server.js
# Or use pm2: npm install -g pm2 && pm2 start server.js
```

## 🌍 Step 6: Frontend Setup

```bash
cd ../frontend
npm install
npm run build
```

After building, serve using a static file server:

```bash
npm install -g serve
serve -s build
```

## 🔄 Step 7: Connect Frontend & Backend

1. In your frontend API calls, set the base URL to your EC2 public IP (e.g., http://your-ip:5000/api/...)
2. Update .env in frontend if needed and rebuild

## ☁️ Step 8: MongoDB Cloud Integration

1. Use MongoDB Atlas for hosting your database
2. Add your EC2 IP to IP Whitelist in Atlas
3. Use the MongoDB URI in your backend .env

## 🛡️ Step 9: Security and Access

Make sure inbound rules are open for:
- Port 5000 (backend API)
- Port 3000 or 80 (React app)
- Restart servers as needed using PM2

## ✅ Final Checklist

- [ ] EC2 instance running with static IP
- [ ] Node.js and MongoDB setup
- [ ] Frontend React app built and deployed
- [ ] Backend Express server running and connected to MongoDB
- [ ] Correct ports opened
- [ ] Environment variables securely configured

## 🧠 Notes & Tips

1. `npm run build` optimizes the React app for production
2. Push changes to GitHub regularly with meaningful commit messages
3. Keep .env files private
4. Use PM2 for production stability:
   ```bash
   pm2 start backend/server.js --name backend
   ```
