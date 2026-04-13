# Nexus Platform 🚀

A comprehensive full-stack ecosystem connecting Entrepreneurs and Investors. This platform facilitates seamless networking, secure document sharing, video conferencing, and financial transactions.

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/aliirtaza58/Nexus/graphs/commit-activity)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Framework: React](https://img.shields.io/badge/Framework-React-61DAFB?logo=react)](https://react.dev/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)

---

## ✨ Key Features

-   **🔐 Secure Authentication**: JWT-based login, registration, and password reset functionality.
-   **📹 Real-time Video Calls**: Integrated video conferencing for entrepreneur-investor meetings using Socket.io.
-   **📂 Document Management**: Secure uploading and storage system for pitch decks and legal documents.
-   **💳 Payment Integration**: Transaction tracking and payment processing modules.
-   **📊 Dynamic Dashboards**: Tailored experiences for both Entrepreneurs (pitching) and Investors (browsing deals).
-   **💬 Live Messaging**: Real-time communication channel for potential collaborators.

---

## 🛠 Tech Stack

### Frontend
-   **React 18** (Vite-powered)
-   **TypeScript** for type safety
-   **Tailwind CSS** for modern styling
-   **Lucide React** for beautiful iconography
-   **Axios** for API communication
-   **React Router DOM** for navigation

### Backend
-   **Node.js & Express**
-   **MongoDB & Mongoose** (ODM)
-   **Socket.io** for real-time signaling
-   **JWT & Bcryptjs** for security
-   **Multer** for file handling

---

## 🚀 How to Run the Project

Follow these steps to get the project running locally on your machine.

### Prerequisites
-   **Node.js** (v18 or higher)
-   **MongoDB** (running locally or a cloud URI)
-   **npm** (comes with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/aliirtaza58/Nexus.git
cd Nexus
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

**Configure Environment Variables:**
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

**Start the Server:**
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal in the project root:
```bash
# Assuming you are in the root directory
npm install
```

**Start the Vite App:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```text
Nexus/
├── public/          # Static assets
├── server/          # Node.js backend
│   ├── middleware/  # Auth & Security middlewares
│   ├── models/      # MongoDB Schemas
│   ├── routes/      # API Endpoints
│   └── server.js    # Entry point
├── src/             # React frontend
│   ├── components/  # Reusable UI components
│   ├── context/     # Auth & State Management
│   ├── pages/       # Screen views
│   └── data/        # Mock data & Constants
├── .gitignore       # Optimized git exclusions
└── package.json     # Scripts & Dependencies
```

---

## 📄 License
Distributed under the ISC License. See `package.json` for details.

---

*Project developed as part of the Nexus Internship Program.*
