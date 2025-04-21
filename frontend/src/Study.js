import React, { useState, useEffect } from "react";

function Study({ onBack }) {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [term, setTerm] = useState("");
  const [notes, setNotes] = useState(null);
  const [grammarNotes, setGrammarNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGrammar, setLoadingGrammar] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/lessons")
      .then((res) => res.json())
      .then((data) => setLessons(data.lessons || []))
      .catch((err) => console.error("Failed to load lessons:", err));
  }, []);

  const handleNoteRequest = () => {
    setLoading(true);
    setNotes(null);
    fetch("http://localhost:8000/generate_notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term }),
    })
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error("Note fetch failed:", err))
      .finally(() => setLoading(false));
  };

  const getGrammarNotes = () => {
    setLoadingGrammar(true);
    setGrammarNotes(null);
    fetch("http://localhost:8000/generate_lesson_notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_title: selectedLesson }),
    })
      .then((res) => res.json())
      .then((data) => setGrammarNotes(data))
      .catch((err) => console.error("Grammar notes fetch failed:", err))
      .finally(() => setLoadingGrammar(false));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-gray-800">
      <h2 className="text-3xl font-bold text-genkiOrange mb-6 text-center">📚 Study Notes</h2>

      <label className="block mb-2 font-medium">Select a Lesson:</label>
      <select
        onChange={(e) => setSelectedLesson(e.target.value)}
        value={selectedLesson || ""}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="" disabled>
          Select a lesson
        </option>
        {lessons.map((lesson, idx) => (
          <option key={idx} value={lesson}>
            {lesson}
          </option>
        ))}
      </select>

      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 text-genkiOrange underline hover:text-orange-600 transition"
        >
          ← Back to Dashboard
        </button>
      )}

      {selectedLesson && (
        <div className="space-y-10">
          {/* ───── Vocabulary Notes ───── */}
          <section>
            <h3 className="text-2xl font-bold text-genkiOrange mb-2">📘 Vocabulary Notes</h3>
            <div className="flex flex-col sm:flex-row items-start gap-2">
              <input
                type="text"
                placeholder="Enter a Japanese term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="p-2 border rounded w-full sm:w-auto flex-grow"
              />
              <button
                onClick={handleNoteRequest}
                className="bg-genkiOrange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
              >
                Get Notes
              </button>
            </div>

            {loading && <p className="mt-3 text-gray-500">⏳ Generating notes...</p>}

            {notes && (
              <div className="bg-orange-50 mt-4 p-4 rounded shadow-sm">
                <p><strong>Summary:</strong> {notes.summary}</p>
                <p className="mt-1"><strong>Usage:</strong> {notes.usage}</p>
                {notes.examples?.length > 0 && (
                  <div className="mt-2">
                    <p><strong>Examples:</strong></p>
                    <ul className="list-disc list-inside text-sm">
                      {notes.examples.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          <hr className="border-t border-orange-100" />

          {/* ───── Grammar Notes ───── */}
          <section>
            <h3 className="text-2xl font-bold text-genkiOrange mb-2">📖 Lesson Grammar Notes</h3>
            <button
              onClick={getGrammarNotes}
              className="bg-orange-200 text-genkiOrange px-4 py-2 rounded hover:bg-orange-300 transition"
            >
              Get Grammar Overview
            </button>

            {loadingGrammar && <p className="mt-3 text-gray-500">⏳ Loading grammar overview...</p>}

            {grammarNotes && (
              <div className="bg-orange-50 mt-4 p-4 rounded shadow-sm">
                <h4 className="font-bold text-lg mb-2">{grammarNotes.title}</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {grammarNotes.grammar_points.map((point, idx) => (
                    <li key={idx}>
                      <strong>{point}:</strong> {grammarNotes.explanations[idx]}
                      <p className="ml-4 italic text-gray-700 break-words">
                        Example: {grammarNotes.examples[idx]}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Study;


