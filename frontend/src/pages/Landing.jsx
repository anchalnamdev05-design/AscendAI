import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  FileSearch,
  Target,
  BrainCircuit,
  Route,
  ShieldCheck,
  Check,
  ChevronRight,
  BriefcaseBusiness,
  FileText,
  ChartNoAxesCombined,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    n: "01",
    icon: FileSearch,
    title: "A clearer role match",
    text: "See how your current experience lines up with the job you actually want.",
  },
  {
    n: "02",
    icon: Target,
    title: "Specific skill gaps",
    text: "Understand which requirements you already meet and what needs work.",
  },
  {
    n: "03",
    icon: BrainCircuit,
    title: "Questions worth preparing",
    text: "Get technical and behavioural questions shaped around your target role.",
  },
  {
    n: "04",
    icon: Route,
    title: "A practical next step",
    text: "Use a focused seven-day roadmap instead of another generic checklist.",
  },
];

export default function Landing() {
  const { user } = useAuth();
  const startLink = user ? "/app/analyze" : "/register";
  return (
    <div className="landing human-landing" id="top">
      <nav className="human-nav">
        <div className="human-nav-inner">
          <Logo />
          <div className="human-nav-links">
            <a href="#what-you-get">What you get</a>
            <a href="#method">Our approach</a>
          </div>
          <div className="human-nav-actions">
            {user ? (
              <Link className="human-login" to="/app">
                Workspace <ArrowUpRight size={16} />
              </Link>
            ) : (
              <>
                <Link className="human-login" to="/login">
                  Log in
                </Link>
                <Link className="human-nav-cta" to="/register">
                  Create account <ArrowUpRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="human-hero">
          <div className="human-hero-top">
            <span className="human-overline">
              <i /> A CAREER TOOL FOR THE NEXT STEP
            </span>
            <span className="hero-index">INDEPENDENT CAREER PREPARATION / 2026</span>
          </div>
          <div className="human-headline-grid">
            <h1>
              Make your next
              <br />
              <em>move with</em> evidence.
            </h1>
            <div className="human-hero-aside">
              <p>
                Good preparation starts with an honest view of where you stand. AscendAI connects
                your resume to a real job description and turns the comparison into a plan you can
                use.
              </p>
              <Link to={startLink} className="human-primary">
                Review my resume <ArrowUpRight size={18} />
              </Link>
              <span className="human-note">
                <ShieldCheck size={15} /> Your resume. Your target role. A more useful next step.
              </span>
            </div>
          </div>
          <div className="human-product-stage">
            <div className="stage-rail">
              <span>01</span>
              <span>ROLE REVIEW</span>
              <span className="rail-line" />
              <span>EXAMPLE REPORT</span>
            </div>
            <div className="stage-main">
              <div className="stage-title">
                <div>
                  <span className="stage-eyebrow">ASCENDAI / CANDIDATE REPORT</span>
                  <h2>Frontend Developer</h2>
                  <p>Resume compared against a sample job description</p>
                </div>
                <span className="reviewed">
                  <i /> SAMPLE REVIEW
                </span>
              </div>
              <div className="stage-data">
                <div className="stage-score">
                  <span className="stage-label">ROLE ALIGNMENT</span>
                  <div className="score-number">
                    76<span>/100</span>
                  </div>
                  <div className="score-track">
                    <i />
                  </div>
                  <p>A promising foundation, with a few role-specific areas to strengthen.</p>
                </div>
                <div className="stage-skills">
                  <span className="stage-label">SKILL EVIDENCE</span>
                  <div className="evidence-row">
                    <span>React</span>
                    <b>Strong</b>
                    <i className="ev-strong" />
                  </div>
                  <div className="evidence-row">
                    <span>JavaScript</span>
                    <b>Good</b>
                    <i className="ev-good" />
                  </div>
                  <div className="evidence-row">
                    <span>Testing</span>
                    <b>Develop</b>
                    <i className="ev-gap" />
                  </div>
                  <div className="evidence-foot">Illustrative data for layout preview</div>
                </div>
                <div className="stage-next">
                  <span className="stage-label">WHAT COMES NEXT</span>
                  <div className="next-line">
                    <span className="next-icon">
                      <FileText size={18} />
                    </span>
                    <div>
                      <b>Skill gap summary</b>
                      <small>What the role expects</small>
                    </div>
                    <Check size={16} />
                  </div>
                  <div className="next-line">
                    <span className="next-icon">
                      <BrainCircuit size={18} />
                    </span>
                    <div>
                      <b>Interview preparation</b>
                      <small>Role-specific questions</small>
                    </div>
                    <Check size={16} />
                  </div>
                  <div className="next-line">
                    <span className="next-icon">
                      <Route size={18} />
                    </span>
                    <div>
                      <b>7-day preparation plan</b>
                      <small>Prioritised actions</small>
                    </div>
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            </div>
            <div className="stage-side-note">
              <span>THE OUTPUT</span>
              <strong>Not just a score.</strong>
              <p>
                A structured report that explains the score and helps you decide what to work on
                next.
              </p>
            </div>
          </div>
        </section>

        <section className="human-proof-strip">
          <div>
            <strong>BUILT FOR</strong>
            <span>Students</span>
            <span>Graduates</span>
            <span>Early-career professionals</span>
          </div>
          <p>One focused workflow, from resume review to interview preparation.</p>
        </section>

        <section className="human-features" id="what-you-get">
          <div className="human-section-head">
            <div>
              <span className="human-overline">
                <i /> WHAT YOU GET
              </span>
              <h2>
                Useful detail.
                <br />
                <em>Clear direction.</em>
              </h2>
            </div>
            <p>
              Every output is connected to the role you are targeting. No inflated promises, no
              one-size-fits-all advice.
            </p>
          </div>
          <div className="human-feature-list">
            {features.map(({ n, icon: Icon, title, text }) => (
              <article className="human-feature" key={n}>
                <span className="feature-n">{n}</span>
                <span className="human-feature-icon">
                  <Icon size={20} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <ArrowUpRight className="feature-arrow" size={18} />
              </article>
            ))}
          </div>
        </section>

        <section className="human-method" id="method">
          <div className="method-left">
            <span className="human-overline">
              <i /> A SIMPLE PROCESS
            </span>
            <h2>
              Bring the role.
              <br />
              <em>Get a plan.</em>
            </h2>
            <p>
              Start with the documents you already have. AscendAI does the comparison and organises
              the findings so you can focus your preparation.
            </p>
            <Link to={startLink} className="human-method-link">
              Start your first review <ArrowRight size={17} />
            </Link>
          </div>
          <div className="method-steps">
            <article>
              <span>01</span>
              <div>
                <h3>Upload your resume</h3>
                <p>Share your current resume as a PDF.</p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Add the job description</h3>
                <p>Give the analysis a specific role to compare against.</p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Work through your report</h3>
                <p>Review your fit, skill gaps, questions and preparation roadmap.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="human-bottom-cta">
          <div>
            <span className="human-overline">
              <i /> START WITH ONE ROLE
            </span>
            <h2>
              Make your preparation
              <br />
              more intentional.
            </h2>
          </div>
          <Link to={startLink} className="human-primary">
            Review my resume <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="human-footer">
        <Logo />
        <span>© {new Date().getFullYear()} AscendAI</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}
