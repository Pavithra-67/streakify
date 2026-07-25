"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, HeartCrack, Sparkles, Star, Zap } from "lucide-react";

export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswerChecked,
  hearts,
  previousAnswer, //"What option did the user choose before?"
  previousResult,//"Was that answer correct?"
}) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [checking, setChecking] = useState(false);
  const [xpEarned, setXpEarned] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    setChecking(false);
    setXpEarned(null);

    if (previousAnswer) {
      setSelectedAnswer(previousAnswer);

      setFeedback({
        type: previousResult ? "correct" : "wrong",
        message: previousResult
          ? "You already answered this question correctly."
          : "You already answered this question.",
        correctAnswer: previousResult ? undefined : question.answer,
      });
    } else {
      setSelectedAnswer("");
      setFeedback(null);
    }
  }, [question, previousAnswer, previousResult]);

  async function checkAnswer() {
    if (previousAnswer) {
      return;
    }
    if (!selectedAnswer) {
      setFeedback({
        type: "warning",
        message: "Choose an answer first! 🎯",
      });
      return;
    }

    if (feedback || checking) {
      return;
    }

    if (hearts <= 0) {
      setFeedback({
        type: "warning",
        message: "No hearts left! Visit the Shop to refill. ❤️",
      });
      return;
    }

    setChecking(true);

    const response = await fetch("/api/quiz/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: question._id,
        selectedAnswer,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setFeedback({
        type: "warning",
        message: data.message || "Could not check your answer.",
      });
      setChecking(false);
      return;
    }

    setFeedback({
      type: data.correct ? "correct" : "wrong",
      message: data.message,
      correctAnswer: data.correctAnswer,
    });

    if (data.correct) {
      setXpEarned(10); // XP earned animation
    }

    onAnswerChecked({
      correct: data.correct,
      hearts: data.hearts,
      selectedAnswer,
    });

    setChecking(false);
  }

  const mascotImage =
    feedback?.type === "correct"
      ? "/characters/mascot-happy.png"
      : feedback?.type === "wrong"
        ? "/characters/mascot-sad.png"
        : "/characters/mascot-normal.png";

  // Confetti for correct answer
  const confettiColors = [
    "#FF9A00",
    "#58CC02",
    "#2EC4B6",
    "#FF6B6B",
    "#FFD93D",
  ];

  return (
    <section className="quiz-card" ref={cardRef}>
      {/* Progress bar */}
      <div className="quiz-progress">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <span
            className={
              index < questionNumber ? "progress-dot completed" : "progress-dot"
            }
            key={index}
          />
        ))}
      </div>

      {/* Confetti burst for correct answers */}
      {feedback?.type === "correct" &&
        confettiColors.map((color, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              background: color,
              left: `${20 + i * 15}%`,
              top: "40%",
              animationDelay: `${i * 0.1}s`,
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}

      <p className="question-count">
        <Zap size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
        Question {questionNumber} of {totalQuestions}
      </p>

      {/* Mascot */}
      <img
        className="quiz-mascot"
        src={mascotImage}
        alt="Streakify learning mascot"
        style={{
          width: "120px",
          height: "120px",
          objectFit: "contain",
          display: "block",
          margin: "0 auto 16px",
          animation: "mascot-bounce 2s ease-in-out infinite",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
        }}
      />

      <p className="level-badge">
        <Star
          size={12}
          style={{ display: "inline", verticalAlign: "middle" }}
        />{" "}
        {question.topic.toUpperCase()} ·{" "}
        {question.level?.toUpperCase() || "ALL"}
      </p>

      <h2>{question.question}</h2>

      <div className="answers">
        {question.options.map((option) => (
          <button
            className={
              selectedAnswer === option ? "answer selected-answer" : "answer"
            }
            key={option}
            onClick={() => {
              if (!feedback && !checking && hearts > 0 && !previousAnswer) {
                setSelectedAnswer(option);
              }
            }}
            disabled={
              Boolean(feedback) || checking || hearts <= 0 || previousAnswer
            }
          >
            {option}
            {selectedAnswer === option && !feedback && (
              <span
                style={{
                  float: "right",
                  color: "var(--secondary)",
                  fontSize: "0.8rem",
                }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Floating XP animation */}
      {xpEarned && (
        <div className="xp-float" style={{ top: "30%", right: "20%" }}>
          +{xpEarned} XP ✨
        </div>
      )}

      {!feedback || feedback.type === "warning" ? (
        <button
          className="button check-button"
          onClick={checkAnswer}
          disabled={checking || hearts <= 0}
          style={
            hearts <= 0
              ? {}
              : {
                  background:
                    "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                }
          }
        >
          {checking ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
              Checking...
            </span>
          ) : feedback?.type === "warning" ? (
            "Choose an answer first🎯"
          ) : (
            "Check answer ✓"
          )}
        </button>
      ) : (
        <div
          className={
            feedback.type === "correct"
              ? "answer-feedback correct-feedback"
              : "answer-feedback wrong-feedback"
          }
        >
          {feedback.type === "correct" ? (
            <CheckCircle2 size={36} style={{ flexShrink: 0 }} />
          ) : (
            <HeartCrack size={36} style={{ flexShrink: 0 }} />
          )}

          <div>
            <h3>
              {feedback.type === "correct" ? "🎉 Great work!" : "😅 Not quite!"}
            </h3>

            <p>{feedback.message}</p>

            {feedback.type === "correct" && (
              <p className="xp-text">
                <Sparkles size={17} />
                +10 XP · Keep going—you are building your streak!
              </p>
            )}

            {feedback.type === "wrong" && feedback.correctAnswer && (
              <p>
                Correct answer:{" "}
                <strong style={{ color: "var(--success)" }}>
                  {feedback.correctAnswer}
                </strong>
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
