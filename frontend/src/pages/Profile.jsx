import { useEffect, useState } from "react";
import { Save, UserRound, LockKeyhole, ShieldCheck } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    headline: "",
    targetRole: "",
    experienceLevel: "Fresher",
  });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user)
      setForm({
        name: user.name || "",
        headline: user.headline || "",
        targetRole: user.targetRole || "",
        experienceLevel: user.experienceLevel || "Fresher",
      });
  }, [user]);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/auth/profile", form);
      updateUser(data.user);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const changePassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/auth/change-password", password);
      setMessage(data.message || "Password changed.");
      setPassword({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="profile-page">
      <div className="page-intro">
        <div className="eyebrow">YOUR ACCOUNT</div>
        <h1>
          Profile & <span>settings.</span>
        </h1>
        <p>Keep your candidate details up to date for more relevant analysis.</p>
      </div>
      {message && (
        <div className="success-alert">
          <ShieldCheck size={17} />
          {message}
        </div>
      )}
      {error && <div className="form-error form-error-box">{error}</div>}
      <div className="profile-grid">
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <UserRound size={18} /> Personal details
              </h2>
              <p>Information used to personalize your preparation.</p>
            </div>
          </div>
          <form className="settings-form" onSubmit={save}>
            <div className="form-field">
              <label>Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                minLength={2}
                maxLength={60}
                required
              />
            </div>
            <div className="form-field">
              <label>Email address</label>
              <input value={user?.email || ""} disabled />
              <small className="field-hint">Email address cannot be changed here.</small>
            </div>
            <div className="form-field">
              <label>Professional headline</label>
              <input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                maxLength={120}
                placeholder="e.g. CSE student | Aspiring Full Stack Developer"
              />
            </div>
            <div className="form-field">
              <label>Target role</label>
              <input
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                maxLength={80}
                placeholder="e.g. Software Developer"
              />
            </div>
            <div className="form-field">
              <label>Experience level</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              >
                <option>Fresher</option>
                <option>0-2 years</option>
                <option>2-5 years</option>
                <option>5+ years</option>
              </select>
            </div>
            <button className="btn btn-primary" disabled={busy}>
              <Save size={16} /> Save changes
            </button>
          </form>
        </section>
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h2>
                <LockKeyhole size={18} /> Change password
              </h2>
              <p>Use a strong password you do not use elsewhere.</p>
            </div>
          </div>
          <form className="settings-form" onSubmit={changePassword}>
            <div className="form-field">
              <label>Current password</label>
              <input
                type="password"
                value={password.currentPassword}
                onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="form-field">
              <label>New password</label>
              <input
                type="password"
                value={password.newPassword}
                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                minLength={8}
                required
                autoComplete="new-password"
              />
              <small className="field-hint">
                At least 8 characters, with a letter and a number.
              </small>
            </div>
            <button className="btn btn-secondary" disabled={busy}>
              <LockKeyhole size={16} /> Update password
            </button>
          </form>
          <div className="security-note">
            <ShieldCheck size={18} />
            <div>
              <strong>Your account is protected</strong>
              <span>
                Passwords are securely hashed on the server. Your reports are private to your
                account.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
