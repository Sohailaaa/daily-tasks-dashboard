# Daily Tasks Report

A full-stack application for managing employee daily tasks with time tracking capabilities.

## Features

- CRUD operations for employee tasks
- Real-time task duration tracking
- Daily work hours summary
- Maximum 8-hour workday enforcement
- Responsive and modern UI using shadcn UI and Tailwind CSS

## Running the Application

There are two ways to use this application:

### 1. Access Deployed Version (Quickest)

Simply visit: [http://13.60.148.183:3000](http://13.60.148.183:3000)

That's it! The application is already running on our EC2 instance.

### 2. Run Locally (For Development)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd daily-tasks-report
   ```

2. **Configure Environment**
   Open `client/src/config.ts` and set:
   ```typescript
   export const ENV = "local";  // Use "local" for local testing
                               // Use "prod" for deployed backend
   ```

3. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Start the Application**
   
   For local development (runs everything locally):
   ```bash
   # Terminal 1: Start the server
   cd server
   npm run dev

   # Terminal 2: Start the client
   cd client
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Tech Stack

### Frontend
- React with TypeScript
- Redux for state management
- shadcn UI components
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB for data storage
- REST API

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (for local development only)
- npm or yarn

## Project Structure

```
daily-tasks-report/
├── client/               # React frontend
└── server/              # Node.js backend
```

## Environment Options

1. **Local Environment** (`ENV = "local"`)
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`
   - Requires running both server and client
   - Needs local MongoDB setup

2. **Production Environment** (`ENV = "prod"`)
   - Just visit: `http://13.60.148.183:3000`
   - Or run client locally connected to production:
     ```bash
     cd client
     npm install
     # Set ENV = "prod" in config.ts
     npm run dev
     ```

## Resources
- [Tutorial Video: how to deploy MERN app on EC2 AWS](https://www.youtube.com/watch?v=ivtVu1D3Hyk)
