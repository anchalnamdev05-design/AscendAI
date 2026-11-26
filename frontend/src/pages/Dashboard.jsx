import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  FilePlus2,
  Files,
  Target,
  Trophy,
  Sparkles,
  ChevronRight,
  Clock3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

function StatCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api
      .get("/interviews/stats")
      .then(({ data }) => {
        if (active) setStats(data.stats);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const recent = stats?.recentReports || [];
  return (
    <div className="dashboard-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">YOUR PREPARATION SPACE</div>
          <h1>
            Good to see you, {user?.name?.split(" ")[0] || "there"} <span className="wave">✦</span>
          </h1>
          <p>Small, focused steps bring you closer to your next opportunity.</p>
        </div>
        <Link className="btn btn-primary" to="/app/analyze">
          <FilePlus2 size={17} /> New analysis
        </Link>
      </div>
      {error && (
        <div className="inline-alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
      <div className="stats-grid">
        <StatCard
          icon={Files}
          label="Reports generated"
          value={loading ? "—" : (stats?.totalReports ?? 0)}
          detail="Your analysis history"
          tone="purple"
        />
        <StatCard
          icon={Target}
          label="Average match score"
          value={loading ? "—" : `${stats?.averageScore ?? 0}%`}
          detail="Across your reports"
          tone="blue"
        />
        <StatCard
          icon={Trophy}
          label="Personal best"
          value={loading ? "—" : `${stats?.bestScore ?? 0}%`}
          detail="Your highest role match"
          tone="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Score movement"
          value={
            loading
              ? "—"
              : `${(stats?.scoreImprovement ?? 0) > 0 ? "+" : ""}${stats?.scoreImprovement ?? 0}`
          }
          detail="First to latest report"
          tone="green"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent analyses</h2>
              <p>Your latest resume-to-role reports</p>
            </div>
            <Link to="/app/reports" className="subtle-link">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          {loading ? (
            <div className="loading-lines">
              <i />
              <i />
              <i />
            </div>
          ) : recent.length ? (
            <div className="report-list">
              {recent.map((r) => (
                <Link to={`/app/reports/${r._id}`} className="report-row" key={r._id}>
                  <div className="report-file-icon">
                    <Files size={18} />
                  </div>
                  <div className="report-main">
                    <strong>{r.jobRole || "Role analysis"}</strong>
                    <span>
                      {r.resumeFileName || "Resume"} · {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <div className="mini-score">{r.matchScore}%</div>
                  <ChevronRight size={17} className="row-chevron" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FilePlus2 size={23} />
              </div>
              <h3>Your first report starts here</h3>
              <p>
                Upload a resume and add a target job description to get your personalized analysis.
              </p>
              <Link className="btn btn-primary btn-sm" to="/app/analyze">
                Create first report <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </section>
        <aside className="panel quick-panel">
          <div className="quick-glow" />
          <div className="quick-icon">
            <Sparkles size={21} />
          </div>
          <span className="eyebrow">YOUR NEXT STEP</span>
          <h2>Turn your resume into a plan.</h2>
          <p>
            Get a realistic match score, discover skill gaps and practice the questions that matter
            for your target role.
          </p>
          <ul>
            <li>
              <span>01</span> Upload your PDF resume
            </li>
            <li>
              <span>02</span> Paste the job description
            </li>
            <li>
              <span>03</span> Review your AI report
            </li>
          </ul>
          <Link className="btn btn-primary btn-full" to="/app/analyze">
            Start an analysis <ArrowUpRight size={17} />
          </Link>
        </aside>
      </div>
      <div className="dashboard-footnote">
        <Clock3 size={15} /> Your reports are saved privately to your account and can be revisited
        anytime.
      </div>
    </div>
  );
}
