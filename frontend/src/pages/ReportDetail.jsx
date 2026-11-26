import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Target,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  MessageCircle,
  Route,
  Sparkles,
  CalendarDays,
  FileText,
  LoaderCircle,
} from "lucide-react";
import api from "../api/client";
import { formatDate } from "../utils/format";

function ListBlock({ title, items, icon: Icon, tone = "default" }) {
  return (
    <section className="panel report-content-card">
      <div className="content-card-heading">
        <span className={`content-icon ${tone}`}>
          <Icon size={18} />
        </span>
        <h3>{title}</h3>
        <span className="item-count">{items?.length || 0}</span>
      </div>
      {items?.length ? (
        <ul className="bullet-list">
          {items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      ) : (
        <p className="muted-text">No items provided in this report.</p>
      )}
    </section>
  );
}
export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api
      .get(`/interviews/reports/${id}`)
      .then(({ data }) => {
        if (active) setReport(data.report);
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
  }, [id]);
  const exportReport = () => {
    if (!report) return;
    const text = [
      `ASCENDAI INTERVIEW PREPARATION REPORT`,
      `Role: ${report.jobRole || "Not specified"}`,
      `Match score: ${report.matchScore}%`,
      `Created: ${formatDate(report.createdAt)}`,
      "",
      `SUMMARY\n${report.profileSummary || ""}`,
      "",
      `STRENGTHS\n${(report.strengths || []).map((x) => "- " + x).join("\n")}`,
      "",
      `WEAKNESSES\n${(report.weaknesses || []).map((x) => "- " + x).join("\n")}`,
      "",
      `MATCHED SKILLS\n${(report.matchedSkills || []).join(", ")}`,
      "",
      `MISSING SKILLS\n${(report.missingSkills || []).join(", ")}`,
      "",
      `TECHNICAL QUESTIONS\n${(report.technicalQuestions || []).map((q, i) => `${i + 1}. ${q.question}\n${q.answerGuideline || ""}`).join("\n\n")}`,
      "",
      `BEHAVIOURAL QUESTIONS\n${(report.behavioralQuestions || []).map((q, i) => `${i + 1}. ${q.question}\n${q.answerGuideline || ""}`).join("\n\n")}`,
      "",
      `PREPARATION ROADMAP\n${(report.preparationRoadmap || []).map((d) => `Day ${d.day}: ${d.title}\nTopics: ${(d.topics || []).join(", ")}\nExercises: ${(d.exercises || []).join(", ")}`).join("\n\n")}`,
      "",
      `RECOMMENDATIONS\n${(report.recommendations || []).map((x) => "- " + x).join("\n")}`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ascendai-report-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (loading)
    return (
      <div className="screen-loader">
        <LoaderCircle className="spin" />
        <span>Loading your report…</span>
      </div>
    );
  if (error || !report)
    return (
      <div className="empty-state panel">
        <AlertTriangle size={28} />
        <h3>Report unavailable</h3>
        <p>{error || "This report could not be found."}</p>
        <Link to="/app/reports" className="btn btn-primary btn-sm">
          Back to reports
        </Link>
      </div>
    );
  return (
    <div className="report-detail-page">
      <div className="detail-back-row">
        <Link to="/app/reports" className="back-link">
          <ArrowLeft size={16} /> All reports
        </Link>
        <button className="btn btn-secondary btn-sm" onClick={exportReport}>
          <Download size={16} /> Export report
        </button>
      </div>
      <div className="report-hero panel">
        <div className="report-hero-copy">
          <div className="eyebrow">AI INTERVIEW READINESS REPORT</div>
          <h1>{report.jobRole || "Your role analysis"}</h1>
          <p>
            <FileText size={15} /> {report.resumeFileName || "Resume"} <span>·</span>{" "}
            <CalendarDays size={15} /> {formatDate(report.createdAt)}
          </p>
          <div className="readiness-pill">
            <Sparkles size={14} />
            {report.readiness?.level || "Personalized insights"}
          </div>
        </div>
        <div className="detail-score">
          <div className="score-ring-large" style={{ "--score": `${report.matchScore}%` }}>
            <div>
              <strong>{report.matchScore}</strong>
              <small>/100</small>
            </div>
          </div>
          <span>RESUME MATCH</span>
        </div>
      </div>
      <section className="panel summary-panel">
        <div className="content-card-heading">
          <span className="content-icon purple">
            <BrainCircuit size={18} />
          </span>
          <h3>Candidate overview</h3>
        </div>
        <p>{report.profileSummary}</p>
        {report.jobCompatibility && (
          <div className="compatibility-note">
            <strong>Role compatibility</strong>
            <span>{report.jobCompatibility}</span>
          </div>
        )}
      </section>
      {report.relevantExperience?.length > 0 && (
        <ListBlock
          title="Relevant experience"
          items={report.relevantExperience}
          icon={FileText}
          tone="blue"
        />
      )}
      <div className="two-col-report">
        <ListBlock
          title="Your strengths"
          items={report.strengths}
          icon={CheckCircle2}
          tone="green"
        />
        <ListBlock
          title="Areas to improve"
          items={report.weaknesses}
          icon={AlertTriangle}
          tone="amber"
        />
      </div>
      {report.jobInsights && (
        <section className="panel report-content-card">
          <div className="content-card-heading">
            <span className="content-icon blue">
              <Target size={18} />
            </span>
            <h3>What the job is looking for</h3>
          </div>
          {report.jobInsights.experienceRequired && (
            <p className="job-exp-note">
              <strong>Experience:</strong> {report.jobInsights.experienceRequired}
            </p>
          )}
          <div className="two-col-report job-insights-grid">
            <ListBlock
              title="Required skills"
              items={report.jobInsights.requiredSkills}
              icon={Target}
              tone="blue"
            />
            <ListBlock
              title="Preferred technologies"
              items={report.jobInsights.preferredTechnologies}
              icon={Sparkles}
              tone="purple"
            />
          </div>
          <div className="two-col-report job-insights-grid">
            <ListBlock
              title="Qualifications"
              items={report.jobInsights.qualifications}
              icon={FileText}
              tone="blue"
            />
            <ListBlock
              title="Responsibilities"
              items={report.jobInsights.responsibilities}
              icon={Route}
              tone="purple"
            />
          </div>
        </section>
      )}
      <div className="two-col-report">
        <ListBlock title="Matched skills" items={report.matchedSkills} icon={Target} tone="green" />
        <ListBlock
          title="Skill gaps"
          items={report.missingSkills}
          icon={AlertTriangle}
          tone="amber"
        />
      </div>
      {report.missingInformation?.length > 0 && (
        <ListBlock
          title="Information to add or clarify"
          items={report.missingInformation}
          icon={FileText}
          tone="blue"
        />
      )}
      <section className="panel report-content-card">
        <div className="content-card-heading">
          <span className="content-icon purple">
            <BrainCircuit size={18} />
          </span>
          <h3>Technical interview questions</h3>
          <span className="item-count">{report.technicalQuestions?.length || 0}</span>
        </div>
        <div className="question-list">
          {(report.technicalQuestions || []).map((q, i) => (
            <details className="question-item" key={i}>
              <summary>
                <span className="question-number">{String(i + 1).padStart(2, "0")}</span>
                <span className="question-text">
                  {q.question}
                  <small>
                    {q.category || "Technical"} · {q.difficulty || "Intermediate"}
                  </small>
                </span>
                <span className="difficulty-tag">{q.difficulty}</span>
              </summary>
              <div className="answer-guideline">
                <strong>Answer direction</strong>
                <p>{q.answerGuideline || "Prepare a concise answer with an example."}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
      <section className="panel report-content-card">
        <div className="content-card-heading">
          <span className="content-icon blue">
            <MessageCircle size={18} />
          </span>
          <h3>HR & behavioural questions</h3>
          <span className="item-count">{report.behavioralQuestions?.length || 0}</span>
        </div>
        <div className="question-list">
          {(report.behavioralQuestions || []).map((q, i) => (
            <details className="question-item" key={i}>
              <summary>
                <span className="question-number">{String(i + 1).padStart(2, "0")}</span>
                <span className="question-text">
                  {q.question}
                  <small>{q.type || "HR"}</small>
                </span>
                <span className="difficulty-tag">Practice</span>
              </summary>
              <div className="answer-guideline">
                <strong>Answer direction</strong>
                <p>
                  {q.answerGuideline || "Use the STAR method: Situation, Task, Action and Result."}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>
      <section className="panel report-content-card">
        <div className="content-card-heading">
          <span className="content-icon purple">
            <Route size={18} />
          </span>
          <h3>Your 7-day preparation roadmap</h3>
        </div>
        <div className="roadmap-list">
          {(report.preparationRoadmap || []).map((day, i) => (
            <div className="roadmap-day" key={i}>
              <div className="day-marker">D{day.day}</div>
              <div className="day-content">
                <div className="day-title-row">
                  <h4>{day.title}</h4>
                  <span className={`priority priority-${(day.priority || "medium").toLowerCase()}`}>
                    {day.priority || "Medium"} priority
                  </span>
                </div>
                <div className="roadmap-columns">
                  <div>
                    <strong>Topics</strong>
                    <ul>
                      {(day.topics || []).map((x, j) => (
                        <li key={j}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Practice</strong>
                    <ul>
                      {(day.exercises || []).map((x, j) => (
                        <li key={j}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <ListBlock
        title="Recommended next steps"
        items={report.recommendations}
        icon={Sparkles}
        tone="purple"
      />
    </div>
  );
}
