# E-Commerce Shop

A full-stack e-commerce application built with Next.js (Frontend) and NestJS (Backend).

## Project Structure

This is a monorepo containing both the frontend and backend applications:

- `/frontend`: Next.js application (React, Tailwind CSS, Ant Design)
- `/backend`: NestJS application (TypeScript, MongoDB, Socket.io, Gemini AI)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file and configure your variables:
   ```bash
   cp .env.example .env
   ```
4. Start the backend development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file and configure your variables:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Features

- **Product Management:** Browse, filter, and view products.
- **Cart & Checkout:** Manage cart items and simulate orders.
- **Admin Dashboard:** Manage products, categories, orders, and customers.
- **AI Chatbot:** Integrated AI assistant powered by Google Gemini to help customers find products.
- **Real-time Notifications:** (Configured via Socket.io)

