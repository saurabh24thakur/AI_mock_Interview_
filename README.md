# Procoder - AI Mock Interview Platform

**Procoder** is an advanced AI-powered mock interview application designed to help users prepare for technical interviews. It features a modern, immersive "Noir/Mist" UI, real-time AI feedback, and comprehensive performance analytics.

![Procoder Dashboard](https://via.placeholder.com/800x450?text=Procoder+Dashboard+Preview)

## 🚀 Features

-   **🤖 AI-Powered Interviews**: Conducts realistic mock interviews using Google's Gemini AI to generate questions and analyze responses.
-   **🎙️ Real-time Analysis**: Analyzes audio responses for **Fluency**, **Confidence**, **Correctness**, and **Body Language**.
-   **📊 Comprehensive Dashboard**: Visualizes performance metrics with interactive charts (Bar, Pie, Line) to track progress over time.
-   **🎨 Modern "Noir" UI**: A premium, dark-themed interface with glassmorphism, dynamic mist animations, and a monochromatic aesthetic.
-   **🔐 Secure Authentication**: Full user registration and login system using JWT and bcrypt.
-   **📝 Practice Mode**: Access a library of practice questions across various domains.
-   **📱 Responsive Design**: Fully optimized for desktop and tablet experiences.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [React](https://reactjs.org/) (Vite)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Routing**: [React Router DOM](https://reactrouter.com/)
-   **3D Elements**: React Three Fiber (for AI Avatar)

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
-   **AI Engine**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
-   **Authentication**: JSON Web Tokens (JWT) & bcryptjs
-   **File Handling**: Multer (for audio processing)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
-   Node.js (v16+)
-   MongoDB (Local or Atlas URI)
-   Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/saurabh24thakur/AI_mock_Interview_.git

```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional, if you need to override the backend URL):
```env
VITE_SERVER_URL=http://localhost:5000
```
*Note: The backend URL is currently hardcoded in `src/App.jsx` as `serverURL`. You may want to update this to use `import.meta.env.VITE_SERVER_URL` for flexibility.*

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the App
Open your browser and navigate to:
```
http://localhost:5173
```

## 📂 Project Structure

```
ai_interview/
├── backend/                # Express.js Backend
│   ├── config/             # DB Configuration
│   ├── controller/         # Request Handlers (Auth, Interview, etc.)
│   ├── models/             # Mongoose Models (User, Interview, etc.)
│   ├── routes/             # API Routes
│   ├── utils/              # Helper functions (AI analysis, etc.)
│   └── app.js              # Entry point
│
└── frontend/               # React Frontend
    ├── public/             # Static assets
    ├── src/
    │   ├── component/      # Reusable components (Navbar, Charts, etc.)
    │   ├── pages/          # Page components (Dashboard, Login, Interview)
    │   ├── App.jsx         # Main App component & Routing
    │   └── main.jsx        # Entry point
    └── tailwind.config.js  # Tailwind configuration
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## 📄 License

This project is licensed under the ISC License.
