# Climate Risk Intelligence System (Coimbatore)

This project visualizes **Disaster Amplification** caused by infrastructure conditions in informal settlements in Coimbatore, India.

## Features
- **Live Weather Context**: Sourced from OpenWeather (Backend only).
- **Micro-Zone Heatmap**: Mock data for Coimbatore settlements.
- **Risk Amplification**: Fire, Disease, and Delayed Stagnation risks.
- **Intervention Simulator**: Test "pump", "power_cut", "tanker" scenarios.

## Structure
- `backend/`: AWS SAM project (Node.js Lambdas)
- `frontend/`: React + Vite application

## Setup

1. **Install Dependencies**
   ```bash
   # Backend (if running locally without Docker)
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env` in the root (for backend usage if needed, or set up in AWS).
   - Get an OpenWeather API Key.

3. **Run Locally**

   **Backend (SAM)**
   ```bash
   # In root
   sam local start-api
   ```
   *Runs at http://127.0.0.1:3000*

   **Frontend**
   ```bash
   # In separate terminal, inside frontend/
   npm run dev
   ```
   *Runs at http://localhost:5173*

## Deployment
- **Backend**: `sam deploy --guided`
- **Frontend**: Connect repo to AWS Amplify (uses `amplify.yml`).

## Security
- OpenWeather API Key is **NEVER** exposed to frontend. It resides in Lambda environment variables.

