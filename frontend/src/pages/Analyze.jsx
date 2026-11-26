import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  BriefcaseBusiness,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";
import api from "../api/client";

export default function Analyze() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const choose = (f) => {
    if (!f) return;
    setError("");
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF resume only.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File size must be 5 MB or less.");
      return;
    }
    setFile(f);
  };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Please upload your resume PDF.");
      return;
    }
    if (jobDescription.trim().length < 100) {
      setError("Job description should contain at least 100 characters.");
      return;
    }
    const form = new FormData();
    form.append("resume", file);
    form.append("jobDescription", jobDescription.trim());
    form.append("jobRole", jobRole.trim());
    form.append("experience", experience);
    setBusy(true);
    try {
      const { data } = await api.post("/interviews/analyze", form);
      navigate(`/app/reports/${data.report._id}`, { state: { fresh: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="form-page">
      <div className="page-intro">
        <div className="eyebrow">AI-POWERED ROLE ANALYSIS</div>
        <h1>
          Build your interview <span>game plan.</span>
        </h1>
        <p>
          Share your resume and the job you want. AscendAI will turn both into a practical
          preparation report.
        </p>
      </div>
      <form onSubmit={submit} className="analysis-form">
        <div className="form-section">
          <div className="form-section-title">
            <span className="step-badge">01</span>
            <div>
              <h2>Upload your resume</h2>
              <p>Start with your latest resume in PDF format.</p>
            </div>
          </div>
          <div
            className={`dropzone ${drag ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              choose(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") inputRef.current?.click();
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              hidden
              onChange={(e) => choose(e.target.files?.[0])}
            />
            {file ? (
              <>
                <div className="uploaded-file-icon">
                  <FileText size={23} />
                </div>
                <div className="uploaded-file-info">
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze</span>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  aria-label="Remove file"
                >
                  <X size={17} />
                </button>
              </>
            ) : (
              <>
                <div className="upload-icon">
                  <UploadCloud size={25} />
                </div>
                <strong>
                  Drop your resume here, or <span>browse files</span>
                </strong>
                <small>PDF only · Maximum file size 5 MB</small>
              </>
            )}
          </div>
        </div>
        <div className="form-section">
          <div className="form-section-title">
            <span className="step-badge">02</span>
            <div>
              <h2>Tell us about the role</h2>
              <p>Add the job details so your analysis is relevant.</p>
            </div>
          </div>
          <div className="field-grid">
            <div className="form-field">
              <label>
                <BriefcaseBusiness size={15} /> Target job title <span>Optional</span>
              </label>
              <input
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                maxLength={100}
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div className="form-field">
              <label>
                <GraduationCap size={15} /> Experience level
              </label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option>Fresher</option>
                <option>0-2 years</option>
                <option>2-5 years</option>
                <option>5+ years</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>
              Job description <span className="required-label">Required</span>
            </label>
            <textarea
              rows="8"
              maxLength={12000}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here — responsibilities, required skills, qualifications and experience…"
            />
            <div className="textarea-meta">
              <span>Minimum 100 characters</span>
              <span className={jobDescription.length < 100 ? "count-low" : ""}>
                {jobDescription.length.toLocaleString("en-IN")} / 12,000
              </span>
            </div>
          </div>
        </div>
        {error && <div className="form-error form-error-box">{error}</div>}
        <div className="submit-row">
          <div className="privacy-note">
            <ShieldCheck size={17} />
            <span>
              Your resume is processed securely. Only a short preview is retained with your report.
            </span>
          </div>
          <button className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? (
              <>
                <LoaderCircle className="spin" size={18} /> Analyzing resume…
              </>
            ) : (
              <>
                Generate AI report <Sparkles size={17} />
              </>
            )}
          </button>
        </div>
        {busy && (
          <div className="processing-note">
            Groq AI is comparing your resume with the job description. This may take up to a minute
            — please keep this page open.
          </div>
        )}
      </form>
    </div>
  );
}
