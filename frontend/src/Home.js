import React from "react";

function Home({ onNavigate, currentView }) {
  const navItems = [
    { key: "home", label: "🏠 Home" },
    { key: "quiz", label: "📝 Quiz" },
    { key: "study", label: "📚 Study" },
    { key: "lessonTest", label: "🧪 Lesson Test" },
  ];

  // Mock progress data (in the future this can come from localStorage or backend)
  const progress = {
    lastLesson: "Lesson 3: Making a Date",
    quizzesTaken: 5,
    averageScore: "80%",
    lastStudiedTerm: "ともだち (friend)",
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-start text-center px-6 py-8">
      {/* ─── Top Navigation Bar ───────────────────────────── */}
      <nav className="flex flex-wrap justify-center gap-4 bg-orange-100 p-3 rounded-xl shadow mb-10 w-full max-w-2xl">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              currentView === item.key
                ? "bg-genkiOrange text-white"
                : "text-genkiOrange hover:bg-orange-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* ─── Welcome Message ─────────────────────────────── */}
      <h1 className="text-5xl font-extrabold text-genkiOrange mb-4">
        Japanese AI Companion
      </h1>
      <p className="text-lg text-gray-700 max-w-xl mb-8">
        Welcome! This app is designed to help you study Japanese through
        AI-powered notes and quizzes. Use the navigation bar above to begin.
      </p>

      {/* ─── Progress Snapshot ───────────────────────────── */}
      <div className="bg-white shadow rounded-xl p-6 w-full max-w-xl text-left">
        <h2 className="text-2xl font-semibold text-genkiOrange mb-4">📊 Your Progress</h2>
        <ul className="text-gray-700 space-y-2">
          <li><strong>Last Lesson Studied:</strong> {progress.lastLesson}</li>
          <li><strong>Vocabulary Term Reviewed:</strong> {progress.lastStudiedTerm}</li>
          <li><strong>Quizzes Taken:</strong> {progress.quizzesTaken}</li>
          <li><strong>Average Score:</strong> {progress.averageScore}</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;


