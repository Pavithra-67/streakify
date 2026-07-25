"use client";

import {
  Flame,
  Heart,
  LogOut,
  BookOpen,
  Trophy,
  ShoppingBag,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const courses = [
  { id: "sql", label: "SQL", color: "#FF9A00" },
  { id: "nosql", label: "NoSQL", color: "#2EC4B6" },
  { id: "java", label: "Java", color: "#FF6B6B" },
  { id: "js", label: "JavaScript", color: "#FFD93D" },
  { id: "dcn", label: "DCN", color: "#6C63FF" },
];

const navItems = [
  { path: "/dashboard", label: "Learn", icon: BookOpen },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/shop", label: "Shop", icon: ShoppingBag },
];

export default function AppSidebar({
  selectedCourse,
  setSelectedCourse,
  userName,
  streak,
  hearts,
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* ================= Desktop Sidebar ================= */}

      <aside className="sidebar">
        <h1 className="logo">streakify</h1>
        <p className="logo-subtitle">✨ Learn Every Day</p>

        <nav>
          <p className="nav-title">MENU</p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                className={
                  pathname === item.path
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => router.push(item.path)}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>

                {item.label}
              </button>
            );
          })}

          {pathname === "/dashboard" && setSelectedCourse && (
            <>
              <p className="nav-title">COURSES</p>

              {courses.map((course) => (
                <button
                  key={course.id}
                  className={
                    selectedCourse === course.id
                      ? "nav-item selected"
                      : "nav-item"
                  }
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <span
                    className="course-dot"
                    style={{
                      backgroundColor: course.color,
                    }}
                  />

                  {course.label}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="profile-box">
          <p>{userName || "Learner"}</p>

          <div className="stats">
            <span>
              <Flame size={16} /> {streak ?? 0}
            </span>

            <span>
              <Heart size={16} /> {hearts ?? 5}
            </span>
          </div>

          <button className="sign-out" onClick={signOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ================= Mobile Courses ================= */}

      {pathname === "/dashboard" && setSelectedCourse && (
        <div className="mobile-courses">
          <p className="nav-title">COURSES</p>

          <div className="mobile-course-list">
            {courses.map((course) => (
              <button
                key={course.id}
                className={
                  selectedCourse === course.id
                    ? "nav-item selected"
                    : "nav-item"
                }
                onClick={() => setSelectedCourse(course.id)}
              >
                <span
                  className="course-dot"
                  style={{
                    backgroundColor: course.color,
                  }}
                />

                {course.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= Mobile Profile ================= */}

      <div className="mobile-profile">
        <p className="mobile-user">
          {userName || "Learner"}
        </p>

        <div className="stats">
          <span>
            <Flame size={16} /> {streak ?? 0}
          </span>

          <span>
            <Heart size={16} /> {hearts ?? 5}
          </span>
        </div>

        <button className="sign-out" onClick={signOut}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* ================= Bottom Navigation ================= */}

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                className={
                  "bottom-nav-item" +
                  (pathname === item.path
                    ? " active"
                    : "")
                }
                onClick={() => router.push(item.path)}
              >
                <Icon size={22} />

                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}