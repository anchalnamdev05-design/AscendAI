import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  FileText,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  AlertCircle,
} from "lucide-react";
import api from "../api/client";
import { formatDate } from "../utils/format";

export default function Reports() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async (page = 1, search = query) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/interviews/reports", {
        params: { page, limit: 10, q: search },
      });
      setRows(data.reports);
      setPagination(data.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(1, "");
  }, []);
  const search = (e) => {
    e.preventDefault();
    setQuery(q);
    load(1, q);
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this report permanently?")) return;
    try {
      await api.delete(`/interviews/reports/${id}`);
      load(pagination.page, query);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <div className="reports-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">YOUR PREPARATION HISTORY</div>
          <h1>
            My <span>reports.</span>
          </h1>
          <p>Revisit your role analyses and track what you have learned.</p>
        </div>
        <Link className="btn btn-primary" to="/app/analyze">
          <Plus size={17} /> New analysis
        </Link>
      </div>
      <div className="panel reports-panel">
        <div className="reports-toolbar">
          <div>
            <h2>
              All analyses <span className="count-chip">{pagination.total}</span>
            </h2>
            <p>Reports generated from your resume and target roles.</p>
          </div>
          <form className="search-box" onSubmit={search}>
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search role or resume…"
            />
            <button>Search</button>
          </form>
        </div>
        {error && (
          <div className="inline-alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {loading ? (
          <div className="loading-lines">
            <i />
            <i />
            <i />
            <i />
          </div>
        ) : rows.length ? (
          <>
            <div className="table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>ROLE / RESUME</th>
                    <th>MATCH SCORE</th>
                    <th>DATE CREATED</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div className="table-file">
                          <span>
                            <FileText size={18} />
                          </span>
                          <div>
                            <strong>{r.jobRole || "Role analysis"}</strong>
                            <small>{r.resumeFileName || "Resume"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`score-chip ${r.matchScore >= 75 ? "score-good" : r.matchScore >= 50 ? "score-mid" : "score-low"}`}
                        >
                          {r.matchScore}%
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(r.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/app/reports/${r._id}`}
                            className="icon-btn"
                            title="View report"
                          >
                            <ArrowUpRight size={17} />
                          </Link>
                          <button
                            className="icon-btn danger-hover"
                            onClick={() => remove(r._id)}
                            title="Delete report"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                Showing {rows.length} of {pagination.total} reports
              </span>
              <div>
                <button
                  className="icon-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => load(pagination.page - 1)}
                >
                  <ChevronLeft size={17} />
                </button>
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="icon-btn"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => load(pagination.page + 1)}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={23} />
            </div>
            <h3>{query ? "No matching reports" : "No reports yet"}</h3>
            <p>
              {query
                ? "Try a different search term."
                : "Your generated interview preparation reports will appear here."}
            </p>
            <Link className="btn btn-primary btn-sm" to="/app/analyze">
              Create an analysis <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
