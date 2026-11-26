import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Download,
  Sparkles,
  Upload,
  FileText,
  WandSparkles,
  Eye,
  LoaderCircle,
} from "lucide-react";
import api from "../api/client";
import "../styles/resume-builder.scss";
const blank = {
  title: "My Resume",
  template: "modern",
  source: "scratch",
  targetRole: "",
  jobDescription: "",
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  skills: { technical: [], soft: [] },
  aiNotes: [],
};
const sections = [
  ["education", "Education"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["certifications", "Certifications"],
];
function csv(v) {
  return (v || []).join(", ");
}
function parseCsv(v) {
  return v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function ItemEditor({ title, items, onChange }) {
  const add = () =>
    onChange([
      ...items,
      { title: "", subtitle: "", date: "", location: "", bullets: [""], link: "" },
    ]);
  const patch = (i, k, v) => onChange(items.map((x, n) => (n === i ? { ...x, [k]: v } : x)));
  return (
    <section className="rb-section">
      <div className="rb-section-head">
        <h3>{title}</h3>
        <button className="rb-small-btn" onClick={add}>
          <Plus size={14} /> Add
        </button>
      </div>
      {items.map((item, i) => (
        <div className="rb-item" key={i}>
          <div className="rb-item-head">
            <b>
              {title} {i + 1}
            </b>
            <button
              className="rb-icon-danger"
              onClick={() => onChange(items.filter((_, n) => n !== i))}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="rb-grid">
            <input
              placeholder="Title / degree / role"
              value={item.title || ""}
              onChange={(e) => patch(i, "title", e.target.value)}
            />
            <input
              placeholder="Company / college / tech stack"
              value={item.subtitle || ""}
              onChange={(e) => patch(i, "subtitle", e.target.value)}
            />
            <input
              placeholder="Date or duration"
              value={item.date || ""}
              onChange={(e) => patch(i, "date", e.target.value)}
            />
            <input
              placeholder="Location"
              value={item.location || ""}
              onChange={(e) => patch(i, "location", e.target.value)}
            />
          </div>
          <textarea
            placeholder="One bullet per line"
            rows={3}
            value={(item.bullets || []).join("\n")}
            onChange={(e) => patch(i, "bullets", e.target.value.split("\n"))}
          />
          <input
            placeholder="Project / certificate URL (optional)"
            value={item.link || ""}
            onChange={(e) => patch(i, "link", e.target.value)}
          />
        </div>
      ))}
    </section>
  );
}
export default function ResumeBuilder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(blank);
  const [id, setId] = useState(params.get("id") || "");
  const [saved, setSaved] = useState([]);
  const [mode, setMode] = useState("choose");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const set = (k, v) => setResume((r) => ({ ...r, [k]: v }));
  const setPersonal = (k, v) => setResume((r) => ({ ...r, personal: { ...r.personal, [k]: v } }));
  const refresh = async () => {
    try {
      const { data } = await api.get("/resumes");
      setSaved(data.data || []);
    } catch (e) {
      setMessage(e.message);
    }
  };
  useEffect(() => {
    refresh();
    if (id) {
      api
        .get(`/resumes/${id}`)
        .then(({ data }) => {
          setResume({
            ...blank,
            ...data.data,
            personal: { ...blank.personal, ...data.data.personal },
            skills: { ...blank.skills, ...data.data.skills },
          });
          setMode("edit");
        })
        .catch((e) => setMessage(e.message));
    }
  }, [id]);
  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      const { data } = id
        ? await api.put(`/resumes/${id}`, resume)
        : await api.post("/resumes", resume);
      setId(data.data._id);
      setResume(data.data);
      setMessage("Resume saved successfully.");
      await refresh();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const improve = async () => {
    if (!file) {
      setMessage("Please choose a PDF resume first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("targetRole", resume.targetRole);
      fd.append("jobDescription", resume.jobDescription);
      const { data } = await api.post("/resumes/improve", fd);
      setResume({
        ...blank,
        ...data.data,
        personal: { ...blank.personal, ...data.data.personal },
        skills: { ...blank.skills, ...data.data.skills },
      });
      setId("");
      setMode("edit");
      setMessage("AI improved draft generated. Review every detail, then save.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const tailor = async () => {
    if (!resume.jobDescription || resume.jobDescription.trim().length < 50) {
      setMessage("Paste a job description of at least 50 characters.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/resumes/tailor", {
        resume,
        jobDescription: resume.jobDescription,
      });
      setResume((r) => ({
        ...r,
        ...data.data,
        personal: { ...r.personal, ...data.data.personal },
        skills: { ...r.skills, ...data.data.skills },
        jobDescription: r.jobDescription,
        source: r.source,
      }));
      setMessage("Tailored draft ready. Verify all details before saving.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const del = async (rid) => {
    if (!confirm("Delete this saved resume?")) return;
    try {
      await api.delete(`/resumes/${rid}`);
      if (id === rid) {
        setId("");
        setResume(blank);
        setMode("choose");
      }
      await refresh();
    } catch (e) {
      setMessage(e.message);
    }
  };
  const download = () => window.print();
  const updateList = (key, val) => setResume((r) => ({ ...r, [key]: val }));
  return (
    <div className="resume-builder-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">CAREER TOOLKIT</span>
          <h1>
            AI Resume <span>Builder</span>
          </h1>
          <p>Create a new ATS-friendly resume or improve your existing one with AI.</p>
        </div>
        <Link className="btn btn-secondary" to="/app">
          <ArrowLeft size={15} /> Workspace
        </Link>
      </div>
      {message && <div className="rb-message">{message}</div>}
      {mode === "choose" && (
        <>
          <div className="rb-mode-grid">
            <button
              className="rb-mode-card"
              onClick={() => {
                setResume({ ...blank });
                setId("");
                setMode("scratch");
              }}
            >
              <span className="rb-mode-icon">
                <Plus />
              </span>
              <h2>Create from scratch</h2>
              <p>Build your resume section by section with a live ATS-friendly preview.</p>
              <strong>Start building →</strong>
            </button>
            <button className="rb-mode-card" onClick={() => setMode("improve")}>
              <span className="rb-mode-icon">
                <WandSparkles />
              </span>
              <h2>Improve existing resume</h2>
              <p>
                Upload your PDF and let AI improve wording while preserving your real experience.
              </p>
              <strong>Upload resume →</strong>
            </button>
          </div>
          <section className="rb-saved">
            <div className="rb-section-head">
              <h2>Saved resumes</h2>
              <button className="rb-small-btn" onClick={refresh}>
                Refresh
              </button>
            </div>
            {saved.length === 0 ? (
              <p className="rb-muted">No saved resumes yet. Create your first resume above.</p>
            ) : (
              saved.map((r) => (
                <div className="rb-saved-row" key={r._id}>
                  <div>
                    <b>{r.title}</b>
                    <small>
                      {r.targetRole || "No target role"} · Updated{" "}
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </small>
                  </div>
                  <button
                    className="rb-small-btn"
                    onClick={() => navigate(`/app/resume-builder?id=${r._id}`)}
                  >
                    Edit
                  </button>
                  <button className="rb-icon-danger" onClick={() => del(r._id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </section>
        </>
      )}
      {mode === "improve" && (
        <section className="rb-upload-card">
          <button className="rb-back" onClick={() => setMode("choose")}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2>Improve your existing resume</h2>
          <p>
            Upload a text-based PDF. AI will extract and rewrite the content; review the draft
            before saving.
          </p>
          <label className="rb-upload">
            <Upload />
            <strong>{file ? file.name : "Choose PDF resume"}</strong>
            <small>PDF only · Maximum 5 MB</small>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <label>
            Target job role
            <input
              value={resume.targetRole}
              onChange={(e) => set("targetRole", e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
          </label>
          <label>
            Job description (optional)
            <textarea
              rows={5}
              value={resume.jobDescription}
              onChange={(e) => set("jobDescription", e.target.value)}
              placeholder="Paste the job description to tailor the resume..."
            />
          </label>
          <button className="btn btn-primary" disabled={busy} onClick={improve}>
            {busy ? <LoaderCircle className="rb-spin" /> : <Sparkles size={16} />} Improve with AI
          </button>
        </section>
      )}
      {["scratch", "edit"].includes(mode) && (
        <>
          <div className="rb-toolbar">
            <button
              className="rb-back"
              onClick={() => {
                setMode("choose");
                refresh();
              }}
            >
              <ArrowLeft size={14} /> All resumes
            </button>
            <div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPreview((v) => !v)}
              >
                <Eye size={14} />
                {showPreview ? "Hide preview" : "Show preview"}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={tailor} disabled={busy}>
                <Sparkles size={14} /> Tailor to job
              </button>
              <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
                <Save size={14} /> {busy ? "Working..." : "Save resume"}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={download}>
                <Download size={14} /> PDF / Print
              </button>
            </div>
          </div>
          <div className={`rb-workspace ${showPreview ? "with-preview" : ""}`}>
            <div className="rb-editor">
              <section className="rb-section">
                <div className="rb-section-head">
                  <h3>Resume details</h3>
                  <span className="rb-tag">Modern ATS</span>
                </div>
                <label>
                  Resume title
                  <input
                    value={resume.title || ""}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </label>
                <label>
                  Target role
                  <input
                    value={resume.targetRole || ""}
                    onChange={(e) => set("targetRole", e.target.value)}
                    placeholder="Frontend Developer"
                  />
                </label>
                <label>
                  Job description for tailoring
                  <textarea
                    rows={4}
                    value={resume.jobDescription || ""}
                    onChange={(e) => set("jobDescription", e.target.value)}
                    placeholder="Paste job description (optional)"
                  />
                </label>
              </section>
              <section className="rb-section">
                <h3>Personal information</h3>
                <div className="rb-grid">
                  {[
                    ["name", "Full name"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["location", "Location"],
                    ["linkedin", "LinkedIn URL"],
                    ["github", "GitHub URL"],
                    ["portfolio", "Portfolio URL"],
                  ].map(([k, l]) => (
                    <label key={k}>
                      {l}
                      <input
                        value={resume.personal?.[k] || ""}
                        onChange={(e) => setPersonal(k, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </section>
              <section className="rb-section">
                <h3>Professional summary</h3>
                <textarea
                  rows={5}
                  value={resume.summary || ""}
                  onChange={(e) => set("summary", e.target.value)}
                  placeholder="Write a concise, factual professional summary..."
                />
              </section>
              {sections.map(([key, label]) => (
                <ItemEditor
                  key={key}
                  title={label}
                  items={resume[key] || []}
                  onChange={(v) => updateList(key, v)}
                />
              ))}
              <section className="rb-section">
                <h3>Skills</h3>
                <label>
                  Technical skills (comma separated)
                  <textarea
                    rows={2}
                    value={csv(resume.skills?.technical)}
                    onChange={(e) =>
                      setResume((r) => ({
                        ...r,
                        skills: { ...r.skills, technical: parseCsv(e.target.value) },
                      }))
                    }
                  />
                </label>
                <label>
                  Soft skills (comma separated)
                  <textarea
                    rows={2}
                    value={csv(resume.skills?.soft)}
                    onChange={(e) =>
                      setResume((r) => ({
                        ...r,
                        skills: { ...r.skills, soft: parseCsv(e.target.value) },
                      }))
                    }
                  />
                </label>
              </section>
              <section className="rb-section">
                <h3>Achievements</h3>
                <textarea
                  rows={3}
                  placeholder="One achievement per line"
                  value={(resume.achievements || []).join("\n")}
                  onChange={(e) => set("achievements", e.target.value.split("\n"))}
                />
              </section>
            </div>
            {showPreview && <ResumePreview resume={resume} />}
          </div>
        </>
      )}
    </div>
  );
}
function ResumePreview({ resume: r }) {
  const list = (items) =>
    (items || [])
      .filter((x) => x.title || x.subtitle)
      .map((x, i) => (
        <div className="rp-entry" key={i}>
          <div className="rp-entry-top">
            <b>{x.title}</b>
            <span>{x.date}</span>
          </div>
          <div className="rp-sub">{[x.subtitle, x.location].filter(Boolean).join(" · ")}</div>
          {(x.bullets || []).filter(Boolean).map((b, j) => (
            <p className="rp-bullet" key={j}>
              • {b}
            </p>
          ))}
          {x.link && <p className="rp-link">{x.link}</p>}
        </div>
      ));
  return (
    <article className="resume-paper" id="resume-paper">
      <header>
        <h1>{r.personal?.name || "Your Name"}</h1>
        <p>
          {[r.personal?.email, r.personal?.phone, r.personal?.location].filter(Boolean).join(" | ")}
        </p>
        <p>
          {[r.personal?.linkedin, r.personal?.github, r.personal?.portfolio]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </header>
      {r.summary && (
        <section>
          <h2>PROFESSIONAL SUMMARY</h2>
          <p>{r.summary}</p>
        </section>
      )}
      {r.skills?.technical?.length > 0 && (
        <section>
          <h2>TECHNICAL SKILLS</h2>
          <p>
            <b>Technical:</b> {csv(r.skills.technical)}
          </p>
          {r.skills.soft?.length > 0 && (
            <p>
              <b>Soft skills:</b> {csv(r.skills.soft)}
            </p>
          )}
        </section>
      )}
      {[
        ["EDUCATION", r.education],
        ["EXPERIENCE", r.experience],
        ["PROJECTS", r.projects],
        ["CERTIFICATIONS", r.certifications],
      ].map(([h, items]) =>
        (items || []).length > 0 ? (
          <section key={h}>
            <h2>{h}</h2>
            {list(items)}
          </section>
        ) : null,
      )}
      {r.achievements?.filter(Boolean).length > 0 && (
        <section>
          <h2>ACHIEVEMENTS</h2>
          {r.achievements.filter(Boolean).map((a, i) => (
            <p key={i}>• {a}</p>
          ))}
        </section>
      )}
    </article>
  );
}
