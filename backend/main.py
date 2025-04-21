from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from fastapi.responses import JSONResponse
from typing import Optional, List
from pathlib import Path
import json
import time
import random
import os

app = FastAPI()

# Allow React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "FastAPI is running!"}

class NotesRequest(BaseModel):
    term: str
    topic: str = "vocabulary"
    context: str = ""

class LessonNotesRequest(BaseModel):
    lesson_title: str

class LessonTestRequest(BaseModel):
    lesson_title: str


@app.get("/lessons")
async def get_lessons():
    try:
        lessons_path = Path(__file__).parent / "lessons.json"
        with open(lessons_path, "r", encoding="utf-8") as f:
            lessons = json.load(f)
        return lessons
    except Exception as e:
        return {"error": str(e)}


# Request model
class QuizRequest(BaseModel):
    topic: str
    difficulty: str

# POST endpoint for quiz generation
@app.post("/generate_quiz/")
async def generate_quiz(request: QuizRequest):
    prompt = (
        f"You are a Japanese language tutor creating beginner-level quizzes.\n"
        f"Use ONLY vocabulary and grammar from the Genki I textbook.\n"
        f"Topic: {request.topic}\n"
        f"Difficulty: {request.difficulty}\n"
        f"Format: multiple choice, 4 answer options.\n"
        f"Do NOT repeat previous quizzes.\n"
        f"Return your answer as strict JSON in this format:\n"
        "{\n"
        '  "question": "What does ごご mean?",\n'
        '  "choices": ["A) AM", "B) PM", "C) Morning", "D) Time"],\n'
        '  "correct_answer": "B) PM"\n'
        "}\n"
        f"Request ID: {time.time()}"
    )

    try:
        # API key
        import os
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


        # Call
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=1.4,
            top_p=0.9,
            messages=[{"role": "user", "content": prompt}]
        )

        quiz_content = response.choices[0].message.content
        # Parse the JSON quiz content from the AI
        quiz_json = json.loads(quiz_content)
        return quiz_json

    except Exception as e:
        print("OpenAI error:", e)
        return {"error": str(e)}


class HelpRequest(BaseModel):
    term: str

@app.post("/explain/")
async def explain_term(request: HelpRequest):
    prompt = (
        f"You are a helpful Japanese tutor. Explain the following Japanese term in beginner-friendly English: '{request.term}'. "
        f"Only use vocabulary and grammar from Genki I.\n"
        f"Then, provide 2 simple example sentences using the term, in Japanese and with English translations.\n"
        f"Respond in this JSON format:\n"
        "{\n"
        '  "explanation": "Simple explanation...",\n'
        '  "examples": [\n'
        '    "Japanese sentence with English translation",\n'
        '    "Another Japanese sentence with translation"\n'
        "  ]\n"
        "}"
    )

    try:
        import os
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=1.1,
            top_p=0.95,
            messages=[{"role": "user", "content": prompt}]
        )

        reply = response.choices[0].message.content
        return json.loads(reply)

    except Exception as e:
        print("Explanation error:", e)
        return {"error": str(e)}


@app.post("/generate_notes")
async def generate_notes(req: NotesRequest):
    try:
        import os
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


        prompt = (
            f"You are a Japanese language tutor helping students understand vocabulary and grammar.\n"
            f"Write helpful study notes on the term '{req.term}' that appeared in a Japanese learning context.\n"
            f"Topic: {req.topic}\n"
            f"Context: {req.context}\n"
            f"Return JSON like this:\n"
            f"{{\n"
            f"  \"summary\": \"...\",\n"
            f"  \"usage\": \"...\",\n"
            f"  \"examples\": [\"...\", \"...\"]\n"
            f"}}"
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        notes_json = json.loads(response.choices[0].message.content)
        return notes_json

    except Exception as e:
        print("Notes generation error:", e)
        return {"summary": "Failed to generate notes.", "usage": "", "examples": []}


@app.post("/generate_lesson_notes")
async def generate_lesson_notes(req: LessonNotesRequest):
    try:
        import os
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


        prompt = (
            f"You are a Japanese language teacher. Provide a full study guide for *all* grammar points covered in '{req.lesson_title}' from Genki I.\n"
            f"For each grammar point, include:\n"
            f"1. A short explanation\n"
            f"2. One Japanese example sentence\n"
            f"3. An English translation of that sentence\n\n"
            f"Return the result in valid JSON format like this:\n"
            f"{{\n"
            f"  \"title\": \"{req.lesson_title}\",\n"
            f"  \"grammar_points\": [\"Grammar Point 1\", \"Grammar Point 2\", ...],\n"
            f"  \"explanations\": [\"Explanation 1\", \"Explanation 2\", ...],\n"
            f"  \"examples\": [\"Japanese Sentence 1 - English Translation\", \"...\" ]\n"
            f"}}"
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        notes_json = json.loads(response.choices[0].message.content)
        return notes_json

    except Exception as e:
        print("Lesson notes generation error:", e)
        return {"title": req.lesson_title, "grammar_points": [], "explanations": []}



@app.post("/generate_lesson_quiz")
async def generate_lesson_quiz(req: LessonTestRequest):
    try:
        import os
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


        prompt = (
            f"You are a Japanese language quiz generator. Create a 5-question multiple-choice quiz for students studying '{req.lesson_title}' from Genki I.\n"
            f"Each question should test a key grammar or vocabulary point from the lesson.\n"
            f"Provide 4 answer choices and indicate the correct one.\n"
            f"Return JSON like this:\n"
            f"{{\n"
            f"  \"title\": \"...\",\n"
            f"  \"questions\": [\n"
            f"    {{\n"
            f"      \"question\": \"...\",\n"
            f"      \"choices\": [\"...\", \"...\", \"...\", \"...\"],\n"
            f"      \"answer\": \"...\"\n"
            f"    }}\n"
            f"  ]\n"
            f"}}"
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        quiz_data = json.loads(response.choices[0].message.content)
        return quiz_data

    except Exception as e:
        print("Quiz generation error:", e)
        return {"title": req.lesson_title, "questions": []}



