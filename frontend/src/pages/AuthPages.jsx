import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Sparkles,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

function AuthFrame({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-side">
        <Link to="/" className="auth-back">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="auth-side-content">
          <div className="auth-art-icon">
            <Sparkles size={28} />
          </div>
          <div className="eyebrow">YOUR CAREER, WITH CLARITY</div>
          <h2>
            Prepare with
            <br />
            <span>purpose.</span>
          </h2>
          <p>Turn your experience into a focused plan for the opportunity you want.</p>
          <div className="auth-side-bottom">
            <span>Resume analysis</span>
            <i />
            <span>Skill insights</span>
            <i />
            <span>Interview prep</span>
          </div>
        </div>
        <div className="auth-side-foot">ASCENDAI · AI CAREER COMPANION</div>
      </div>
      <div className="auth-main">
        <div className="auth-card">
          <Logo />
          <div className="auth-title">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </div>
    </div>
  );
}
export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (user) return <Navigate to="/app" replace />;
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/app", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Log in to continue your preparation journey."
      footer={
        <>
          New to AscendAI? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit}>
        <label>Email address</label>
        <div className="input-wrap">
          <Mail size={17} />
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={change}
            required
            autoComplete="email"
          />
        </div>
        <label>Password</label>
        <div className="input-wrap">
          <LockKeyhole size={17} />
          <input
            name="password"
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={change}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="field-action"
            onClick={() => setShow(!show)}
            aria-label="Toggle password"
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-full btn-lg" disabled={busy}>
          {busy ? "Signing in…" : "Log in"} <ArrowRight size={17} />
        </button>
      </form>
    </AuthFrame>
  );
}
export function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (user) return <Navigate to="/app" replace />;
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthFrame
      title="Create your account"
      subtitle="A more focused interview preparation starts here."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit}>
        <label>Full name</label>
        <div className="input-wrap">
          <UserRound size={17} />
          <input
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={change}
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
          />
        </div>
        <label>Email address</label>
        <div className="input-wrap">
          <Mail size={17} />
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={change}
            required
            autoComplete="email"
          />
        </div>
        <label>Password</label>
        <div className="input-wrap">
          <LockKeyhole size={17} />
          <input
            name="password"
            type={show ? "text" : "password"}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={change}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="field-action"
            onClick={() => setShow(!show)}
            aria-label="Toggle password"
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <small className="field-hint">
          Use at least 8 characters, including a letter and a number.
        </small>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-full btn-lg" disabled={busy}>
          {busy ? "Creating account…" : "Create account"} <ArrowRight size={17} />
        </button>
        <p className="terms-note">
          By continuing, you agree to use AscendAI responsibly and keep your account credentials
          secure.
        </p>
      </form>
    </AuthFrame>
  );
}
