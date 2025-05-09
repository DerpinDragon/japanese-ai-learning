## 🛠️ Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js + npm
- OpenAI API key

### 1. Backend Setup (FastAPI)

bash
cd backend
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
Create a .env file in /backend and add:

env
Copy
Edit
OPENAI_API_KEY=your_openai_key_here
Then start the backend:

bash
Copy
Edit
uvicorn main:app --reload
2. Frontend Setup (React + Tailwind)
bash
Copy
Edit
cd frontend
npm install
npm start
