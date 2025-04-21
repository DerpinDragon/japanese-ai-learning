import React, { useState } from "react";
import Quiz from "./Quiz";
import Study from "./Study";
import LessonTest from "./LessonTest";
import Home from "./Home";

function App() {
  const [view, setView] = useState("home");

  return (
    <div className="bg-orange-50 min-h-screen font-sans">
      {view === "home" && <Home onNavigate={setView} currentView={view} />}
      {view === "quiz" && <Quiz onBack={() => setView("home")} />}
      {view === "study" && <Study onBack={() => setView("home")} />}
      {view === "lessonTest" && <LessonTest onBack={() => setView("home")} />}
    </div>
  );
}

export default App;



