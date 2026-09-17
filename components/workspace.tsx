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
import {
  type Dictionary,
  statusLabel,
  statusTone,
  verificationLabel,
  verificationTone,
  activeLabel,
  activeTone,
  matrixCellLabel,
} from "@/lib/i18n";
import { Avatar, Badge, Empty, Modal } from "./ui";
import { useLocale } from "./locale-provider";
import { LangSwitch } from "./lang-switch";

function getNavigation(
  t: Dictionary,
): { section: string; items: [string, string, LucideIcon][] }[] {
  return [
    {
      section: t.nav.workspaceSection,
      items: [
        ["", t.nav.overview, LayoutDashboard],
        ["employees", t.nav.employees, Users],
        ["matrix", t.nav.matrix, Grid2X2],
        ["competencies", t.nav.competencies, Award],
        ["documents", t.nav.documents, Files],
      ],
    },
    {
      section: t.nav.toolsSection,
      items: [
        ["passports", t.nav.passports, QrCode],
        ["reports", t.nav.reports, Cable],
      ],
    },
  ];
}
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
  const { t } = useLocale();
  const navigation = getNavigation(t);
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
    setNotice(t.common.changesSaved);
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
        <h2>
          {loading ? t.common.openingWorkspace : t.common.workspaceUnavailable}
        </h2>
        {error && (
          <>
            <p role="alert">{error}</p>
            <button className="button primary" onClick={load}>
              {t.common.tryAgain}
            </button>
            <Link href="/login">{t.common.backToSignIn}</Link>
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
      t.nav.overview;
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
      t.table.name,
      t.table.employeeId,
      t.dialogs.jobTitle,
      t.table.department,
      t.dialogs.site,
      t.table.status,
    ];
    const csv = [
      columns,
      ...filtered.map((e) => [
        e.name,
        e.ssn,
        e.jobTitle,
        e.department,
        e.site,
        activeLabel(e.active, t),
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }),
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
              <th>{t.table.employee}</th>
              <th>{compact ? t.table.department : t.table.employeeId}</th>
              {!compact && <th>{t.table.departmentSite}</th>}
              <th>{t.table.qualifications}</th>
              <th>{t.table.status}</th>
              <th aria-label={t.table.openEmployee} />
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
                        <span className="muted">
                          {" "}
                          {t.table.validSuffix(eq.length)}
                        </span>
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
                    <Badge tone={activeTone(e.active)}>
                      {activeLabel(e.active, t)}
                    </Badge>
                  </td>
                  <td>
                    <Link
                      className="icon-button"
                      aria-label={t.table.viewEmployee(e.name)}
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
            title={t.employees.noneFound}
            description={t.employees.noneFoundDesc}
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
          aria-label={t.topbar.closeNav}
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
          <span className="brand-tag">{t.nav.workspaceSection}</span>
        </Link>
        <div className="company-switch">
          <Building2 size={21} />
          <div>
            <span>{t.sidebar.companyWorkspace}</span>
            <select
              aria-label={t.sidebar.companyWorkspace}
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
            <strong>{t.sidebar.tipTitle}</strong>
            <p>{t.sidebar.tipBody}</p>
            <Link href="/workspace/passports">
              {t.sidebar.viewPassports} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="sidebar-user">
            <Avatar name={data.user.name} />
            <div>
              <strong>{data.user.name}</strong>
              <small>{t.sidebar.role}</small>
            </div>
            <button
              title={t.sidebar.signOut}
              aria-label={t.sidebar.signOut}
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
              aria-label={t.topbar.openNav}
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>{t.topbar.workspace}</span>
            <span>/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="live-label">
              <i />
              {t.topbar.liveWorkspace}
            </span>
            <LangSwitch />
            <button
              className="icon-button"
              aria-label={t.topbar.toggleTheme}
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
              aria-label={t.topbar.viewExpiring}
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
                {t.common.dismiss}
              </button>
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {selectedEmployee ? (
                  <Link href="/workspace/employees">
                    {t.overview.eyebrowProfile}
                  </Link>
                ) : view ? (
                  t.overview.eyebrowWorkforce
                ) : (
                  t.overview.eyebrowGlance
                )}
              </div>
              <h1>{selectedEmployee ? t.overview.employeeProfile : title}</h1>
              <p>
                {selectedEmployee
                  ? t.overview.subtitleProfile
                  : view === "employees"
                    ? t.overview.subtitleEmployees
                    : view === "matrix"
                      ? t.overview.subtitleMatrix
                      : view === "competencies"
                        ? t.overview.subtitleCompetencies
                        : view === "documents"
                          ? t.overview.subtitleDocuments
                          : view === "passports"
                            ? t.overview.subtitlePassports
                            : view === "reports"
                              ? t.overview.subtitleReports
                              : t.overview.subtitleDefault}
              </p>
            </div>
            <div className="heading-actions">
              {loading ? (
                <span className="muted">{t.common.refreshing}</span>
              ) : (
                <button
                  className="icon-button"
                  aria-label={t.common.refreshWorkspace}
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
                  {t.employees.addEmployee}
                </button>
              )}
              {hr && view === "competencies" && (
                <button
                  className="button primary"
                  onClick={() => setDialog({ type: "competency" })}
                >
                  <Plus size={17} />
                  {t.competencies.newCompetency}
                </button>
              )}
              {view === "employees" && !selectedEmployee && (
                <button className="button" onClick={exportCsv}>
                  <Download size={16} />
                  {t.employees.exportCsv}
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
                    t.stats.activeEmployees,
                    active.length,
                    t.stats.acrossSites(
                      new Set(active.map((e) => e.site)).size,
                    ),
                    "teal",
                  ],
                  [
                    ShieldCheck,
                    t.stats.validQualifications,
                    valid,
                    t.stats.verifiedWithinValidity,
                    "blue",
                  ],
                  [
                    Clock3,
                    t.stats.expiring30,
                    expiring.length,
                    t.stats.planNextRenewal,
                    "amber",
                  ],
                  [
                    AlertTriangle,
                    t.stats.expiredQualifications,
                    expired.length,
                    t.stats.reviewWithTeam,
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
                        {t.attention.needsAttention}{" "}
                        <span className="count">{attention.length}</span>
                      </h2>
                      <p>{t.attention.upcomingRenewals}</p>
                    </div>
                    <Link className="text-link" href="/workspace/matrix">
                      {t.attention.viewMatrix} <ArrowUpRight size={15} />
                    </Link>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>{t.table.employee}</th>
                          <th>{t.table.qualification}</th>
                          <th>{t.attention.expiryDate}</th>
                          <th>{t.table.status}</th>
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
                                <Badge tone={statusTone(q.status)}>
                                  {statusLabel(q.status, t)}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {!attention.length && (
                      <Empty
                        title={t.attention.allCaughtUp}
                        description={t.attention.allCaughtUpDesc}
                      />
                    )}
                  </div>
                </section>
                <section className="card health-card">
                  <div className="card-heading">
                    <div>
                      <h2>{t.health.title}</h2>
                      <p>{t.health.subtitle}</p>
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
                      <small>{t.health.verifiedAndValid}</small>
                    </div>
                  </div>
                  <div className="health-legend">
                    <span>
                      <i className="dot teal" />
                      {t.health.validQualifications}
                      <strong>{valid}</strong>
                    </span>
                    <span>
                      <i className="dot amber" />
                      {t.health.pendingReview}
                      <strong>{pending.length}</strong>
                    </span>
                    <span>
                      <i className="dot red" />
                      {t.health.expired}
                      <strong>{expired.length}</strong>
                    </span>
                  </div>
                  <p className="health-footnote">{t.health.footnote}</p>
                </section>
              </div>
              <div className="overview-grid">
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>{t.yourPeople.title}</h2>
                      <p>{t.yourPeople.subtitle}</p>
                    </div>
                    <Link className="text-link" href="/workspace/employees">
                      {t.yourPeople.allEmployees} <ArrowRight size={15} />
                    </Link>
                  </div>
                  {employeeTable(data.employees.slice(0, 5), true)}
                </section>
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>{t.activity.title}</h2>
                      <p>{t.activity.subtitle}</p>
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
                        title={t.activity.none}
                        description={t.activity.noneDesc}
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
                  <h3>{t.banner.title}</h3>
                  <p>{t.banner.desc}</p>
                </div>
                <Link className="button" href="/workspace/passports">
                  {t.banner.open} <ArrowRight size={16} />
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
                    aria-label={t.employees.searchLabel}
                    placeholder={t.employees.searchPlaceholder}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <select
                  aria-label={t.employees.statusLabel}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">{t.employees.allStatuses}</option>
                  <option value="active">{t.status.active}</option>
                  <option value="inactive">{t.status.inactive}</option>
                </select>
                <span className="muted push-right">
                  {t.employees.count(filtered.length)}
                </span>
              </div>
              {employeeTable(filtered.slice((page - 1) * 10, page * 10))}
              <div className="table-footer">
                <span>
                  {t.employees.showing(
                    filtered.length ? (page - 1) * 10 + 1 : 0,
                    Math.min(page * 10, filtered.length),
                    filtered.length,
                  )}
                </span>
                <div>
                  <button
                    className="button small"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {t.common.previous}
                  </button>
                  <span>{t.common.page(page)}</span>
                  <button
                    className="button small"
                    disabled={page * 10 >= filtered.length}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t.common.next}
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
                title={t.employees.notFound}
                description={t.employees.notFoundDesc}
              />
            ))}
          {view === "matrix" && (
            <section className="card">
              <div className="toolbar">
                <div className="search-input">
                  <Search size={17} />
                  <input
                    aria-label={t.matrix.searchLabel}
                    placeholder={t.matrix.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="matrix-legend">
                  <span>
                    <i className="dot teal" />
                    {t.matrix.legendValid}
                  </span>
                  <span>
                    <i className="dot amber" />
                    {t.matrix.legendExpiringPending}
                  </span>
                  <span>
                    <i className="dot red" />
                    {t.matrix.legendExpiredRevoked}
                  </span>
                  <span>{t.matrix.notRecorded}</span>
                </div>
              </div>
              <div className="table-scroll">
                <table className="matrix">
                  <thead>
                    <tr>
                      <th>{t.table.employee}</th>
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
                                  title={`${q.name}: ${statusLabel(q.status, t)}, ${verificationLabel(q.verification, t)}. ${dateLabel(q.expiresOn)}`}
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
                                  <span>{matrixCellLabel(q, t)}</span>
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
              <div className="table-footer">{t.matrix.footer}</div>
            </section>
          )}
          {view === "competencies" && (
            <>
              <div className="toolbar standalone">
                <div className="search-input">
                  <Search size={17} />
                  <input
                    aria-label={t.competencies.searchLabel}
                    placeholder={t.competencies.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <span className="muted">
                  {t.competencies.count(data.competencies.length)}
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
                        <p>{c.description || t.competencies.noDescription}</p>
                        <div className="competency-bottom">
                          <span>
                            <strong>
                              {new Set(records.map((q) => q.employeeId)).size}
                            </strong>{" "}
                            {t.competencies.employeesCount}
                          </span>
                          <span className="muted">
                            {
                              records.filter(
                                (q) => q.status === "Expiring soon",
                              ).length
                            }{" "}
                            {t.competencies.expiringSoonCount}
                          </span>
                        </div>
                      </section>
                    );
                  })}
              </div>
              {!data.competencies.length && (
                <Empty
                  title={t.competencies.buildCatalogue}
                  description={t.competencies.buildCatalogueDesc}
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
                    aria-label={t.documents.searchLabel}
                    placeholder={t.documents.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <span className="muted push-right">
                  {t.documents.uploadFromProfile}
                </span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{t.documents.document}</th>
                      <th>{t.table.employee}</th>
                      <th>{t.documents.type}</th>
                      <th>{t.documents.added}</th>
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
                          <td>{t.documents.diplomaCertificate}</td>
                          <td>{dateLabel(d.createdAt)}</td>
                          <td>
                            <a
                              className="button small"
                              href={"/api/documents/" + d.id}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t.documents.open} <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!data.documents.some((d) => d.kind === "DIPLOMA") && (
                <Empty
                  title={t.documents.noDiplomas}
                  description={t.documents.noDiplomasDesc}
                />
              )}
            </section>
          )}
          {view === "passports" && (
            <>
              <div className="info-banner">
                <ShieldCheck size={20} />
                <div>
                  <strong>{t.passports.openAccess}</strong>
                  <p>{t.passports.openAccessDesc}</p>
                </div>
              </div>
              <div className="toolbar standalone">
                <div className="search-input">
                  <Search size={17} />
                  <input
                    aria-label={t.passports.searchLabel}
                    placeholder={t.passports.searchPlaceholder}
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
                          {t.passports.viewPassport}
                        </a>
                        <a
                          className="button primary"
                          href={"/label/" + e.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Printer size={15} />
                          {t.passports.printLabel}
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
              title={t.errors.pageNotFound}
              description={t.errors.pageNotFoundDesc}
            />
          )}
          <footer className="workspace-footer">
            <span>
              skills. <span className="muted">{t.footer.brand}</span>
            </span>
            <span>{t.footer.hrWorkspace(data.company.name)}</span>
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
  const { t } = useLocale();
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
        <Badge tone={activeTone(e.active)}>{activeLabel(e.active, t)}</Badge>
        <div className="summary-actions">
          {hr && (
            <button
              className="button"
              onClick={() => setDialog({ type: "employee", employee: e })}
            >
              <Pencil size={15} />
              {t.detail.editProfile}
            </button>
          )}
          <a
            className="button primary"
            href={"/p/" + e.qrToken}
            target="_blank"
            rel="noreferrer"
          >
            <QrCode size={16} />
            {t.detail.publicPassport} <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <div className="detail-grid">
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>
                {t.detail.qualifications}{" "}
                <span className="count">{qs.length}</span>
              </h2>
              <p>{t.detail.qualificationsDesc}</p>
            </div>
            {hr && (
              <button
                className="button primary small"
                onClick={() =>
                  setDialog({ type: "qualification", employee: e })
                }
              >
                <Plus size={15} />
                {t.detail.addQualification}
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
                  <Badge tone={statusTone(q.status)}>
                    {statusLabel(q.status, t)}
                  </Badge>
                </div>
                <div className="qualification-meta">
                  <span>
                    {t.detail.validFrom}
                    <strong>{dateLabel(q.validFrom)}</strong>
                  </span>
                  <span>
                    {t.detail.validUntil}
                    <strong>{dateLabel(q.expiresOn)}</strong>
                  </span>
                  <span>
                    {t.detail.verification}
                    <Badge tone={verificationTone(q.verification)}>
                      {verificationLabel(q.verification, t)}
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
                      {t.detail.uploadDiploma}
                    </button>
                    {q.verification === "PENDING" && (
                      <button
                        className="text-button"
                        onClick={() =>
                          setDialog({
                            type: "confirm",
                            title: t.detail.verifyTitle,
                            description: t.detail.verifyDesc(q.name),
                            path: "qualifications/" + q.id,
                            body: { verification: "VERIFIED" },
                          })
                        }
                      >
                        <Check size={14} />
                        {t.detail.markVerified}
                      </button>
                    )}
                    {!q.revoked && (
                      <button
                        className="text-button danger-text"
                        onClick={() =>
                          setDialog({
                            type: "confirm",
                            title: t.detail.revokeTitle,
                            description: t.detail.revokeDesc(q.name),
                            path: "qualifications/" + q.id,
                            body: { revoked: true },
                          })
                        }
                      >
                        <Ban size={14} />
                        {t.detail.revoke}
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
          {!qs.length && (
            <Empty
              title={t.detail.noQualifications}
              description={t.detail.noQualificationsDesc}
            />
          )}
        </section>
        <aside className="detail-aside">
          <section className="card">
            <div className="card-heading">
              <h2>{t.detail.employeePhotograph}</h2>
            </div>
            <div className="photo-panel">
              <Avatar name={e.name} photoId={e.photoId} large />
              <p>
                {e.photoId ? t.detail.shownOnPassport : t.detail.addPhotoHint}
              </p>
              {hr && (
                <button
                  className="button full"
                  onClick={() => setDialog({ type: "upload", employee: e })}
                >
                  <Upload size={16} />
                  {e.photoId ? t.detail.replacePhoto : t.detail.uploadPhoto}
                </button>
              )}
            </div>
          </section>
          <section className="card">
            <div className="card-heading">
              <h2>{t.detail.helmetLabel}</h2>
              <QrCode size={18} />
            </div>
            <div className="label-panel">
              <p>{t.detail.printLabelHint}</p>
              <a
                className="button primary full"
                href={"/label/" + e.id}
                target="_blank"
                rel="noreferrer"
              >
                <Printer size={16} />
                {t.detail.openPrintLayout}
              </a>
              {hr && (
                <button
                  className="text-button"
                  onClick={() =>
                    setDialog({
                      type: "confirm",
                      title: t.detail.replaceQrTitle,
                      description: t.detail.replaceQrDesc,
                      path: "employees/" + e.id + "/rotate-qr",
                      body: {},
                    })
                  }
                >
                  <RefreshCw size={14} />
                  {t.detail.replaceQr}
                </button>
              )}
            </div>
          </section>
          <div className="info-banner compact">
            <ShieldCheck size={20} />
            <p>{t.detail.ssnHidden}</p>
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
  const { t } = useLocale();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const title =
    d.type === "employee"
      ? d.employee
        ? t.dialogs.editEmployee
        : t.dialogs.addEmployee
      : d.type === "qualification"
        ? t.dialogs.addQualification
        : d.type === "competency"
          ? t.dialogs.newCompetency
          : d.type === "upload"
            ? d.qualification
              ? t.dialogs.uploadDiploma
              : t.dialogs.uploadPhoto
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
                {t.dialogs.fullName}
                <input
                  name="name"
                  defaultValue={e?.name}
                  maxLength={120}
                  required
                  placeholder={t.dialogs.fullNamePlaceholder}
                />
              </label>
              <label>
                {t.dialogs.employeeIdSsn}
                <input
                  name="ssn"
                  defaultValue={e?.ssn}
                  maxLength={100}
                  required
                  placeholder={t.dialogs.employeeIdSsnPlaceholder}
                />
              </label>
              <label>
                {t.dialogs.jobTitle}
                <input
                  name="jobTitle"
                  defaultValue={e?.jobTitle}
                  maxLength={120}
                  required
                  placeholder={t.dialogs.jobTitlePlaceholder}
                />
              </label>
              <label>
                {t.dialogs.department}
                <input
                  name="department"
                  defaultValue={e?.department}
                  maxLength={100}
                  required
                  placeholder={t.dialogs.departmentPlaceholder}
                />
              </label>
              <label>
                {t.dialogs.site}
                <input
                  name="site"
                  defaultValue={e?.site}
                  maxLength={120}
                  required
                  placeholder={t.dialogs.sitePlaceholder}
                />
              </label>
              <label className="span-two">
                {t.dialogs.email}{" "}
                <span className="muted">{t.dialogs.optionalInternalOnly}</span>
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
                {t.dialogs.activeEmployeeCheckbox}
              </label>
              <p className="form-hint span-two">
                {t.dialogs.employeesNoAccount}
              </p>
            </div>
          )}
          {d.type === "competency" && (
            <div className="form-grid">
              <label className="span-two">
                {t.dialogs.competencyName}
                <input
                  name="name"
                  maxLength={120}
                  required
                  placeholder={t.dialogs.competencyNamePlaceholder}
                />
              </label>
              <label className="span-two">
                {t.dialogs.category}
                <input
                  name="category"
                  maxLength={80}
                  required
                  placeholder={t.dialogs.categoryPlaceholder}
                  list="categories"
                />
                <datalist id="categories">
                  <option>{t.competencies.categorySafety}</option>
                  <option>{t.competencies.categoryTechnical}</option>
                  <option>{t.competencies.categoryEquipment}</option>
                  <option>{t.competencies.categoryOnboarding}</option>
                </datalist>
              </label>
              <label className="span-two">
                {t.dialogs.description}
                <textarea name="description" maxLength={2000} rows={3} />
              </label>
            </div>
          )}
          {d.type === "qualification" && (
            <div className="form-grid">
              <p className="form-hint span-two">
                {t.dialogs.recordingForPre} <strong>{d.employee.name}</strong>
                {t.dialogs.recordingForPost}
              </p>
              <label className="span-two">
                {t.dialogs.competency}
                <select
                  name="competencyId"
                  aria-label={t.dialogs.competency}
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t.dialogs.selectCompetency}
                  </option>
                  {data.competencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="span-two">
                {t.dialogs.issuingOrg}
                <input
                  name="issuer"
                  maxLength={160}
                  required
                  placeholder={t.dialogs.issuingOrgPlaceholder}
                />
              </label>
              <label>
                {t.detail.validFrom}
                <input name="validFrom" type="date" required />
              </label>
              <label>
                {t.detail.validUntil}{" "}
                <span className="muted">{t.dialogs.optional}</span>
                <input name="expiresOn" type="date" />
              </label>
              <label className="span-two">
                {t.detail.verification}
                <select name="verification" defaultValue="PENDING">
                  <option value="PENDING">
                    {t.dialogs.verificationPending}
                  </option>
                  <option value="VERIFIED">
                    {t.dialogs.verificationVerified}
                  </option>
                </select>
              </label>
              <p className="form-hint span-two">
                {t.dialogs.leaveEndDateEmpty}
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
                  {d.qualification
                    ? t.dialogs.acceptPdfPngJpeg
                    : t.dialogs.acceptPngJpeg}{" "}
                  · {t.dialogs.upTo10mb}
                </p>
                <input
                  aria-label={t.dialogs.chooseFile}
                  type="file"
                  name="file"
                  accept={
                    d.qualification ? ".pdf,.png,.jpg,.jpeg" : ".png,.jpg,.jpeg"
                  }
                  required
                />
              </div>
              <p className="form-hint">{t.dialogs.willBeVisible}</p>
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
            {t.common.cancel}
          </button>
          <button className="button primary" disabled={busy}>
            {busy
              ? t.common.saving
              : d.type === "upload"
                ? t.dialogs.uploadFile
                : d.type === "confirm"
                  ? t.common.confirm
                  : t.common.save}
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
  const { t } = useLocale();
  const [keyName, setKeyName] = useState(t.reports.defaultKeyName),
    [copied, setCopied] = useState(false),
    [busy, setBusy] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const datasetLabel = (name: string) =>
    name === "employees"
      ? t.reports.datasetEmployees
      : name === "qualifications"
        ? t.reports.datasetQualifications
        : t.reports.datasetCompetencies;
  return (
    <div className="reports-grid">
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>{t.reports.connectWorkbook}</h2>
            <p>{t.reports.useExcel}</p>
          </div>
          <span className="feature-icon">
            <Cable size={24} />
          </span>
        </div>
        <div className="connection-steps">
          <div>
            <span>1</span>
            <section>
              <h3>{t.reports.step1Title}</h3>
              <p>
                {t.reports.step1DescPre} <strong>{data.company.name}</strong>
                {t.reports.step1DescPost}
              </p>
            </section>
          </div>
          <div>
            <span>2</span>
            <section>
              <h3>{t.reports.step2Title}</h3>
              <p>
                {t.reports.step2DescPre} <strong>Basic</strong>
                {t.reports.step2DescMid} <code>token</code>{" "}
                {t.reports.step2DescPost}
              </p>
            </section>
          </div>
          <div>
            <span>3</span>
            <section>
              <h3>{t.reports.step3Title}</h3>
              <p>
                {t.reports.step3DescPre} <code>data</code>{" "}
                {t.reports.step3DescMid}
              </p>
            </section>
          </div>
        </div>
        <div className="dataset-list">
          {["employees", "qualifications", "competencies"].map((name) => (
            <div key={name}>
              <strong>{datasetLabel(name)}</strong>
              <code>
                {origin}/api/reports/{name}?pageSize=1000
              </code>
              <button
                className="icon-button"
                aria-label={t.reports.copyUrl(datasetLabel(name))}
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
          <strong>{t.reports.moreThan1000}</strong>
          <p>{t.reports.moreThan1000Desc}</p>
          <a className="text-link" href="/excel/Skills.pq" download>
            <Download size={15} />
            {t.reports.downloadTemplate}
          </a>
        </div>
      </section>
      <div>
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>{t.reports.reportingKeys}</h2>
              <p>{t.reports.privateToAccount}</p>
            </div>
            <KeyRound size={20} />
          </div>
          <div className="key-panel">
            <label>
              {t.reports.keyName}
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
              {busy ? t.reports.creating : t.reports.createReportingKey}
            </button>
            {newToken && (
              <div className="new-key">
                <strong>{t.reports.copyYourKey}</strong>
                <p>{t.reports.shownOnce}</p>
                <code>{newToken}</code>
                <button
                  className="button full"
                  onClick={async () => {
                    await navigator.clipboard.writeText(newToken);
                    setCopied(true);
                  }}
                >
                  <Copy size={15} />
                  {copied ? t.reports.copied : t.reports.copyKey}
                </button>
              </div>
            )}
            {data.tokens.map((tk) => (
              <div className="token-row" key={tk.id}>
                <KeyRound size={17} />
                <div>
                  <strong>{tk.name}</strong>
                  <small>{t.reports.expires(dateLabel(tk.expiresAt))}</small>
                </div>
                <button
                  className="icon-button danger-text"
                  aria-label={t.reports.revokeKey(tk.name)}
                  onClick={async () => {
                    if (window.confirm(t.reports.revokeKeyConfirm)) {
                      await action("tokens/" + tk.id, "DELETE");
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
          <p>{t.reports.reportingKeysNote}</p>
        </div>
      </div>
    </div>
  );
}
