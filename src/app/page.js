import Link from "next/link";

export default function HomePage() {
  return (
    <main className="center-page">
      {/* Floating decorative particles */}
      <div
        className="floating-particle"
        style={{
          top: "20%",
          left: "15%",
          width: "12px",
          height: "12px",
          background: "var(--primary)",
          animation: "particle-float 4s ease-in-out infinite",
        }}
      />
      <div
        className="floating-particle"
        style={{
          top: "60%",
          right: "20%",
          width: "10px",
          height: "10px",
          background: "var(--secondary)",
          animation: "particle-float 5s ease-in-out infinite 1s",
        }}
      />
      <div
        className="floating-particle"
        style={{
          top: "30%",
          right: "30%",
          width: "8px",
          height: "8px",
          background: "var(--accent)",
          animation: "particle-float 3.5s ease-in-out infinite 0.5s",
        }}
      />
      <div
        className="floating-particle"
        style={{
          bottom: "30%",
          left: "25%",
          width: "14px",
          height: "14px",
          background: "var(--warning)",
          animation: "particle-float 6s ease-in-out infinite 2s",
        }}
      />

      <div style={{ position: "relative", marginBottom: "8px" }}>
        <span
          style={{
            fontSize: "4rem",
            display: "block",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          ⚡
        </span>
      </div>

      <h1>Streakify</h1>
      <p>Learn every day. Build your streak. Level up your knowledge.</p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "8px",
        }}
      >
        <Link className="button button-primary" href="/register">
          🚀 Get Started
        </Link>
        <Link
          className="button button-secondary"
          href="/login"
          style={{ background: "linear-gradient(135deg, #8A8AAA, #6A6A8A)" }}
        >
          🔑 Log In
        </Link>
      </div>
    </main>
  );
}

