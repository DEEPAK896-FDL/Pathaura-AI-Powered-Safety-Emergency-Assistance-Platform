# Pathaura-AI-Powered-Safety-Emergency-Assistance-Platform
AI-powered safety platform for women, elderly, and disabled people featuring SOS alerts, live GPS tracking, volunteer assistance, geofenced safe zones, AI fake calls, and nearby essential services.

## Run locally

1. Install dependencies:
   npm install
2. Start the server:
   npm start
3. Open the app:
   http://localhost:3000

## API endpoints

- POST /api/auth/register
- POST /api/auth/verify-otp
- POST /api/auth/update-profile
- GET /api/auth/profile/:mobile
- POST /api/sos/trigger
- GET /api/services/all
