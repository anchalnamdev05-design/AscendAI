import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  Files,
  UserRound,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  FileUser,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import { initials } from "../utils/format";

const links = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/analyze", label: "New analysis", icon: FilePlus2 },
  { to: "/app/reports", label: "My reports", icon: Files },
  { to: "/app/resume-builder", label: "Resume Builder", icon: FileUser },
  { to: "/app/profile", label: "Profile & settings", icon: UserRound },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    navigate("/");
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button
            className="icon-btn mobile-only"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "New analysis" && <span className="nav-plus">+</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon">
              <Sparkles size={16} />
            </div>
            <strong>Your next opportunity starts here.</strong>
            <p>Turn your resume into a focused preparation plan.</p>
            <NavLink to="/app/analyze" onClick={() => setOpen(false)}>
              Start preparing <ChevronRight size={14} />
            </NavLink>
          </div>
          <button className="profile-mini" onClick={() => navigate("/app/profile")}>
            <span className="avatar">{initials(user?.name)}</span>
            <span className="profile-mini-text">
              <strong>{user?.name || "Your account"}</strong>
              <small>{user?.email}</small>
            </span>
            <Settings size={16} />
          </button>
          <button className="logout-link" onClick={signOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-scrim"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-btn mobile-only"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {" "}
              {links.find((l) => l.to === window.location.pathname)?.label || "Overview"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="status-dot" /> AI workspace ready{" "}
            <span className="avatar avatar-small">{initials(user?.name)}</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
