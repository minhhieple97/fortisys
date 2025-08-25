# FortiSys Tech Test Requirements

## Overview
This test evaluates fundamental software engineering skills and the ability to leverage AI as a knowledgeable co-pilot. The challenge involves building a minimal, fullstack application that simulates a real-time worker vitals dashboard for monitoring worker safety.

## Project Objective
Develop a fullstack application that can handle a high-volume, continuous stream of data, simulating hundreds of vital records from workers in the field. The solution must provide real-time monitoring capabilities while maintaining performance and security.

## Technology Stack
- **Frontend**: Next.js (latest version)
- **Backend**: NestJS (latest version)
- **Database**: PostgreSQL

## Functional Requirements

### Frontend (Next.js)
1. Create a single-page dashboard application using the latest Next.js framework
2. Implement a data submission form with:
   - Input field for heart rate (integer)
   - Input field for temperature (float)
   - "Send Data" button to submit the data
3. Implement a real-time display showing the last 10 vital sign records for a hardcoded worker ID
4. Ensure optimal performance for data fetching and display

### Backend (NestJS)
1. Create an API endpoint to receive vital sign data from the frontend
2. Implement data validation to check for:
   - Missing values in required fields
   - Invalid values for heart rate and temperature
3. Store validated data in the PostgreSQL database
4. Handle high-volume data efficiently

### Database (PostgreSQL)
1. Design and implement a table with the following schema:
   - `workerId` (string)
   - `heartRate` (integer)
   - `temperature` (float)
   - `timestamp` (ISO string)
2. Optimize for high-volume data storage and retrieval

## Non-Functional Requirements
1. **Performance**: The system must handle a large volume of data efficiently
2. **Security**: Implement protection against common vulnerabilities
3. **Code Quality**: Follow latest framework conventions and best practices
4. **Error Handling**: Implement appropriate error handling throughout the application