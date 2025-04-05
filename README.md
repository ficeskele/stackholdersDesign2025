# Equity Distribution Machine

This project is a full-stack application designed to help startup founders automate token issuance and equity distribution. The project includes:

- A **React** frontend that allows users to:
  - Create a token.
  - Create/retrieve holders using dynamic email inputs (up to 4 members).
  - Answer a set of questions that determine each holder’s equity percentage.
  - View the computed equity breakdown and, if desired, trigger token distribution.

- An **Express** backend server that:
  - Integrates with the [Metal API](https://api.metal.build) to create tokens, create/retrieve holders, and distribute tokens.
  - Uses **Puppeteer** to drive the [Foundrs website](https://foundrs.com) in order to calculate the final equity distribution based on user input.

This README provides step-by-step instructions for setting up and running the project.

---

## Table of Contents

- [Equity Distribution Machine](#equity-distribution-machine)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Configuration](#configuration)
    - [Backend (.env)](#backend-env)
    - [Puppeteer](#puppeteer)
  - [Running the Project](#running-the-project)
    - [Running the Backend Server](#running-the-backend-server)
    - [Running the Frontend Application](#running-the-frontend-application)
  - [API Endpoints](#api-endpoints)
    - [POST `/create-token`](#post-create-token)
    - [POST `/create-holder`](#post-create-holder)
    - [POST `/distribute`](#post-distribute)
    - [GET `/token-status/:jobId`](#get-token-statusjobid)
    - [POST `/calculate-equity`](#post-calculate-equity)
  - [Troubleshooting](#troubleshooting)

---

## Features

- **Token Creation:**  
  Create a token by providing a name, symbol, and merchant address. The backend uses the Metal API to create the token.

- **Holder Management:**  
  Create or retrieve holders by entering up to 4 email addresses. Emails are validated and encrypted before sending them to the backend.

- **Equity Calculation:**  
  Answer 15 pre-defined questions (using radio buttons or checkboxes) to calculate each holder’s equity percentage.  
  The frontend sends this data to the backend, which uses Puppeteer to interact with the Foundrs website and returns the computed equity table.

- **Token Distribution:**  
  Based on the calculated equity, distribute tokens to each holder. The distribution is only triggered if the computed amount is nonzero and uses the Metal API’s distribution endpoint.

- **Error Handling & Warnings:**  
  Warning messages (such as equity errors from the Foundrs calculation) are displayed in a clear, user-friendly manner.

---

## Project Structure

```
.
├── backend
│   ├── server.js           # Express server with API endpoints and Puppeteer integration
│   ├── calculator.js       # (Optional) Standalone Puppeteer script (integrated into server.js)
│   ├── package.json        # Backend dependencies and scripts
│   └── .env                # Environment variables (e.g., METAL_API_KEY)
└── frontend
    ├── src
    │   ├── App.js          # Main React component
    │   ├── App.css         # Styling for the application
    │   └── index.js        # React entry point
    ├── package.json        # Frontend dependencies and scripts
    └── public
        └── index.html      # HTML template
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- npm (comes with Node.js) or yarn
- A valid API key for the Metal API  
- A modern web browser (Chrome is used by Puppeteer in headless mode)

---

## Installation

### Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend folder and add your environment variables (see [Configuration](#configuration)).

### Frontend

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

---

## Configuration

### Backend (.env)

Create a `.env` file in your backend directory and add the following (replace `YOUR_METAL_API_KEY` with your actual key):

```
METAL_API_KEY=YOUR_METAL_API_KEY
PORT=3001
```

### Puppeteer

The backend uses Puppeteer with Chrome in headless mode. Ensure you have Chrome installed on your machine. If you need to change the browser (for example, to Firefox), adjust the Puppeteer launch options accordingly in `server.js`.

---

## Running the Project

### Running the Backend Server

1. In the `backend` folder, start the server:
   ```bash
   npm start
   ```
2. The server will start on [http://localhost:3001](http://localhost:3001) (or the port specified in your `.env` file).  
   The server exposes endpoints for token creation, holder creation, token distribution, token status checking, and equity calculation.

### Running the Frontend Application

1. In the `frontend` folder, start the React development server:
   ```bash
   npm start
   ```
2. The application will open in your default browser (typically on [http://localhost:3000](http://localhost:3000)).  
   Use the UI to create a token, create/retrieve holders, answer the equity questions, and distribute tokens.

---

## API Endpoints

### POST `/create-token`
- **Description:** Create a token using the Metal API.
- **Request Body:**
  ```json
  {
    "name": "MyToken",
    "symbol": "MTK",
    "merchantAddress": "0x1234567890abcdef..."
  }
  ```
- **Response:**  
  Returns a status of "creating" and the token object.

### POST `/create-holder`
- **Description:** Create or retrieve a holder by encrypted user ID.
- **Request Body:**
  ```json
  {
    "userId": "encrypted_string_here"
  }
  ```
- **Response:**  
  Returns the holder object.

### POST `/distribute`
- **Description:** Distribute tokens from your token balance.
- **Request Body:**
  ```json
  {
    "tokenAddress": "0xTokenAddress",
    "recipientAddress": "0xRecipientAddress",
    "amount": 100
  }
  ```
  Note: The backend sends the parameter `sendToAddress` to the Metal API.
- **Response:**  
  Returns the distribution result (e.g., `{ "success": true }`).

### GET `/token-status/:jobId`
- **Description:** Check the creation status of a token.
- **Response:**  
  Returns the current status of the token creation job.

### POST `/calculate-equity`
- **Description:** Launches Puppeteer to interact with the Foundrs website.  
  Fills in the provided founder names and answers, waits for the equity calculation, and returns the equity table.
- **Request Body:**
  ```json
  {
    "founders": ["founder1@example.com", "founder2@example.com", ...],
    "answers": [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]
  }
  ```
- **Response:**  
  Returns an object with the equity table rows and any error messages.

---

## Troubleshooting

- **Distribution Errors:**  
  If you see errors like "Must provide token address and amount" or "Must provide either sendToAddress or sendToId," double-check that the token creation and equity calculation endpoints are returning valid data. Ensure the distribution function in the frontend only calls the API when a nonzero amount is calculated, and that the payload uses `sendToAddress`.

- **Puppeteer Issues:**  
  If Puppeteer fails to launch, ensure you have a supported version of Chrome installed. Check the Puppeteer documentation if you need to adjust the launch options.

- **API Key Errors:**  
  Verify that your `METAL_API_KEY` is correctly set in the `.env` file and that your API key is valid.
