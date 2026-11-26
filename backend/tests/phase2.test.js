// Run: npm test  (in-memory MongoDB + mock Groq server, real key ki zaroorat nahi)
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = "test_secret_long_enough_123";
process.env.GROQ_API_KEY = "test-key";
process.env.CLIENT_URL = "http://localhost:5173";

let mongod,
  groq,
  server,
  base,
  groqMode = "ok";

const goodReport = {
  matchScore: 72,
  profileSummary: "Fresher full stack dev.",
  jobCompatibility: "Good fit.",
  relevantExperience: ["3 month internship"],
  missingInformation: ["No cloud experience listed"],
  strengths: ["MERN"],
  weaknesses: ["No Docker"],
  matchedSkills: ["React", "Node.js"],
  missingSkills: ["Docker"],
  jobInsights: {
    requiredSkills: ["React"],
    preferredTechnologies: ["Docker"],
    qualifications: ["B.Tech"],
    experienceRequired: "0-2 years",
    responsibilities: ["Build APIs"],
  },
  technicalQuestions: [
    {
      question: "What is the virtual DOM?",
      difficulty: "Beginner",
      category: "Role-specific",
      answerGuideline: "Explain diffing",
    },
  ],
  behavioralQuestions: [
    { question: "Tell me about yourself", type: "HR", answerGuideline: "STAR" },
  ],
  preparationRoadmap: [
    {
      day: 1,
      title: "Docker basics",
      topics: ["Images"],
      exercises: ["Dockerize app"],
      priority: "High",
    },
  ],
  recommendations: ["Learn Docker"],
  readiness: { level: "Almost Ready", summary: "Close." },
};

before(async () => {
  if (process.env.TEST_MONGO_URI) {
    process.env.MONGO_URI = process.env.TEST_MONGO_URI; // optional: kisi bhi MongoDB pe test
  } else {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri("ascendai_test");
  }
  groq = http.createServer((req, res) => {
    req.resume();
    req.on("end", () => {
      if (groqMode === "429") {
        res.writeHead(429, { "content-type": "application/json" });
        return res.end('{"error":{"message":"rate"}}');
      }
      if (groqMode === "401") {
        res.writeHead(401, { "content-type": "application/json" });
        return res.end('{"error":{"message":"bad key"}}');
      }
      const content =
        groqMode === "badjson"
          ? "not json at all"
          : groqMode === "badschema"
            ? '{"matchScore":"x"}'
            : JSON.stringify(goodReport);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          id: "x",
          object: "chat.completion",
          choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
        }),
      );
    });
  });
  await new Promise((r) => groq.listen(0, r));
  process.env.GROQ_BASE_URL = `http://127.0.0.1:${groq.address().port}`;
  const { default: app } = await import("../src/app.js");
  await mongoose.connect(process.env.MONGO_URI);
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  server?.close();
  groq?.close();
  await mongoose.disconnect();
  await mongod?.stop();
});

const call = async (path, { method = "GET", token, json, form } = {}) => {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  let body;
  if (json) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (form) body = form;
  const res = await fetch(base + path, { method, headers, body });
  return { status: res.status, body: await res.json() };
};

const JD =
  "We are hiring a Full Stack Developer with React, Node.js, MongoDB and Docker experience. ".repeat(
    2,
  );
const analyzeForm = (file, extra = {}) => {
  const f = new FormData();
  f.append("resume", file.blob, file.name);
  f.append("jobDescription", extra.jd ?? JD);
  f.append("jobRole", "Full Stack Developer");
  return f;
};
const pdfFile = () => ({
  blob: new Blob([fs.readFileSync(new URL("./fixtures/resume.pdf", import.meta.url))], {
    type: "application/pdf",
  }),
  name: "resume.pdf",
});

let tokenA, tokenB, reportId;

test("health", async () => assert.equal((await call("/health")).status, 200));

test("register validation + success + duplicate", async () => {
  assert.equal(
    (
      await call("/auth/register", {
        method: "POST",
        json: { name: "A", email: "bad", password: "123" },
      })
    ).status,
    400,
  );
  const r = await call("/auth/register", {
    method: "POST",
    json: { name: "Anchal", email: "A@test.com", password: "Passw0rdOK" },
  });
  assert.equal(r.status, 201);
  assert.ok(r.body.token);
  assert.equal(r.body.user.password, undefined);
  tokenA = r.body.token;
  assert.equal(
    (
      await call("/auth/register", {
        method: "POST",
        json: { name: "Anchal", email: "a@test.com", password: "Passw0rdOK" },
      })
    ).status,
    409,
  );
  const b = await call("/auth/register", {
    method: "POST",
    json: { name: "Bob", email: "b@test.com", password: "Passw0rdOK" },
  });
  tokenB = b.body.token;
});

test("login ok / wrong password / NoSQL injection blocked", async () => {
  assert.equal(
    (
      await call("/auth/login", {
        method: "POST",
        json: { email: "a@test.com", password: "Passw0rdOK" },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call("/auth/login", {
        method: "POST",
        json: { email: "a@test.com", password: "wrongpass1" },
      })
    ).status,
    401,
  );
  assert.equal(
    (await call("/auth/login", { method: "POST", json: { email: { $gt: "" }, password: "x" } }))
      .status,
    400,
  );
});

test("JWT protection + profile", async () => {
  assert.equal((await call("/auth/profile")).status, 401);
  assert.equal((await call("/auth/profile", { token: "garbage" })).status, 401);
  assert.equal((await call("/auth/profile", { token: tokenA })).body.user.email, "a@test.com");
  const u = await call("/auth/profile", {
    method: "PUT",
    token: tokenA,
    json: { name: "Anchal N", targetRole: "MERN Dev", email: "hack@x.com" },
  });
  assert.equal(u.body.user.name, "Anchal N");
  assert.equal(u.body.user.email, "a@test.com");
});

test("change password", async () => {
  assert.equal(
    (
      await call("/auth/change-password", {
        method: "PUT",
        token: tokenA,
        json: { currentPassword: "nope", newPassword: "NewPass123" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("/auth/change-password", {
        method: "PUT",
        token: tokenA,
        json: { currentPassword: "Passw0rdOK", newPassword: "NewPass123" },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call("/auth/login", {
        method: "POST",
        json: { email: "a@test.com", password: "NewPass123" },
      })
    ).status,
    200,
  );
});

test("analyze: auth, missing file, non-PDF, fake PDF, short JD", async () => {
  assert.equal((await call("/interviews/analyze", { method: "POST" })).status, 401);
  const noFile = new FormData();
  noFile.append("jobDescription", JD);
  assert.equal(
    (await call("/interviews/analyze", { method: "POST", token: tokenA, form: noFile })).status,
    400,
  );
  const txt = { blob: new Blob(["hello"], { type: "text/plain" }), name: "a.txt" };
  assert.equal(
    (await call("/interviews/analyze", { method: "POST", token: tokenA, form: analyzeForm(txt) }))
      .status,
    400,
  );
  const fake = {
    blob: new Blob(["this is not a pdf at all, just text"], { type: "application/pdf" }),
    name: "fake.pdf",
  };
  assert.equal(
    (await call("/interviews/analyze", { method: "POST", token: tokenA, form: analyzeForm(fake) }))
      .status,
    400,
  );
  assert.equal(
    (
      await call("/interviews/analyze", {
        method: "POST",
        token: tokenA,
        form: analyzeForm(pdfFile(), { jd: "short" }),
      })
    ).status,
    400,
  );
  const big = {
    blob: new Blob([Buffer.alloc(6 * 1024 * 1024, 1)], { type: "application/pdf" }),
    name: "big.pdf",
  };
  assert.equal(
    (await call("/interviews/analyze", { method: "POST", token: tokenA, form: analyzeForm(big) }))
      .status,
    400,
  );
});

test("analyze success stores validated report", async () => {
  const r = await call("/interviews/analyze", {
    method: "POST",
    token: tokenA,
    form: analyzeForm(pdfFile()),
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.report.matchScore, 72);
  assert.equal(r.body.report.userId.length, 24);
  assert.ok(r.body.report.resumeTextPreview.includes("Anchal"));
  reportId = r.body.report._id;
});

test("Groq failure modes", async () => {
  for (const [mode, status] of [
    ["429", 429],
    ["401", 503],
    ["badjson", 502],
    ["badschema", 502],
  ]) {
    groqMode = mode;
    const r = await call("/interviews/analyze", {
      method: "POST",
      token: tokenA,
      form: analyzeForm(pdfFile()),
    });
    assert.equal(r.status, status, `${mode}: ${JSON.stringify(r.body)}`);
  }
  groqMode = "ok";
  const prev = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "your_groq_api_key_here";
  const { default: _ } = await import("../src/services/groqService.js");
  process.env.GROQ_API_KEY = prev;
});

test("reports: list, search, get, stats, authorization, delete", async () => {
  const l = await call("/interviews/reports", { token: tokenA });
  assert.equal(l.body.reports.length, 1);
  assert.equal(l.body.reports[0].technicalQuestions, undefined);
  assert.equal(
    (await call("/interviews/reports?q=full", { token: tokenA })).body.reports.length,
    1,
  );
  assert.equal(
    (await call("/interviews/reports?q=zzzz", { token: tokenA })).body.reports.length,
    0,
  );
  assert.equal(
    (await call(`/interviews/reports/${reportId}`, { token: tokenA })).body.report
      .technicalQuestions.length,
    1,
  );
  // user B dusre ki report nahi dekh sakta / delete nahi kar sakta
  assert.equal((await call(`/interviews/reports/${reportId}`, { token: tokenB })).status, 404);
  assert.equal(
    (await call(`/interviews/reports/${reportId}`, { method: "DELETE", token: tokenB })).status,
    404,
  );
  assert.equal((await call("/interviews/reports", { token: tokenB })).body.reports.length, 0);
  assert.equal((await call("/interviews/reports/notanid", { token: tokenA })).status, 400);
  const s = (await call("/interviews/stats", { token: tokenA })).body.stats;
  assert.equal(s.totalReports, 1);
  assert.equal(s.averageScore, 72);
  assert.equal(s.topMissingSkills[0].name, "Docker");
  assert.equal(
    (await call(`/interviews/reports/${reportId}`, { method: "DELETE", token: tokenA })).status,
    200,
  );
  assert.equal((await call(`/interviews/reports/${reportId}`, { token: tokenA })).status, 404);
  assert.equal((await call("/interviews/stats", { token: tokenB })).body.stats.totalReports, 0);
});
