"use client";

import { useEffect, useState } from "react";
import { Flame, Heart, Zap, Star, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import QuizCard from "@/components/QuizCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("sql");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answerResults, setAnswerResults] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const [showXpGain, setShowXpGain] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  async function loadUser() {
    const response = await fetch("/api/user", {
      cache: "no-store",
    });

    if (!response.ok) {
      router.replace("/login");
      return null;
    }

    const loggedInUser = await response.json();
    setUser(loggedInUser);
    return loggedInUser;
  }

  useEffect(() => {
    async function loadPage() {
      const loggedInUser = await loadUser();
      if (!loggedInUser) return;

      const questionsResponse = await fetch("/api/questions", {
        cache: "no-store",
      });
      const savedQuestions = await questionsResponse.json();
      setQuestions(savedQuestions);
    }

    loadPage();

    function reloadAfterBrowserCache(event) {
      if (event.persisted) {
        window.location.reload();
      }
    }

    window.addEventListener("pageshow", reloadAfterBrowserCache);
    return () => {
      window.removeEventListener("pageshow", reloadAfterBrowserCache);
    };
  }, []);

  if (!user || questions.length === 0) {
    return <p className="loading-text">Loading Streakify...</p>;
  }

  const completedIds = new Set(user.completedQuestionIds || []);
  const availableQuestions = questions.filter(
    (question) => !completedIds.has(question._id),
  );

  function sortByLevelAndOrder(firstQuestion, secondQuestion) {
    const firstLevel = firstQuestion.levelOrder ?? 1;
    const secondLevel = secondQuestion.levelOrder ?? 1;
    if (firstLevel !== secondLevel) return firstLevel - secondLevel;
    const firstOrder = firstQuestion.order ?? 1;
    const secondOrder = secondQuestion.order ?? 1;
    return firstOrder - secondOrder;
  }

  const courseQuestions = availableQuestions
    .filter((question) => question.topic === selectedCourse)
    .sort(sortByLevelAndOrder);

  const dailyQuestions = courseQuestions.slice(0, 5);

  function changeCourse(course) {
    setSelectedCourse(course);
    setCurrentQuestion(0);
    setAnswerResults({});
    setSelectedAnswers({});
    setLessonCompleted(false);
    setCompletionMessage("");
    setShowXpGain(false);
  }

  function saveAnswer(result) {
    setAnswerResults((oldResults) => ({
      ...oldResults,
      [currentQuestion]: result.correct,
    }));

    setSelectedAnswers((oldAnswers) => ({
      ...oldAnswers,
      [currentQuestion]: result.selectedAnswer,
    }));

    if (result.hearts !== null) {
      setUser((oldUser) => ({
        ...oldUser,
        hearts: result.hearts,
      }));
    }
  }

  async function completeLesson() {
    if (dailyQuestions.length !== 5) {
      setCompletionMessage(
        "This course needs at least five available questions to create a daily lesson.",
      );
      return;
    }

    const allAnswered = dailyQuestions.every((_, index) =>
      Object.hasOwn(answerResults, index),
    );

    if (!allAnswered) {
      setCompletionMessage("Answer all five questions first! 🎯");
      return;
    }

    const answers = dailyQuestions.map((question, index) => ({
      questionId: question._id,
      selectedAnswer: selectedAnswers[index],
    }));

    const response = await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        course: selectedCourse,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setCompletionMessage(data.message || "Could not complete lesson.");
      return;
    }

    setLessonCompleted(true);
    setXpGained(data.xpEarned || 0);
    setShowXpGain(true);

    setCompletionMessage(
      `Lesson completed! You got ${data.correctAnswers}/5 correct and earned ${data.xpEarned} XP.`,
    );

    await loadUser();

    // Hide XP gain animation after 2s
    setTimeout(() => setShowXpGain(false), 2500);
  }

  // XP progress calculation (assume level up every 100 XP)
  const xpProgress = user.xp ? user.xp % 100 : 0;
  const currentLevel = user.xp ? Math.floor(user.xp / 100) + 1 : 1;

  if (dailyQuestions.length === 0) {
    return (
      <main className="app-layout">
        <AppSidebar
          selectedCourse={selectedCourse}
          setSelectedCourse={changeCourse}
          userName={user.name}
          streak={user.streak}
          hearts={user.hearts}
        />
        <section className="main-content">
          <section className="quiz-card">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <span
                style={{
                  fontSize: "3rem",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                🎉
              </span>
              <h2>Course completed!</h2>
              <p>
                You completed every available question in this course. Add more
                advanced questions to continue learning.
              </p>
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="app-layout">
      <AppSidebar
        selectedCourse={selectedCourse}
        setSelectedCourse={changeCourse}
        userName={user.name}
        streak={user.streak}
        hearts={user.hearts}
      />

      <section className="main-content">
        <header className="top-bar">
          <div>
            <h2>
              <Star
                size={20}
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              {selectedCourse.toUpperCase()} Course
            </h2>
            <p>Complete five questions today to maintain your streak!</p>
          </div>

          <div className="top-stats">
            <span className="streak-fire" style={{ color: "var(--accent)" }}>
              <Flame size={20} /> {user.streak}
            </span>
            <span>
              <Heart size={20} /> {user.hearts}
            </span>
            <span style={{ color: "var(--primary)" }}>
              <Zap size={20} /> {user.xp} XP
            </span>
          </div>
        </header>

        {/* XP Progress Bar */}
        <div className="xp-bar-container" style={{ marginBottom: "20px" }}>
          <div className="xp-bar-label">
            <span>
              <Sparkles
                size={14}
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              Level {currentLevel}
            </span>
            <span>{xpProgress}/100 XP</span>
          </div>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* XP Gain Popup */}
        {showXpGain && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              marginBottom: "16px",
              background:
                "linear-gradient(135deg, rgba(255,154,0,0.1), rgba(255,107,107,0.1))",
              borderRadius: "var(--radius-md)",
              border: "2px solid var(--primary)",
              animation: "feedback-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <span style={{ fontSize: "2rem", display: "block" }}>⚡</span>
            <strong style={{ fontSize: "1.2rem", color: "var(--primary)" }}>
              +{xpGained} XP Earned!
            </strong>
          </div>
        )}

        {lessonCompleted ? (
          <section className="quiz-card">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <span
                style={{
                  fontSize: "3rem",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                🏆
              </span>
              <h2>Daily lesson completed!</h2>
              <p>{completionMessage}</p>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <button
                  className="button button-primary"
                  onClick={() => router.push("/leaderboard")}
                >
                  🏆 View leaderboard
                </button>
              </div>
            </div>
          </section>
        ) : user.hearts <= 0 ? (
          <section className="quiz-card">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <span
                style={{
                  fontSize: "3rem",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                💔
              </span>
              <h2>No hearts left</h2>
              <p>Visit the Shop and use XP to refill your hearts.</p>
              <div style={{ marginTop: "20px" }}>
                <button
                  className="button button-primary"
                  onClick={() => router.push("/shop")}
                >
                  🛒 Go to Shop
                </button>
              </div>
            </div>
          </section>
        ) : dailyQuestions.length < 5 ? (
          <section className="quiz-card">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <span
                style={{
                  fontSize: "3rem",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                🚧
              </span>
              <h2>More questions coming soon</h2>
              <p>You have completed the available questions in this course.</p>
            </div>
          </section>
        ) : (
          <>
            <QuizCard
              question={dailyQuestions[currentQuestion]}
              questionNumber={currentQuestion + 1}
              totalQuestions={dailyQuestions.length}
              hearts={user.hearts}
              onAnswerChecked={saveAnswer}
              previousAnswer={selectedAnswers[currentQuestion]}
              previousResult={answerResults[currentQuestion]}
            />

            <div className="quiz-controls">
              <button
                className="button button-secondary"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
              >
                ← Previous
              </button>

              <button
                className="button button-primary"
                disabled={currentQuestion === dailyQuestions.length - 1}
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next →
              </button>
            </div>

            {currentQuestion === dailyQuestions.length - 1 && (
              <button
                className="button complete-button"
                onClick={completeLesson}
              >
                ⚡ Complete today&apos;s lesson
              </button>
            )}
          </>
        )}

        {completionMessage && !lessonCompleted && (
          <p className="feedback">{completionMessage}</p>
        )}
      </section>
    </main>
  );
}
