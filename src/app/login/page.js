"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {Eye , EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword,setshowPassword] =useState(false);
  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
          top: "20%",
          left: "10%",
          width: "10px",
          height: "10px",
          background: "var(--secondary)",
          animation: "particle-float 4s ease-in-out infinite",
        }}
      />
      <div
        className="floating-particle"
        style={{
          top: "50%",
          right: "15%",
          width: "8px",
          height: "8px",
          background: "var(--primary)",
          animation: "particle-float 5s ease-in-out infinite 1s",
        }}
      />

      {/* Mascot */}
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <img
          src="/characters/mascot-normal.png"
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

      <h1>Welcome back!</h1>
      <p>Log in to continue your streak.</p>

      <form className="login-form" onSubmit={handleLogin} autoComplete="off">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="off"
        />

        <label htmlFor="password">Password </label>
        
        <div className="password-container">
          <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="off"
          //style={{padding : "40px"}}
        />

        <button type="button"
        onClick={() => setshowPassword(!showPassword)}
        className="password-toggle"
        > 
        {showPassword ? <EyeOff  /> :<Eye />}
        </button>
        </div>
        <button className="button button-primary" type="submit">
          🔥 Log in
        </button>

        {message && <p className="feedback">{message}</p>}
      </form>

      <p>
        New to Streakify?{" "}
        <Link href="/register">Create an account 🚀</Link>
      </p>
    </main>
  );
}

