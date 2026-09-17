"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Grid2X2,
  Award,
  Files,
  QrCode,
  Cable,
  ShieldCheck,
  Search,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Building2,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Upload,
  ExternalLink,
  Copy,
  KeyRound,
  Trash2,
  Pencil,
  Printer,
  Check,
  Ban,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Workspace, Employee, Qualification } from "@/lib/domain";
import { dateLabel, csvCell } from "@/lib/domain";
import { Avatar, Badge, Empty, Modal } from "./ui";

const navigation: { section: string; items: [string, string, LucideIcon][] }[] =
  [
    {
      section: "WORKSPACE",
      items: [
        ["", "Overview", LayoutDashboard],
        ["employees", "Employees", Users],
        ["matrix", "Skills matrix", Grid2X2],
        ["competencies", "Competencies", Award],
        ["documents", "Documents", Files],
      ],
    },
    {
      section: "TOOLS",
      items: [
        ["passports", "QR passports", QrCode],
        ["reports", "Excel connection", Cable],
      ],
    },
  ];
type DialogState =
  | { type: "employee"; employee?: Employee }
  | { type: "qualification"; employee: Employee }
  | { type: "competency" }
  | { type: "upload"; employee: Employee; qualification?: Qualification }
  | {
      type: "confirm";
      title: string;
      description: string;
      path: string;
      body: unknown;
    }
  | null;
export async function api(path: string, method = "GET", body?: unknown) {
  const response = await fetch("/api/" + path, {
    method,
    headers:
      body instanceof FormData
        ? undefined
        : body
          ? { "Content-Type": "application/json" }
          : undefined,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Unable to complete the request.");
  return result;
}
export function WorkspaceApp() {
  const pathname = usePathname();
  const router = useRouter();
  const view = pathname.split("/")[2] || "";
  const employeeId = pathname.split("/")[3];
  const [data, setData] = useState<Workspace | null>(null),
    [companyId, setCompanyId] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [dialog, setDialog] = useState<DialogState>(null),
    [notice, setNotice] = useState(""),
    [dark, setDark] = useState(true),
    [menu, setMenu] = useState(false),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [page, setPage] = useState(1),
    [newToken, setNewToken] = useState("");
  const loadVersion = useRef(0);
  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setError("");
    try {
      const stored = companyId || localStorage.getItem("skills-company") || "";
      let result;
      try {
        result = await api("workspace" + (stored ? "?company=" + stored : ""));
      } catch (error) {
        if (
          !companyId &&
          stored &&
          (error as Error).message === "No access to this company."
        )
          result = await api("workspace");
        else throw error;
      }
      if (version === loadVersion.current) {
        localStorage.setItem("skills-company", result.company.id);
        setData(result);
      }
    } catch (e) {
      if (version === loadVersion.current) setError((e as Error).message);
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, [companyId]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const theme = localStorage.getItem("skills-theme") || "dark";
    setDark(theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, []);
  useEffect(() => {
    setSearch("");
    setStatus("all");
    setPage(1);
    setMenu(false);
  }, [pathname, companyId]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  async function mutate(path: string, method: string, body?: unknown) {
    const result = await api(path, method, body);
    await load();
    setNotice("Changes saved");
    return result;
  }
  async function action(path: string, method: string, body?: unknown) {
    try {
      return await mutate(path, method, body);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  if (!data)
    return (
      <main className="center-state">
        <ShieldCheck size={40} />
        <h2>{loading ? "Opening your workspace…" : "Workspace unavailable"}</h2>
        {error && (
          <>
            <p role="alert">{error}</p>
            <button className="button primary" onClick={load}>
              Try again
            </button>
            <Link href="/login">Back to sign in</Link>
          </>
        )}
      </main>
    );
  const hr = data.company.role === "HR";
  const selectedEmployee = data.employees.find((e) => e.id === employeeId);
  const qs = data.qualifications;
  const active = data.employees.filter((e) => e.active);
  const activeIds = new Set(active.map((e) => e.id));
  const activeQs = qs.filter((q) => activeIds.has(q.employeeId));
  const valid = activeQs.filter(
    (q) =>
      ["Valid", "Expiring soon"].includes(q.status) &&
      q.verification === "VERIFIED",
  ).length;
  const expiring = activeQs.filter((q) => q.status === "Expiring soon");
  const expired = activeQs.filter((q) => q.status === "Expired");
  const pending = activeQs.filter(
    (q) => q.verification === "PENDING" && !q.revoked,
  );
  const coverage = activeQs.length
    ? Math.round((valid / activeQs.length) * 100)
    : 0;
  const title = selectedEmployee
    ? selectedEmployee.name
    : navigation.flatMap((n) => n.items).find((n) => n[0] === view)?.[1] ||
      "Overview";
  const filtered = data.employees.filter(
    (e) =>
      `${e.name} ${e.ssn} ${e.jobTitle} ${e.department} ${e.site}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "all" || (status === "active" ? !!e.active : !e.active)),
  );
  const attention = [...expired, ...expiring].sort((a, b) =>
    (a.expiresOn || "").localeCompare(b.expiresOn || ""),
  );
  function exportCsv() {
    const columns = [
      "Name",
      "Employee ID",
      "Job title",
      "Department",
      "Site",
      "Status",
    ];
    const csv = [
      columns,
      ...filtered.map((e) => [
        e.name,
        e.ssn,
        e.jobTitle,
        e.department,
        e.site,
        e.active ? "Active" : "Inactive",
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  function employeeTable(es: Employee[], compact = false) {
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>{compact ? "Department" : "Employee ID"}</th>
              {!compact && <th>Department / site</th>}
              <th>Qualifications</th>
              <th>Status</th>
              <th aria-label="Open employee" />
            </tr>
          </thead>
          <tbody>
            {es.map((e) => {
              const eq = qs.filter((q) => q.employeeId === e.id);
              const count = eq.filter(
                (q) =>
                  ["Valid", "Expiring soon"].includes(q.status) &&
                  q.verification === "VERIFIED",
              ).length;
              return (
                <tr key={e.id}>
                  <td>
                    <Link
                      className="person"
                      href={"/workspace/employees/" + e.id}
                    >
                      <Avatar name={e.name} photoId={e.photoId} />
                      <span>
                        <strong>{e.name}</strong>
                        <small>{e.jobTitle}</small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    {compact ? (
                      e.department
                    ) : (
                      <span className="mono muted">{e.ssn}</span>
                    )}
                  </td>
                  {!compact && (
                    <td>
                      {e.department}
                      <small className="block muted">{e.site}</small>
                    </td>
                  )}
                  <td>
                    <div className="qualification-progress">
                      <span>
                        {count}
                        <span className="muted"> / {eq.length} valid</span>
                      </span>
                      <div className="tiny-track">
                        <i
                          style={{
                            width: `${eq.length ? (count / eq.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge>{e.active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td>
                    <Link
                      className="icon-button"
                      aria-label={"View " + e.name}
                      href={"/workspace/employees/" + e.id}
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!es.length && (
          <Empty
            title="No employees found"
            description="Try another search, or add your first employee."
          />
        )}
      </div>
    );
  }
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="menu-overlay"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <Link href="/workspace" className="brand">
          <span className="brand-icon">
            <ShieldCheck size={24} />
          </span>
          <strong>
            skills<span className="brand-dot">.</span>
          </strong>
          <span className="brand-tag">WORKSPACE</span>
        </Link>
        <div className="company-switch">
          <Building2 size={21} />
          <div>
            <span>Company workspace</span>
            <select
              aria-label="Company workspace"
              value={data.company.id}
              disabled={loading}
              onChange={(e) => {
                localStorage.setItem("skills-company", e.target.value);
                setCompanyId(e.target.value);
                setNewToken("");
                router.push("/workspace");
              }}
            >
              {data.companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown size={14} />
        </div>
        <nav>
          {navigation.map((group) => (
            <div className="nav-group" key={group.section}>
              <p>{group.section}</p>
              {group.items.map(([key, label, Icon]) => (
                <Link
                  className={"nav-item " + (view === key ? "active" : "")}
                  key={key}
                  href={"/workspace" + (key ? "/" + key : "")}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {key === "employees" && (
                    <small>{data.employees.length}</small>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <QrCode size={22} />
            <strong>Every skill. One scan.</strong>
            <p>A live skills passport for every person on your team.</p>
            <Link href="/workspace/passports">
              View passports <ArrowRight size={14} />
            </Link>
          </div>
          <div className="sidebar-user">
            <Avatar name={data.user.name} />
            <div>
              <strong>{data.user.name}</strong>
              <small>Human Resources</small>
            </div>
            <button
              title="Sign out"
              aria-label="Sign out"
              className="icon-button"
              onClick={async () => {
                await api("auth/logout", "POST");
                window.location.href = "/login";
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="live-label">
              <i />
              Live workspace
            </span>
            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() => {
                const next = !dark;
                setDark(next);
                document.documentElement.dataset.theme = next
                  ? "dark"
                  : "light";
                localStorage.setItem("skills-theme", next ? "dark" : "light");
              }}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link
              href="/workspace#attention"
              className="icon-button notification"
              aria-label="View expiring qualifications"
            >
              <Bell size={19} />
              {attention.length > 0 && <i />}
            </Link>
            <div className="topbar-divider" />
            <Avatar name={data.user.name} />
          </div>
        </header>
        <main className="main-content" aria-busy={loading} inert={loading}>
          {error && (
            <div role="alert" className="alert error">
              {error}
              <button className="text-button" onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {selectedEmployee ? (
                  <Link href="/workspace/employees">EMPLOYEES / PROFILE</Link>
                ) : view ? (
                  "WORKFORCE MANAGEMENT"
                ) : (
                  "YOUR WORKFORCE, AT A GLANCE"
                )}
              </div>
              <h1>{selectedEmployee ? "Employee profile" : title}</h1>
              <p>
                {selectedEmployee
                  ? "Qualifications, evidence and a passport that stays up to date."
                  : view === "employees"
                    ? "The people behind every project."
                    : view === "matrix"
                      ? "See capabilities and qualification gaps across your team."
                      : view === "competencies"
                        ? "A shared vocabulary for your company’s capabilities."
                        : view === "documents"
                          ? "The evidence behind your team’s qualifications."
                          : view === "passports"
                            ? "Print a label. Share a profile. Keep qualifications within reach."
                            : view === "reports"
                              ? "Connect Excel directly to your company’s live data."
                              : "A clear view of your team’s skills and what needs attention."}
              </p>
            </div>
            <div className="heading-actions">
              {loading ? (
                <span className="muted">Refreshing…</span>
              ) : (
                <button
                  className="icon-button"
                  aria-label="Refresh workspace"
                  onClick={load}
                >
                  <RefreshCw size={17} />
                </button>
              )}
              {hr && (!view || view === "employees") && !selectedEmployee && (
                <button
                  className="button primary"
                  onClick={() => setDialog({ type: "employee" })}
                >
                  <Plus size={17} />
                  Add employee
                </button>
              )}
              {hr && view === "competencies" && (
                <button
                  className="button primary"
                  onClick={() => setDialog({ type: "competency" })}
                >
                  <Plus size={17} />
                  New competency
                </button>
              )}
              {view === "employees" && !selectedEmployee && (
                <button className="button" onClick={exportCsv}>
                  <Download size={16} />
                  Export CSV
                </button>
              )}
            </div>
          </div>
          {!view && (
            <>
              <div className="stats-grid">
                {[
                  [
                    Users,
                    "Active employees",
                    active.length,
                    "Across " +
                      new Set(active.map((e) => e.site)).size +
                      " sites",
                    "teal",
                  ],
                  [
                    ShieldCheck,
                    "Valid qualifications",
                    valid,
                    "Verified and within validity",
                    "blue",
                  ],
                  [
                    Clock3,
                    "Expiring in 30 days",
                    expiring.length,
                    "Plan the next renewal",
                    "amber",
                  ],
                  [
                    AlertTriangle,
                    "Expired qualifications",
                    expired.length,
                    "Review with your team",
                    "red",
                  ],
                ].map(([Icon, label, value, hint, tone]) => {
                  const I = Icon as typeof Users;
                  return (
                    <div className={"stat-card " + tone} key={String(label)}>
                      <div className="stat-top">
                        <span>{String(label)}</span>
                        <span className="stat-icon">
                          <I size={20} />
                        </span>
                      </div>
                      <strong className="stat-number">{String(value)}</strong>
                      <small>{String(hint)}</small>
                    </div>
                  );
                })}
              </div>
              <div className="overview-grid">
                <section className="card attention-card" id="attention">
                  <div className="card-heading">
                    <div>
                      <h2>
                        Needs attention{" "}
                        <span className="count">{attention.length}</span>
                      </h2>
                      <p>Upcoming renewals and expired qualifications</p>
                    </div>
                    <Link className="text-link" href="/workspace/matrix">
                      View matrix <ArrowUpRight size={15} />
                    </Link>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Qualification</th>
                          <th>Expiry date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attention.slice(0, 5).map((q) => {
                          const e = data.employees.find(
                            (e) => e.id === q.employeeId,
                          )!;
                          return (
                            <tr key={q.id}>
                              <td>
                                <Link
                                  className="person"
                                  href={"/workspace/employees/" + e.id}
                                >
                                  <Avatar name={e.name} photoId={e.photoId} />
                                  <span>
                                    <strong>{e.name}</strong>
                                    <small>{e.site}</small>
                                  </span>
                                </Link>
                              </td>
                              <td>{q.name}</td>
                              <td className="nowrap">
                                {dateLabel(q.expiresOn)}
                              </td>
                              <td>
                                <Badge>{q.status}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {!attention.length && (
                      <Empty
                        title="All caught up"
                        description="No qualifications are expired or due within 30 days."
                      />
                    )}
                  </div>
                </section>
                <section className="card health-card">
                  <div className="card-heading">
                    <div>
                      <h2>Qualification health</h2>
                      <p>Active employee records</p>
                    </div>
                    <ShieldCheck size={19} className="muted" />
                  </div>
                  <div
                    className="health-ring"
                    style={
                      { "--progress": coverage + "%" } as React.CSSProperties
                    }
                  >
                    <div>
                      <strong>
                        {coverage}
                        <span>%</span>
                      </strong>
                      <small>verified & valid</small>
                    </div>
                  </div>
                  <div className="health-legend">
                    <span>
                      <i className="dot teal" />
                      Valid qualifications<strong>{valid}</strong>
                    </span>
                    <span>
                      <i className="dot amber" />
                      Pending review<strong>{pending.length}</strong>
                    </span>
                    <span>
                      <i className="dot red" />
                      Expired<strong>{expired.length}</strong>
                    </span>
                  </div>
                  <p className="health-footnote">
                    Validity and verification are tracked separately.
                  </p>
                </section>
              </div>
              <div className="overview-grid">
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>Your people</h2>
                      <p>Employee credentials, all in one place</p>
                    </div>
                    <Link className="text-link" href="/workspace/employees">
                      All employees <ArrowRight size={15} />
                    </Link>
                  </div>
                  {employeeTable(data.employees.slice(0, 5), true)}
                </section>
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>Recent activity</h2>
                      <p>Latest changes in this company</p>
                    </div>
                    <Clock3 size={18} className="muted" />
                  </div>
                  <div className="activity-list">
                    {data.activity.slice(0, 5).map((a) => (
                      <div className="activity" key={a.id}>
                        <span className="activity-icon">
                          <Check size={13} />
                        </span>
                        <div>
                          <strong>{a.action}</strong>
                          <p>{a.subject}</p>
                          <small>
                            {a.actor} · {dateLabel(a.createdAt)}
                          </small>
                        </div>
                      </div>
                    ))}
                    {!data.activity.length && (
                      <Empty
                        title="No activity yet"
                        description="Changes will appear here."
                      />
                    )}
                  </div>
                </section>
              </div>
              <section className="passport-banner">
                <div className="banner-icon">
                  <QrCode size={30} />
                </div>
                <div>
                  <h3>Credentials that travel with your team</h3>
                  <p>
                    Each employee has a live, public passport. Print their QR
                    label for quick access on site.
                  </p>
                </div>
                <Link className="button" href="/workspace/passports">
                  Open QR passports <ArrowRight size={16} />
                </Link>
              </section>
            </>
          )}
          {view === "employees" && !employeeId && (
            <section className="card">
              <div className="toolbar">
                <div className="search-input">
                  <Search size={17} />
                  <input
                    aria-label="Search employees"
                    placeholder="Search name, ID, role or site…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <select
                  aria-label="Employee status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span className="muted push-right">
                  {filtered.length} employees
                </span>
              </div>
              {employeeTable(filtered.slice((page - 1) * 10, page * 10))}
              <div className="table-footer">
                <span>
                  Showing {filtered.length ? (page - 1) * 10 + 1 : 0}–
                  {Math.min(page * 10, filtered.length)} of {filtered.length}
                </span>
                <div>
                  <button
                    className="button small"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {page}</span>
                  <button
                    className="button small"
                    disabled={page * 10 >= filtered.length}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          )}
          {view === "employees" &&
            employeeId &&
            (selectedEmployee ? (
              <EmployeeDetail
                employee={selectedEmployee}
                data={data}
                hr={hr}
                setDialog={setDialog}
                action={action}
              />
            ) : (
              <Empty
                title="Employee not found"
                description="Return to Employees to choose someone in this company."
              />
            ))}
          {view === "matrix" && (
            <section className="card">
              <div className="toolbar">
                <div className="search-input">
                  <Search size={17} />
                  <input
                    aria-label="Search skills matrix"
                    placeholder="Search employees…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="matrix-legend">
                  <span>
                    <i className="dot teal" />
                    Valid
                  </span>
                  <span>
                    <i className="dot amber" />
                    Expiring / pending
                  </span>
                  <span>
                    <i className="dot red" />
                    Expired / revoked
                  </span>
                  <span>— Not recorded</span>
                </div>
              </div>
              <div className="table-scroll">
                <table className="matrix">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      {data.competencies.map((c) => (
                        <th key={c.id}>{c.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <Link
                            className="person"
                            href={"/workspace/employees/" + e.id}
                          >
                            <Avatar name={e.name} photoId={e.photoId} />
                            <span>
                              <strong>{e.name}</strong>
                              <small>{e.jobTitle}</small>
                            </span>
                          </Link>
                        </td>
                        {data.competencies.map((c) => {
                          const records = qs.filter(
                            (q) =>
                              q.employeeId === e.id && q.competencyId === c.id,
                          );
                          const rank = (q: Qualification) =>
                            q.verification === "VERIFIED" &&
                            q.status === "Valid"
                              ? 0
                              : q.verification === "VERIFIED" &&
                                  q.status === "Expiring soon"
                                ? 1
                                : q.status === "Upcoming"
                                  ? 2
                                  : q.verification === "PENDING" &&
                                      !q.revoked &&
                                      q.status !== "Expired"
                                    ? 3
                                    : 4;
                          const q = records.sort(
                            (a, b) => rank(a) - rank(b),
                          )[0];
                          return (
                            <td key={c.id}>
                              {q ? (
                                <Link
                                  href={"/workspace/employees/" + e.id}
                                  title={`${q.name}: ${q.status}, ${q.verification === "VERIFIED" ? "verified" : "pending review"}. ${dateLabel(q.expiresOn)}`}
                                  className={
                                    "matrix-cell " +
                                    (["Expired", "Revoked"].includes(q.status)
                                      ? "danger"
                                      : q.status === "Valid" &&
                                          q.verification === "VERIFIED"
                                        ? "success"
                                        : "warning")
                                  }
                                >
                                  {["Expired", "Revoked"].includes(q.status) ? (
                                    <X size={15} />
                                  ) : q.status === "Valid" &&
                                    q.verification === "VERIFIED" ? (
                                    <Check size={15} />
                                  ) : (
                                    <Clock3 size={14} />
                                  )}
                                  <span>
                                    {q.verification === "PENDING"
                                      ? "Pending"
                                      : q.status === "Expiring soon"
                                        ? "Expiring"
                                        : q.status}
                                  </span>
                                </Link>
                              ) : (
                                <span className="muted">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                Best current record shown per employee and competency. Open a
                profile for full history.
              </div>
            </section>
          )}
          {view === "competencies" && (
            <>
              <div className="toolbar standalone">
                <div className="search-input">
                  <Search size={17} />
                  <input
                    aria-label="Search competencies"
                    placeholder="Search competencies…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <span className="muted">
                  {data.competencies.length} competencies
                </span>
              </div>
              <div className="competency-grid">
                {data.competencies
                  .filter((c) =>
                    (c.name + " " + c.category)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((c) => {
                    const records = qs.filter((q) => q.competencyId === c.id);
                    return (
                      <section className="card competency-card" key={c.id}>
                        <div className="competency-top">
                          <span className="feature-icon">
                            <Award size={23} />
                          </span>
                          <span className="category-label">{c.category}</span>
                        </div>
                        <h2>{c.name}</h2>
                        <p>{c.description || "No description added."}</p>
                        <div className="competency-bottom">
                          <span>
                            <strong>
                              {new Set(records.map((q) => q.employeeId)).size}
                            </strong>{" "}
                            employees
                          </span>
                          <span className="muted">
                            {
                              records.filter(
                                (q) => q.status === "Expiring soon",
                              ).length
                            }{" "}
                            expiring soon
                          </span>
                        </div>
                      </section>
                    );
                  })}
              </div>
              {!data.competencies.length && (
                <Empty
                  title="Build your competency catalogue"
                  description="Add a competency to start recording employee qualifications."
                />
              )}
            </>
          )}
          {view === "documents" && (
            <section className="card">
              <div className="toolbar">
                <div className="search-input">
                  <Search size={17} />
                  <input
                    aria-label="Search documents"
                    placeholder="Search documents or employees…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <span className="muted push-right">
                  Upload diplomas from an employee profile
                </span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Added</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.documents
                      .filter(
                        (d) =>
                          d.kind === "DIPLOMA" &&
                          (
                            d.originalName +
                            " " +
                            data.employees.find((e) => e.id === d.employeeId)
                              ?.name
                          )
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                      )
                      .map((d) => (
                        <tr key={d.id}>
                          <td>
                            <span className="document-name">
                              <Files size={19} />
                              {d.originalName}
                            </span>
                            <small className="block muted">
                              {Math.ceil(d.sizeBytes / 1024)} KB
                            </small>
                          </td>
                          <td>
                            <Link href={"/workspace/employees/" + d.employeeId}>
                              {
                                data.employees.find(
                                  (e) => e.id === d.employeeId,
                                )?.name
                              }
                            </Link>
                          </td>
                          <td>Diploma / certificate</td>
                          <td>{dateLabel(d.createdAt)}</td>
                          <td>
                            <a
                              className="button small"
                              href={"/api/documents/" + d.id}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!data.documents.some((d) => d.kind === "DIPLOMA") && (
                <Empty
                  title="No diplomas uploaded yet"
                  description="HR can open an employee profile and attach a diploma to a qualification."
                />
              )}
            </section>
          )}
          {view === "passports" && (
            <>
              <div className="info-banner">
                <ShieldCheck size={20} />
                <div>
                  <strong>Open access, always up to date</strong>
                  <p>
                    Anyone with the QR code can view the employee’s skills and
                    diplomas. No employee account needed.
                  </p>
                </div>
              </div>
              <div className="toolbar standalone">
                <div className="search-input">
                  <Search size={17} />
                  <input
                    aria-label="Search passports"
                    placeholder="Find an employee passport…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="passport-grid">
                {filtered
                  .filter((e) => e.active)
                  .map((e) => (
                    <section className="card passport-card" key={e.id}>
                      <Avatar name={e.name} photoId={e.photoId} large />
                      <h2>{e.name}</h2>
                      <p>{e.jobTitle}</p>
                      <span className="muted">{e.site}</span>
                      <div className="passport-card-actions">
                        <a
                          className="button"
                          href={"/p/" + e.qrToken}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={15} />
                          View passport
                        </a>
                        <a
                          className="button primary"
                          href={"/label/" + e.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Printer size={15} />
                          Print label
                        </a>
                      </div>
                    </section>
                  ))}
              </div>
            </>
          )}
          {view === "reports" && (
            <Reports
              data={data}
              newToken={newToken}
              setNewToken={setNewToken}
              action={action}
            />
          )}
          {![
            "",
            "employees",
            "matrix",
            "competencies",
            "documents",
            "passports",
            "reports",
          ].includes(view) && (
            <Empty
              title="Page not found"
              description="Choose a page from the navigation."
            />
          )}
          <footer className="workspace-footer">
            <span>
              skills. <span className="muted">Workforce credentials</span>
            </span>
            <span>{data.company.name} · HR workspace</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div role="status" className="toast">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
      {dialog && (
        <FormDialog
          dialog={dialog}
          data={data}
          close={() => setDialog(null)}
          save={mutate}
        />
      )}
    </div>
  );
}

function EmployeeDetail({
  employee: e,
  data,
  hr,
  setDialog,
  action,
}: {
  employee: Employee;
  data: Workspace;
  hr: boolean;
  setDialog: (d: DialogState) => void;
  action: (path: string, method: string, body?: unknown) => Promise<unknown>;
}) {
  const qs = data.qualifications.filter((q) => q.employeeId === e.id);
  return (
    <>
      <section className="card employee-summary">
        <Avatar name={e.name} photoId={e.photoId} large />
        <div className="employee-summary-name">
          <h2>{e.name}</h2>
          <p>
            {e.jobTitle} · {e.department}
          </p>
          <span className="muted">
            {e.site} · {e.ssn}
          </span>
        </div>
        <Badge>{e.active ? "Active" : "Inactive"}</Badge>
        <div className="summary-actions">
          {hr && (
            <button
              className="button"
              onClick={() => setDialog({ type: "employee", employee: e })}
            >
              <Pencil size={15} />
              Edit profile
            </button>
          )}
          <a
            className="button primary"
            href={"/p/" + e.qrToken}
            target="_blank"
            rel="noreferrer"
          >
            <QrCode size={16} />
            Public passport <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <div className="detail-grid">
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>
                Qualifications <span className="count">{qs.length}</span>
              </h2>
              <p>Validity, verification and supporting documents</p>
            </div>
            {hr && (
              <button
                className="button primary small"
                onClick={() =>
                  setDialog({ type: "qualification", employee: e })
                }
              >
                <Plus size={15} />
                Add qualification
              </button>
            )}
          </div>
          <div className="qualification-list">
            {qs.map((q) => (
              <article className="qualification-item" key={q.id}>
                <div className="qualification-item-head">
                  <span className="feature-icon">
                    <Award size={20} />
                  </span>
                  <div>
                    <h3>{q.name}</h3>
                    <small className="muted">{q.issuer}</small>
                  </div>
                  <Badge>{q.status}</Badge>
                </div>
                <div className="qualification-meta">
                  <span>
                    Valid from<strong>{dateLabel(q.validFrom)}</strong>
                  </span>
                  <span>
                    Valid until<strong>{dateLabel(q.expiresOn)}</strong>
                  </span>
                  <span>
                    Verification
                    <Badge>
                      {q.verification === "VERIFIED"
                        ? "Verified"
                        : "Pending review"}
                    </Badge>
                  </span>
                </div>
                <div className="document-links">
                  {data.documents
                    .filter((d) => d.qualificationId === q.id)
                    .map((d) => (
                      <a
                        href={"/api/documents/" + d.id}
                        target="_blank"
                        rel="noreferrer"
                        key={d.id}
                      >
                        <Files size={15} />
                        {d.originalName}
                        <ExternalLink size={13} />
                      </a>
                    ))}
                </div>
                {hr && (
                  <div className="qualification-actions">
                    <button
                      className="text-button"
                      onClick={() =>
                        setDialog({
                          type: "upload",
                          employee: e,
                          qualification: q,
                        })
                      }
                    >
                      <Upload size={14} />
                      Upload diploma
                    </button>
                    {q.verification === "PENDING" && (
                      <button
                        className="text-button"
                        onClick={() =>
                          setDialog({
                            type: "confirm",
                            title: "Verify qualification?",
                            description:
                              "Confirm that HR has checked the supporting evidence for " +
                              q.name +
                              ".",
                            path: "qualifications/" + q.id,
                            body: { verification: "VERIFIED" },
                          })
                        }
                      >
                        <Check size={14} />
                        Mark verified
                      </button>
                    )}
                    {!q.revoked && (
                      <button
                        className="text-button danger-text"
                        onClick={() =>
                          setDialog({
                            type: "confirm",
                            title: "Revoke qualification?",
                            description:
                              q.name +
                              " will be marked revoked on the public passport. Its history and evidence will remain.",
                            path: "qualifications/" + q.id,
                            body: { revoked: true },
                          })
                        }
                      >
                        <Ban size={14} />
                        Revoke
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
          {!qs.length && (
            <Empty
              title="No qualifications recorded"
              description="Add a competency and its validity dates to start this passport."
            />
          )}
        </section>
        <aside className="detail-aside">
          <section className="card">
            <div className="card-heading">
              <h2>Employee photograph</h2>
            </div>
            <div className="photo-panel">
              <Avatar name={e.name} photoId={e.photoId} large />
              <p>
                {e.photoId
                  ? "Shown on the passport and helmet label."
                  : "Add a photo so people can identify this worker."}
              </p>
              {hr && (
                <button
                  className="button full"
                  onClick={() => setDialog({ type: "upload", employee: e })}
                >
                  <Upload size={16} />
                  {e.photoId ? "Replace photo" : "Upload photo"}
                </button>
              )}
            </div>
          </section>
          <section className="card">
            <div className="card-heading">
              <h2>Helmet label</h2>
              <QrCode size={18} />
            </div>
            <div className="label-panel">
              <p>
                Print a label with the employee’s name, photograph and unique QR
                code.
              </p>
              <a
                className="button primary full"
                href={"/label/" + e.id}
                target="_blank"
                rel="noreferrer"
              >
                <Printer size={16} />
                Open print layout
              </a>
              {hr && (
                <button
                  className="text-button"
                  onClick={() =>
                    setDialog({
                      type: "confirm",
                      title: "Replace this QR code?",
                      description:
                        "The old QR code will stop working immediately. You will need to print a new helmet label.",
                      path: "employees/" + e.id + "/rotate-qr",
                      body: {},
                    })
                  }
                >
                  <RefreshCw size={14} />
                  Replace QR code
                </button>
              )}
            </div>
          </section>
          <div className="info-banner compact">
            <ShieldCheck size={20} />
            <p>
              SSN and internal contact details are not shown on the public
              passport.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function FormDialog({
  dialog: d,
  data,
  close,
  save,
}: {
  dialog: NonNullable<DialogState>;
  data: Workspace;
  close: () => void;
  save: (path: string, method: string, body?: unknown) => Promise<unknown>;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const title =
    d.type === "employee"
      ? d.employee
        ? "Edit employee"
        : "Add employee"
      : d.type === "qualification"
        ? "Add qualification"
        : d.type === "competency"
          ? "New competency"
          : d.type === "upload"
            ? d.qualification
              ? "Upload diploma"
              : "Upload employee photo"
            : d.title;
  const e = d.type === "employee" ? d.employee : undefined;
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!busy) close();
      }}
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          const form = new FormData(event.currentTarget);
          const value = Object.fromEntries(form);
          try {
            if (d.type === "employee")
              await save(
                "employees" + (e ? "/" + e.id : ""),
                e ? "PATCH" : "POST",
                {
                  ...value,
                  companyId: data.company.id,
                  active: value.active === "on",
                },
              );
            if (d.type === "competency")
              await save("competencies", "POST", {
                ...value,
                companyId: data.company.id,
              });
            if (d.type === "qualification")
              await save("qualifications", "POST", {
                ...value,
                employeeId: d.employee.id,
                expiresOn: value.expiresOn || null,
              });
            if (d.type === "upload") {
              form.set("employeeId", d.employee.id);
              form.set("kind", d.qualification ? "DIPLOMA" : "PHOTO");
              if (d.qualification)
                form.set("qualificationId", d.qualification.id);
              await save("uploads", "POST", form);
            }
            if (d.type === "confirm")
              await save(
                d.path,
                d.path.endsWith("rotate-qr") ? "POST" : "PATCH",
                d.body,
              );
            close();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="modal-body">
          {d.type === "employee" && (
            <div className="form-grid">
              <label className="span-two">
                Full name
                <input
                  name="name"
                  defaultValue={e?.name}
                  maxLength={120}
                  required
                  placeholder="e.g. Thomas Bernard"
                />
              </label>
              <label>
                Employee ID / SSN
                <input
                  name="ssn"
                  defaultValue={e?.ssn}
                  maxLength={100}
                  required
                  placeholder="Unique within the company"
                />
              </label>
              <label>
                Job title
                <input
                  name="jobTitle"
                  defaultValue={e?.jobTitle}
                  maxLength={120}
                  required
                  placeholder="e.g. Site supervisor"
                />
              </label>
              <label>
                Department
                <input
                  name="department"
                  defaultValue={e?.department}
                  maxLength={100}
                  required
                  placeholder="e.g. Operations"
                />
              </label>
              <label>
                Site
                <input
                  name="site"
                  defaultValue={e?.site}
                  maxLength={120}
                  required
                  placeholder="e.g. Riverside project"
                />
              </label>
              <label className="span-two">
                Email <span className="muted">(optional, internal only)</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={e?.email}
                  maxLength={190}
                />
              </label>
              <label className="checkbox-label span-two">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={e ? !!e.active : true}
                />
                Active employee — public passport enabled
              </label>
              <p className="form-hint span-two">
                Employees do not receive an account. HR maintains their
                information.
              </p>
            </div>
          )}
          {d.type === "competency" && (
            <div className="form-grid">
              <label className="span-two">
                Competency name
                <input
                  name="name"
                  maxLength={120}
                  required
                  placeholder="e.g. Working at height"
                />
              </label>
              <label className="span-two">
                Category
                <input
                  name="category"
                  maxLength={80}
                  required
                  placeholder="e.g. Safety"
                  list="categories"
                />
                <datalist id="categories">
                  <option>Safety</option>
                  <option>Technical</option>
                  <option>Equipment</option>
                  <option>Onboarding</option>
                </datalist>
              </label>
              <label className="span-two">
                Description
                <textarea name="description" maxLength={2000} rows={3} />
              </label>
            </div>
          )}
          {d.type === "qualification" && (
            <div className="form-grid">
              <p className="form-hint span-two">
                Recording a qualification for <strong>{d.employee.name}</strong>
                . Renewals are added as new records to preserve history.
              </p>
              <label className="span-two">
                Competency
                <select
                  name="competencyId"
                  aria-label="Competency"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select competency
                  </option>
                  {data.competencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="span-two">
                Issuing organization
                <input
                  name="issuer"
                  maxLength={160}
                  required
                  placeholder="Training provider or issuing body"
                />
              </label>
              <label>
                Valid from
                <input name="validFrom" type="date" required />
              </label>
              <label>
                Valid until <span className="muted">(optional)</span>
                <input name="expiresOn" type="date" />
              </label>
              <label className="span-two">
                Verification
                <select name="verification" defaultValue="PENDING">
                  <option value="PENDING">Pending review</option>
                  <option value="VERIFIED">Verified by HR</option>
                </select>
              </label>
              <p className="form-hint span-two">
                Leave the end date empty for a qualification without expiry.
                Attach the diploma after saving.
              </p>
            </div>
          )}
          {d.type === "upload" && (
            <>
              <div className="upload-area">
                <Upload size={30} />
                <strong>
                  {d.qualification ? d.qualification.name : d.employee.name}
                </strong>
                <p>
                  {d.qualification ? "PDF, PNG or JPEG" : "PNG or JPEG"} · Up to
                  10 MB
                </p>
                <input
                  aria-label="Choose file"
                  type="file"
                  name="file"
                  accept={
                    d.qualification ? ".pdf,.png,.jpg,.jpeg" : ".png,.jpg,.jpeg"
                  }
                  required
                />
              </div>
              <p className="form-hint">
                This file will be visible to anyone opening the employee’s QR
                passport. Uploading a diploma does not verify the qualification.
              </p>
            </>
          )}
          {d.type === "confirm" && <p>{d.description}</p>}
          {error && (
            <div className="alert error" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="button"
            onClick={close}
            disabled={busy}
          >
            Cancel
          </button>
          <button className="button primary" disabled={busy}>
            {busy
              ? "Saving…"
              : d.type === "upload"
                ? "Upload file"
                : d.type === "confirm"
                  ? "Confirm"
                  : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Reports({
  data,
  newToken,
  setNewToken,
  action,
}: {
  data: Workspace;
  newToken: string;
  setNewToken: (t: string) => void;
  action: (path: string, method: string, body?: unknown) => Promise<any>;
}) {
  const [keyName, setKeyName] = useState("Excel reporting"),
    [copied, setCopied] = useState(false),
    [busy, setBusy] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div className="reports-grid">
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Connect your workbook</h2>
            <p>Use Excel Power Query to refresh company data</p>
          </div>
          <span className="feature-icon">
            <Cable size={24} />
          </span>
        </div>
        <div className="connection-steps">
          <div>
            <span>1</span>
            <section>
              <h3>Create a reporting key</h3>
              <p>
                Your key gives read-only access to{" "}
                <strong>{data.company.name}</strong>. It expires after 90 days.
              </p>
            </section>
          </div>
          <div>
            <span>2</span>
            <section>
              <h3>Open Excel → Data → From Web</h3>
              <p>
                Choose a dataset below. In the credentials dialog choose{" "}
                <strong>Basic</strong>, use <code>token</code> as the username
                and your reporting key as the password.
              </p>
            </section>
          </div>
          <div>
            <span>3</span>
            <section>
              <h3>Expand the data and build your report</h3>
              <p>
                Choose the <code>data</code> list, convert it to a table, then
                expand the columns you need. Refresh the query to fetch current
                records.
              </p>
            </section>
          </div>
        </div>
        <div className="dataset-list">
          {["employees", "qualifications", "competencies"].map((name) => (
            <div key={name}>
              <strong>{name[0].toUpperCase() + name.slice(1)}</strong>
              <code>
                {origin}/api/reports/{name}?pageSize=1000
              </code>
              <button
                className="icon-button"
                aria-label={"Copy " + name + " URL"}
                onClick={() =>
                  navigator.clipboard.writeText(
                    origin + "/api/reports/" + name + "?pageSize=1000",
                  )
                }
              >
                <Copy size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="connection-note">
          <strong>Working with more than 1,000 records?</strong>
          <p>
            The API is paginated. Use the supplied Power Query template to load
            every page.
          </p>
          <a className="text-link" href="/excel/Skills.pq" download>
            <Download size={15} />
            Download Power Query template
          </a>
        </div>
      </section>
      <div>
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Reporting keys</h2>
              <p>Private to your account</p>
            </div>
            <KeyRound size={20} />
          </div>
          <div className="key-panel">
            <label>
              Key name
              <input
                value={keyName}
                maxLength={100}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </label>
            <button
              className="button primary full"
              disabled={busy || !keyName.trim()}
              onClick={async () => {
                setBusy(true);
                const result = await action("tokens", "POST", {
                  companyId: data.company.id,
                  name: keyName,
                });
                if (result) setNewToken(result.token);
                setBusy(false);
              }}
            >
              <Plus size={16} />
              {busy ? "Creating…" : "Create reporting key"}
            </button>
            {newToken && (
              <div className="new-key">
                <strong>Copy your key now</strong>
                <p>It will only be shown once. Keep it private.</p>
                <code>{newToken}</code>
                <button
                  className="button full"
                  onClick={async () => {
                    await navigator.clipboard.writeText(newToken);
                    setCopied(true);
                  }}
                >
                  <Copy size={15} />
                  {copied ? "Copied" : "Copy key"}
                </button>
              </div>
            )}
            {data.tokens.map((t) => (
              <div className="token-row" key={t.id}>
                <KeyRound size={17} />
                <div>
                  <strong>{t.name}</strong>
                  <small>Expires {dateLabel(t.expiresAt)}</small>
                </div>
                <button
                  className="icon-button danger-text"
                  aria-label={"Revoke " + t.name}
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Revoke this reporting key? Connected workbooks using it will stop refreshing.",
                      )
                    ) {
                      await action("tokens/" + t.id, "DELETE");
                      setNewToken("");
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
        <div className="info-banner compact">
          <ShieldCheck size={20} />
          <p>
            Reporting keys cannot change records or upload files. They only
            access data from this company.
          </p>
        </div>
      </div>
    </div>
  );
}
