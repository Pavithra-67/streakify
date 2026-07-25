"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  Heart,
  ShoppingBag,
  Zap,
  Sparkles,
  Gift,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";

export default function ShopPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [buying, setBuying] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  async function loadUser() {
    const response = await fetch("/api/user");

    if (!response.ok) {
      router.push("/login");
      return;
    }

    setUser(await response.json());
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function buyHeart() {
    setBuying(true);
    setMessage("");

    const response = await fetch("/api/shop/buy-heart", {
      method: "POST",
    });

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      setShowAnimation(true);
      await loadUser();
      setTimeout(() => setShowAnimation(false), 2500);
    }

    setBuying(false);
  }

  if (!user) {
    return <p className="loading-text">Loading shop...</p>;
  }

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
              <ShoppingBag size={22} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
              Shop
            </h2>
            <p>Use XP to refill hearts and continue learning.</p>
          </div>

          <div className="top-stats">
            <span style={{ color: "var(--accent)" }}>
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

        {/* XP Bar */}
        <div className="xp-bar-container" style={{ marginBottom: "24px" }}>
          <div className="xp-bar-label">
            <span>
              <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
              Level {currentLevel}
            </span>
            <span>{xpProgress}/100 XP</span>
          </div>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Purchase animation */}
        {showAnimation && (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              marginBottom: "20px",
              background:
                "linear-gradient(135deg, rgba(255,154,0,0.1), rgba(46,196,182,0.1))",
              borderRadius: "var(--radius-md)",
              border: "2px solid var(--secondary)",
              animation: "feedback-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <span style={{ fontSize: "2.5rem", display: "block" }}>❤️</span>
            <strong style={{ fontSize: "1.2rem", color: "var(--secondary)" }}>
              Heart refilled! Keep learning!
            </strong>
          </div>
        )}

        <div className="shop-grid">
          <section className="shop-item">
            <div className="shop-item-icon">❤️</div>
            <h2>
              <Gift size={22} /> One Heart
            </h2>
            <p>Use one heart to continue learning after mistakes.</p>
            <p className="shop-price">50 XP</p>

            <button
              className="button button-primary"
              onClick={buyHeart}
              disabled={buying || user.xp < 50}
              style={
                user.xp < 50
                  ? { background: "#CCC", boxShadow: "0 3px 0 #999" }
                  : {}
              }
            >
              {buying ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
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
                  Buying...
                </span>
              ) : user.xp < 50 ? (
                "Not enough XP 😅"
              ) : (
                "Buy one heart 💰"
              )}
            </button>

            {message && <p className="feedback">{message}</p>}
          </section>

          {/* Coming soon item */}
          <section
            className="shop-item"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            <div className="shop-item-icon">🎨</div>
            <h2>
              <Sparkles size={22} /> Coming Soon
            </h2>
            <p>More items are on the way. Stay tuned!</p>
            <p className="shop-price">??? XP</p>
            <button className="button" disabled style={{ background: "#CCC" }}>
              🔒 Locked
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}

