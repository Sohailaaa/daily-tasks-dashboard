# Deployment Guide for AWS Free Tier

This guide explains how to deploy the Daily Tasks Dashboard application using AWS free tier services.

## Prerequisites

1. AWS Account with free tier access
2. MongoDB Atlas account (free tier)
3. Domain name (optional, but recommended)

## Step 1: Database Setup (MongoDB Atlas)

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (choose the free tier option)
3. Set up database access:
   - Create a database user
   - Save the username and password
4. Set up network access:
   - Add IP access list entry: `0.0.0.0/0` (for development)
5. Get your connection string from MongoDB Atlas

## Step 2: Backend Deployment (AWS EC2)

1. Create ED25519 Key Pair:
   ```bash
   # On your local machine
   ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/aws-daily-tasks-ed25519
   ```
   This will create:
   - Private key: `~/.ssh/aws-daily-tasks-ed25519`
   - Public key: `~/.ssh/aws-daily-tasks-ed25519.pub`

2. Import Key Pair to AWS:
   - Go to EC2 Dashboard
   - Click "Key Pairs" under "Network & Security"
   - Click "Import key pair"
   - Name it "daily-tasks-key"
   - Copy and paste the contents of your public key file (`aws-daily-tasks-ed25519.pub`)

3. Launch EC2 Instance:
   - Sign in to AWS Console
   - Go to EC2 Dashboard
   - Click "Launch Instance"
   - Choose "Amazon Linux 2023 AMI" (free tier eligible)
   - Select t2.micro instance type
   - Select the "daily-tasks-key" key pair you just imported
   - Configure Security Group:
     - Allow SSH (port 22)
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
     - Allow Custom TCP (port 5000)

4. Connect to EC2 Instance:
   ```bash
   # Set correct permissions for private key
   chmod 600 ~/.ssh/aws-daily-tasks-ed25519
   
   # Connect to your instance
   ssh -i ~/.ssh/aws-daily-tasks-ed25519 ec2-user@your-ec2-public-dns
   ```

3. Install Required Software:
   ```bash
   # Update system
   sudo yum update -y

   # Install Node.js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   . ~/.nvm/nvm.sh
   nvm install 18
   nvm use 18

   # Install Git
   sudo yum install git -y

   # Install PM2 (process manager)
   npm install -g pm2
   ```

4. Clone and Setup Application:
   ```bash
   # Clone repository
   git clone your-repository-url
   cd daily-tasks-dashboard/server

   # Install dependencies
   npm install

   # Create environment file
   cat > .env << EOL
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   NODE_ENV=production
   CORS_ORIGIN=your_frontend_url
   EOL

   # Build the application
   npm run build

   # Start the server with PM2
   pm2 start dist/index.js --name "daily-tasks-api"
   pm2 startup
   pm2 save
   ```

## Step 3: Frontend Deployment (AWS S3 + CloudFront)

1. Create S3 Bucket:
   - Go to S3 in AWS Console
   - Create a new bucket
   - Unblock all public access (since we'll use CloudFront)
   - Enable static website hosting

2. Build Frontend:
   ```bash
   # In your local machine
   cd client
   
   # Update API endpoint in services/api.ts
   # Change base URL to your EC2 instance URL
   
   # Build the application
   npm run build
   ```

3. Upload to S3:
   - Upload the contents of the `dist` folder to your S3 bucket
   - Make all uploaded files public

4. Create CloudFront Distribution:
   - Go to CloudFront in AWS Console
   - Create new distribution
   - Origin domain: Your S3 bucket website endpoint
   - Enable HTTPS
   - Set default root object to `index.html`
   - Configure error pages to redirect to index.html (for SPA routing)

5. Update DNS (Optional):
   - If you have a domain, create a CNAME record pointing to your CloudFront distribution

## Step 4: Security and SSL

1. Set up SSL Certificate:
   - Use AWS Certificate Manager (ACM) to create a free SSL certificate
   - Attach it to your CloudFront distribution

2. Configure CORS:
   - Update the CORS_ORIGIN in your backend .env file
   - Ensure your backend accepts requests from your frontend domain

## Step 5: Monitoring and Maintenance

1. Set up CloudWatch (free tier):
   ```bash
   # On EC2 instance
   sudo yum install amazon-cloudwatch-agent -y
   ```

2. Monitor Logs:
   - Use PM2 logs to monitor backend
   - Use CloudWatch for EC2 metrics
   - Use S3 logs for frontend access

## Important Notes

1. Free Tier Limits:
   - EC2: 750 hours per month
   - S3: 5GB storage
   - CloudFront: 50GB transfer per month
   - MongoDB Atlas: 512MB storage

2. Cost Management:
   - Set up billing alerts
   - Monitor usage regularly
   - Remove unused resources

3. Security:
   - Keep your EC2 instance updated
   - Use strong passwords
   - Regularly rotate access keys
   - Monitor security groups

## Troubleshooting

1. If the backend is not accessible:
   - Check EC2 security groups
   - Verify PM2 process is running
   - Check application logs

2. If the frontend is not loading:
   - Verify S3 bucket permissions
   - Check CloudFront distribution settings
   - Clear CloudFront cache if needed

3. If database connection fails:
   - Verify MongoDB Atlas network access
   - Check connection string in .env
   - Verify database user permissions

# Deploying to AWS EC2

## Prerequisites

1. AWS Account with EC2 access
2. Domain name (optional, but recommended for HTTPS)
3. Docker and Docker Compose installed on your local machine
4. GitHub repository with your code

## Step 1: EC2 Instance Setup

1. Launch EC2 Instance:
   - Choose Amazon Linux 2023 AMI
   - t2.micro (free tier) or t2.small (recommended for production)
   - Configure Security Group:
     ```
     Type        Port    Source
     SSH         22      Your IP
     HTTP        80      0.0.0.0/0
     HTTPS       443     0.0.0.0/0
     Custom TCP  5000    0.0.0.0/0
     ```

2. Connect to your EC2 instance:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

3. Install required software:
   ```bash
   # Update system
   sudo yum update -y

   # Install Docker
   sudo yum install docker -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ec2-user

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose

   # Install Git
   sudo yum install git -y
   ```

4. Log out and log back in for docker group changes to take effect:
   ```bash
   exit
   # SSH back into the instance
   ```

## Step 2: Application Setup

1. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/daily-tasks-dashboard.git
   cd daily-tasks-dashboard
   ```

2. Create .env file:
   ```bash
   touch .env
   ```

3. Add environment variables to .env:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   API_URL=http://your-ec2-ip:5000
   CORS_ORIGIN=http://your-ec2-ip
   ```

## Step 3: GitHub Actions Setup (CI/CD)

1. Add EC2 instance as self-hosted runner:
   - Go to GitHub repository → Settings → Actions → Runners
   - Click "New self-hosted runner"
   - Follow the installation instructions provided by GitHub
   - Configure runner as a service:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

2. Add GitHub Secrets:
   - Go to repository Settings → Secrets and Variables → Actions
   - Add the following secrets:
     ```
     DOCKER_USERNAME
     DOCKER_PASSWORD
     MONGODB_URI
     API_URL
     CORS_ORIGIN
     ```

## Step 4: SSL/HTTPS Setup (Optional but Recommended)

1. Install Certbot:
   ```bash
   sudo yum install certbot python3-certbot-nginx -y
   ```

2. Get SSL Certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. Update nginx configuration:
   ```bash
   sudo vim /etc/nginx/conf.d/default.conf
   ```
   Add SSL configuration from Certbot

## Step 5: Deployment

1. Manual Deployment:
   ```bash
   # Pull latest changes
   git pull origin main

   # Start the application
   docker-compose up -d

   # Check logs
   docker-compose logs -f
   ```

2. Automatic Deployment:
   - Push to your main branch
   - GitHub Actions will automatically:
     - Build Docker images
     - Push to Docker Hub
     - Deploy to EC2

## Step 6: Monitoring and Maintenance

1. Check container status:
   ```bash
   docker ps
   docker-compose ps
   ```

2. View logs:
   ```bash
   docker-compose logs -f
   ```

3. Monitor resources:
   ```bash
   docker stats
   ```

4. Backup MongoDB:
   ```bash
   # Add your MongoDB backup script here
   ```

## Troubleshooting

1. If containers fail to start:
   ```bash
   docker-compose logs
   ```

2. Check nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. Restart services:
   ```bash
   docker-compose restart
   ```

4. Clean up and rebuild:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Security Best Practices

1. Keep EC2 instance updated:
   ```bash
   sudo yum update -y
   ```

2. Monitor security groups and limit access

3. Use AWS CloudWatch for monitoring

4. Regularly rotate credentials and secrets

5. Enable AWS CloudTrail for auditing

## Backup and Recovery

1. Create AMI snapshots regularly

2. Set up MongoDB backups

3. Document recovery procedures

## Scaling (Future Considerations)

1. Use AWS Elastic Load Balancer
2. Set up Auto Scaling groups
3. Consider using AWS ECS/EKS for container orchestration
4. Implement CDN using CloudFront 