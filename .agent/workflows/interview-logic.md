---
description: How the AI Interview system analyzes audio, video, and generates questions from JD/Resume.
---

# AI Interview System Workflow

This document explains the technical implementation of audio analysis, video handling, and the AI-driven question generation process.

## 1. Audio Analysis Workflow
The system uses a hybrid approach combining browser-side processing and backend AI analysis.

### Step-by-Step Process:
1.  **Capture**: The browser requests microphone access via `navigator.mediaDevices.getUserMedia`.
2.  **Visualizer**: A live audio level visualizer is rendered using the **Web Audio API** (`AudioContext` and `AnalyserNode`) to show real-time mic activity.
3.  **Speech-to-Text (STT)**: The **Web Speech API** (`webkitSpeechRecognition`) processes the audio stream locally in the browser to generate a text transcript.
4.  **Submission**: Once the user stops recording, the transcript is sent to the backend `/api/interviews/analyze` endpoint.
5.  **AI Evaluation**: The backend uses the **Groq SDK (Llama 3.1 8B)** to evaluate the transcript against the original question.
    -   **Fluency**: Analyzes sentence structure, flow, and clarity.
    -   **Correctness**: Compares the answer's content with technical/situational expectations.
6.  **Results**: The AI returns a JSON object with qualitative feedback and numerical scores (0-100).

## 2. Video Handling Workflow
Currently, the video component is designed for user engagement and session recording simulation.

### Step-by-Step Process:
1.  **Stream**: The browser captures the webcam feed using `getUserMedia`.
2.  **Display**: The feed is rendered in a `<video>` element on the `InterviewPage`.
3.  **Analysis**: While the UI displays "Live Analysis" and "Body Language" placeholders, the current version focuses on audio-based feedback. The video serves to provide a professional interview environment for the candidate.

## 3. Question Generation Workflow
Questions are dynamically generated to ensure every interview is unique and relevant.

### A. Job Description (JD) Based
1.  **Input**: User provides Job Role, Experience, and JD text.
2.  **Prompting**: The backend constructs a prompt for Groq: *"You are a senior hiring manager... Generate 1 interview question based on this JD..."*
3.  **Output**: Groq returns a targeted question in JSON format.

### B. Resume + JD Based (Advanced)
1.  **Upload**: User uploads a PDF resume.
2.  **Parsing**: The backend uses `pdf-parse` to extract raw text from the PDF buffer.
3.  **Contextual Analysis**: The backend sends both the **Resume Text** and the **Job Description** to Groq.
4.  **Synthesis**: The AI is instructed to: *"Ask a specific question connecting the candidate's resume projects/skills to the job description."*
5.  **Result**: A highly personalized question that asks how the candidate's specific experience qualifies them for the role's requirements.

---

## Technical Stack Summary
-   **Frontend**: React, Web Speech API, Web Audio API, Framer Motion.
-   **Backend**: Node.js, Express, Multer (File Upload), PDF-Parse.
-   **AI Engine**: Groq (Llama 3.1 8B / 70B) for lightning-fast inference.
