# Daily Tasks Report

A full-stack application for managing employee daily tasks with time tracking capabilities.

## Features

- CRUD operations for employee tasks
- Real-time task duration tracking
- Daily work hours summary
- Maximum 8-hour workday enforcement
- Responsive and modern UI using shadcn UI and Tailwind CSS

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

## Running Applicatioin 

1. **Local Environment** (`ENV = "local"`)


   - Set ENV = "local" in `client/src/config.ts`
   - in client folder and server folder run `npm i` then `npm run dev`
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`
   - You may need to make `.env` file in server folder which contains `PORT` and `MONGO_URI` for connection to your mongo db to see the data

2. **Production Environment** (`ENV = "prod"`)
   - Just visit: `http://13.60.148.183:3000`
 where `13.60.148.183` is the EC2 instance on which app deployed 

## Resources

- [Tutorial Video: how to deploy MERN app on EC2 AWS](https://www.youtube.com/watch?v=ivtVu1D3Hyk)
