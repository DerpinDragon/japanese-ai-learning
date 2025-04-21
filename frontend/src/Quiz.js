import React, { useState } from "react";

function Quiz({ onBack }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [helpResponse, setHelpResponse] = useState(null);
  const [loadingHelp, setLoadingHelp] = useState(false);
  const [notes, setNotes] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const getQuiz = async () => {
    setFeedback("");
    setSelected(null);
    setHelpResponse(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/generate_quiz/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "vocabulary",
          difficulty: "beginner",
        }),
      });

      const data = await res.json();
      setQuiz(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setFeedback("⚠ Failed to Load Quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (choice) => {
    setSelected(choice);
    setFeedback(
      choice === quiz.correct_answer
        ? "✅ Correct!"
        : `❌ Incorrect. Correct answer: ${quiz.correct_answer}`
    );

    setTimeout(() => {
      getQuiz();
    }, 3000);
  };

  const getHelp = async () => {
    if (!quiz || !quiz.question) return;

    setLoadingHelp(true);
    try {
      const res = await fetch("http://localhost:8000/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: quiz.question }),
      });
      const data = await res.json();
      setHelpResponse(data);
    } catch (err) {
      console.error("Help fetch failed:", err);
    } finally {
      setLoadingHelp(false);
    }
  };

  const getNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch("http://localhost:8000/generate_notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: quiz.question,
          topic: "vocabulary",
          context: "Came up in a quiz",
        }),
      });

      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Note fetch failed:", err);
      setNotes({ summary: "Failed to fetch notes.", usage: "", examples: [] });
    } finally {
      setLoadingNotes(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">📝 Japanese Quiz</h2>

      {!hasStarted ? (
        <button
          onClick={() => {
            setHasStarted(true);
            getQuiz();
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Start Quiz
        </button>
      ) : (
        <div>
          {loading && <p className="text-gray-600 mb-4">⏳ Loading next quiz...</p>}

          {quiz && !loading && (
            <div>
              <p className="mb-4 font-medium">{quiz.question}</p>

              <div className="space-y-2">
                {quiz.choices &&
                  quiz.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(choice)}
                      className="block w-full text-left px-4 py-2 border rounded hover:bg-orange-100 disabled:bg-gray-200"
                      disabled={selected !== null}
                    >
                      {choice}
                    </button>
                  ))}
              </div>

              {feedback && <p className="mt-3 font-semibold text-purple-700">{feedback}</p>}

              <div className="mt-6 space-y-4">
                <button
                  onClick={getHelp}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  📘 Need Help?
                </button>

                {loadingHelp && <p>Loading help...</p>}

                {helpResponse && (
                  <div className="bg-blue-50 p-4 rounded">
                    <p><strong>Explanation:</strong> {helpResponse.explanation}</p>
                    <ul className="list-disc list-inside mt-2">
                      {helpResponse.examples &&
                        helpResponse.examples.map((ex, idx) => (
                          <li key={idx}>{ex}</li>
                        ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={getNotes}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  📓 View Notes
                </button>

                {loadingNotes && <p>Loading notes...</p>}

                {notes && (
                  <div className="bg-yellow-50 p-4 rounded">
                    <p><strong>Summary:</strong> {notes.summary}</p>
                    <p><strong>Usage:</strong> {notes.usage}</p>
                    {notes.examples?.length > 0 && (
                      <>
                        <p className="mt-2"><strong>Examples:</strong></p>
                        <ul className="list-disc list-inside">
                          {notes.examples.map((ex, idx) => (
                            <li key={idx}>{ex}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="mt-6 text-sm text-orange-600 underline hover:text-orange-800"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Quiz;

