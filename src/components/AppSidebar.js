"use client";

import {
  Flame,
  Heart,
  LogOut,
  BookOpen,
  Trophy,
  ShoppingBag,
  Home,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const courses = [
  { id: "sql", label: "SQL", color: "#FF9A00" },
  { id: "nosql", label: "NoSQL", color: "#2EC4B6" },
  { id: "java", label: "Java", color: "#FF6B6B" },
  { id: "js", label: "JavaScript", color: "#FFD93D" },
  { id: "dcn", label: "DCN", color: "#6C63FF" },
];

const courseDotColors = {
  sql: "#FF9A00",
  nosql: "#2EC4B6",
  java: "#FF6B6B",
  javascript: "#FFD93D",
  dcn: "#6C63FF",
};

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

  function openLearn() {
    router.push("/dashboard");
  }

  return (
    <>
      {/* Desktop Sidebar */}
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
                  pathname === item.path ? "nav-item active" : "nav-item"
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
                  className={
                    selectedCourse === course.id
                      ? "nav-item selected"
                      : "nav-item"
                  }
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <span
                    className="course-dot"
                    style={{ backgroundColor: course.color }}
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
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                className={
                  "bottom-nav-item" + (isActive ? " active" : "")
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

