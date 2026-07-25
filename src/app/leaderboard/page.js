"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  Trophy,
  Crown,
  Medal,
  Zap,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";

export default function LeaderboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function loadLeaderboard() {
      const userResponse = await fetch("/api/user");

      if (!userResponse.ok) {
        router.push("/login");
        return;
      }

      setUser(await userResponse.json());

      const leaderboardResponse = await fetch("/api/leaderboard");
      const data = await leaderboardResponse.json();
      setPlayers(data);
    }

    loadLeaderboard();
  }, [router]);

  if (!user) {
    return <p className="loading-text">Loading leaderboard...</p>;
  }

  const topThree = players.slice(0, 3);
  const rest = players.slice(3);

  // XP progress for logged-in user
  const xpProgress = user.xp ? user.xp % 100 : 0;
  const currentLevel = user.xp ? Math.floor(user.xp / 100) + 1 : 1;

  return (
    <main className="app-layout">
      <AppSidebar
        userName={user.name}
        streak={user.streak}
        hearts={user.hearts}
      />

      <section className="main-content">
        <header className="top-bar">
          <div>
            <h2>
              <Trophy size={22} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
              Leaderboard
            </h2>
            <p>Keep learning and climb the rankings.</p>
          </div>

          <div className="top-stats">
            <span style={{ color: "var(--accent)" }}>
              <Flame size={20} /> {user.streak}
            </span>
            <span style={{ color: "var(--primary)" }}>
              <Zap size={20} /> {user.xp} XP
            </span>
          </div>
        </header>

        {/* User's own XP progress */}
        <div className="xp-bar-container" style={{ marginBottom: "24px" }}>
          <div className="xp-bar-label">
            <span>
              <Star size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
              Your Level: {currentLevel}
            </span>
            <span>{xpProgress}/100 XP</span>
          </div>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Podium for top 3 */}
        {topThree.length > 0 && (
          <div className="leaderboard-podium">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="podium-item silver">
                <div className="podium-crown" style={{ fontSize: "1.2rem" }}>
                  <Medal size={28} style={{ color: "#A0A0C0" }} />
                </div>
                <div className="podium-rank">#2</div>
                <div className="podium-name">{topThree[1].name}</div>
                <div className="podium-stats">
                  <Zap size={14} /> {topThree[1].xp} XP
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="podium-item gold">
                <div className="podium-crown">
                  <Crown size={32} style={{ color: "#FFD700" }} />
                </div>
                <div className="podium-rank">#1</div>
                <div className="podium-name">{topThree[0].name}</div>
                <div className="podium-stats">
                  <Zap size={14} /> {topThree[0].xp} XP
                </div>
                <div
                  style={{
                    background: "var(--primary)",
                    color: "#fff",
                    fontSize: "0.65rem",
                    padding: "2px 10px",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Top Learner
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="podium-item bronze">
                <div className="podium-crown" style={{ fontSize: "1.2rem" }}>
                  <Medal size={28} style={{ color: "#CD7F32" }} />
                </div>
                <div className="podium-rank">#3</div>
                <div className="podium-name">{topThree[2].name}</div>
                <div className="podium-stats">
                  <Zap size={14} /> {topThree[2].xp} XP
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rest of leaderboard */}
        <section className="quiz-card">
          {players.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--text-mid)", padding: "20px" }}>
              No players yet. Start learning to be the first! 🚀
            </p>
          )}

          {topThree.map((player, index) => (
            <div className="leaderboard-row" key={player.id || player._id}>
              <span className="leaderboard-rank">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </span>
              <span className="leaderboard-name">{player.name}</span>
              <span className="leaderboard-xp">{player.xp} XP</span>
              <span className="leaderboard-streak">
                <Flame size={16} /> {player.streak}
              </span>
            </div>
          ))}

          {rest.map((player, index) => (
            <div className="leaderboard-row" key={player.id || player._id}>
              <span className="leaderboard-rank">#{index + 4}</span>
              <span className="leaderboard-name">{player.name}</span>
              <span className="leaderboard-xp">{player.xp} XP</span>
              <span className="leaderboard-streak">
                <Flame size={16} /> {player.streak}
              </span>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}

