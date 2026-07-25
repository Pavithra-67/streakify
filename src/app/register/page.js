"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {Eye , EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword,setshowPassword] =useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="center-page">
      {/* Floating particles */}
      <div
        className="floating-particle"
        style={{
          top: "15%",
          right: "20%",
          width: "10px",
          height: "10px",
          background: "var(--primary)",
          animation: "particle-float 4.5s ease-in-out infinite",
        }}
      />
      <div
        className="floating-particle"
        style={{
          bottom: "30%",
          left: "15%",
          width: "8px",
          height: "8px",
          background: "var(--secondary)",
          animation: "particle-float 5s ease-in-out infinite 0.8s",
        }}
      />
      <div
        className="floating-particle"
        style={{
          top: "40%",
          right: "10%",
          width: "12px",
          height: "12px",
          background: "var(--accent)",
          animation: "particle-float 3.8s ease-in-out infinite 1.5s",
        }}
      />

      {/* Mascot */}
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <img
          src="/characters/mascot-happy.png"
          alt="Streakify mascot"
          style={{
            width: "100px",
            height: "100px",
            objectFit: "contain",
            animation: "mascot-bounce 2s ease-in-out infinite",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
          }}
        />
      </div>

      <h1>Join Streakify!</h1>
      <p>Create your account and start learning today.</p>

      <form
        className="login-form"
        onSubmit={handleRegister}
        autoComplete="off"
      >
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <label htmlFor="email">Email</label>
          <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="off"
        />

        <label htmlFor="password">Password</label>
        <div className="password-container">
          <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />

        <button type="button"
        onClick={() => setshowPassword(!showPassword)}
        className="password-toggle"
        > 
        {showPassword ? <EyeOff  /> :<Eye />}
        </button>
        </div>
        <button className="button button-primary" type="submit">
          🚀 Create account
        </button>

        {message && <p className="feedback">{message}</p>}
      </form>

      <p>
        Already have an account?{" "}
        <Link href="/login">Log in 🔥</Link>
      </p>
    </main>
  );
}

