# Pathaura-AI-Powered-Safety-Emergency-Assistance-Platform

Pathaura is an AI-powered safety and emergency assistance platform designed for women, elderly users, and people with disabilities. It combines real-time SOS alerts, GPS tracking, nearby service discovery, volunteer coordination, and emergency support features into a single web experience.

## Overview

Pathaura focuses on personal safety by offering:
- Instant SOS emergency triggering
- Live location tracking and travel history
- Volunteer registration and nearby support coordination
- Emergency contact management
- Nearby essential services such as hospitals, toilets, food points, and safe locations
- AI-based fake call assistance for added personal security
- Harassment reporting and safety monitoring tools

## Key features

- Emergency response and SOS handling
- Real-time tracking and route monitoring
- Volunteer support network
- Personal emergency contacts
- Safe route assistance and proximity-based services
- Secure authentication and profile management

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with a lightweight HTTP server
- Database: MongoDB
- API: REST endpoints for authentication, SOS, tracking, volunteers, services, and emergency contacts

## Project structure

- frontend/ — static web pages and UI assets
- backend/ — server logic, routes, and database integration
- server.js — main server entrypoint
- package.json — Node.js dependencies and scripts

## Run locally

1. Install dependencies:
   npm install
2. Start MongoDB if you want full database-backed functionality
3. Start the server:
   npm start
4. Open the app in your browser:
   http://localhost:3000

## API endpoints

- POST /api/auth/register
- POST /api/auth/verify-otp
- POST /api/auth/update-profile
- GET /api/auth/profile/:mobile
- POST /api/sos/trigger
- POST /api/sos/resolve
- POST /api/tracking/start
- POST /api/tracking/add-point
- POST /api/tracking/end
- GET /api/services/all

## Notes

The project is designed to run locally with a simple Node.js setup while remaining easy to extend with additional safety features and integrations.
