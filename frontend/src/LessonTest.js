import React, { useState, useEffect } from "react";

function LessonTest({ onBack }) {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8000/lessons")
      .then((res) => res.json())
      .then((data) => setLessons(data.lessons || []))
      .catch((err) => console.error("Failed to load lessons:", err));
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setFeedback("");
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setScore(0);         // Reset score
    setAttempts(0);      // Reset attempts

    try {
      const res = await fetch("http://localhost:8000/generate_lesson_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_title: selectedLesson }),
      });

      const data = await res.json();
      setQuiz(data);
    } catch (err) {
      console.error("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (choice) => {
    if (!quiz) return;
    const correct = quiz.questions[currentQuestionIndex].answer;
    setSelectedAnswer(choice);
    setAttempts((prev) => prev + 1);

    if (choice === correct) {
      setScore((prev) => prev + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Incorrect. Correct answer: ${correct}`);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < quiz.questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setFeedback("");
      } else {
        setFeedback("🎉 Quiz complete!");
      }
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">📝 Lesson Quiz</h2>

      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-orange-600 underline mb-4 block hover:text-orange-800"
        >
          ← Back to Dashboard
        </button>
      )}

      <label className="block mb-2 font-medium">Select a Lesson:</label>
      <select
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        value={selectedLesson}
        onChange={(e) => setSelectedLesson(e.target.value)}
      >
        <option value="">Choose a lesson</option>
        {lessons.map((lesson, idx) => (
          <option key={idx} value={lesson}>
            {lesson}
          </option>
        ))}
      </select>

      <button
        onClick={startQuiz}
        disabled={!selectedLesson}
        className={`px-4 py-2 rounded ${
          !selectedLesson
            ? "bg-gray-300 text-gray-600"
            : "bg-orange-500 text-white hover:bg-orange-600 transition"
        }`}
      >
        Start Quiz
      </button>

      {loading && <p className="mt-4 text-gray-600">⏳ Loading quiz...</p>}

      {quiz && quiz.questions && quiz.questions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">
            {quiz.title || selectedLesson}
          </h3>

          <p className="text-sm text-gray-500 mb-2">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
          <p className="text-sm text-orange-700 mb-4 font-medium">
            Score: {score} / {attempts}
          </p>

          <p className="mb-4">{quiz.questions[currentQuestionIndex].question}</p>

          {quiz.questions[currentQuestionIndex].choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(choice)}
              disabled={selectedAnswer !== null}
              className="block w-full text-left px-4 py-2 mb-2 border border-gray-300 rounded hover:bg-orange-100 disabled:bg-gray-200"
            >
              {choice}
            </button>
          ))}

          {feedback && (
            <p className="mt-2 font-medium text-lg text-purple-700">{feedback}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default LessonTest;

