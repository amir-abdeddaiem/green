import React, { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Database,
  Globe,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Plug,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Settings,
  ChevronRight,
  ChevronDown,
  Plus,
  Zap,
  Shield,
  Users,
  Leaf,
  BarChart2,
  ArrowRight,
  Link,
  Upload,
  X,
  Lock,
  Unlock,
  Copy,
  Check,
  Table,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Info,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type ConnectorType = "rest" | "graphql" | "sql" | "csv" | "excel" | "json";
type ConnStatus = "idle" | "testing" | "connected" | "error";
type ESGPillar = "environment" | "social" | "governance";
type SyncFreq = "manual" | "hourly" | "daily" | "weekly";
type UserRole = "admin" | "user";

interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  pillar: ESGPillar;
  unit?: string;
  transform?: string;
  enabled: boolean;
}

interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  status: ConnStatus;
  config: Record<string, string>;
  mappings: FieldMapping[];
  syncFreq: SyncFreq;
  lastSync?: string;
  recordCount?: number;
  createdBy: UserRole;
  lastError?: string;
}

interface PreviewRow {
  [key: string]: string | number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CONNECTOR_META: Record<
  ConnectorType,
  { label: string; icon: React.ReactNode; color: string; fields: string[] }
> = {
  rest: {
    label: "REST API",
    icon: <Globe className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    fields: ["Base URL", "API Key", "Auth Header", "Endpoint Path"],
  },
  graphql: {
    label: "GraphQL",
    icon: <GitBranch className="w-5 h-5" />,
    color: "bg-pink-50 text-pink-700 border-pink-200",
    fields: ["Endpoint URL", "API Key", "Query", "Variables (JSON)"],
  },
  sql: {
    label: "SQL Database",
    icon: <Database className="w-5 h-5" />,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    fields: ["Host", "Port", "Database Name", "Username", "Password", "Table"],
  },
  csv: {
    label: "CSV File",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-green-50 text-green-700 border-green-200",
    fields: ["Delimiter", "Has Header Row", "Encoding"],
  },
  excel: {
    label: "Excel / XLSX",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    fields: ["Sheet Name", "Header Row Number", "Data Range"],
  },
  json: {
    label: "JSON / File URL",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-violet-50 text-violet-700 border-violet-200",
    fields: ["URL or Paste JSON", "Root Path (JSONPath)", "Auth Token"],
  },
};

const ESG_PILLARS: Record<
  ESGPillar,
  { label: string; icon: React.ReactNode; color: string; accent: string; fields: string[] }
> = {
  environment: {
    label: "Environment",
    icon: <Leaf className="w-4 h-4" />,
    color: "bg-green-100 text-green-800 border-green-300",
    accent: "text-green-600",
    fields: [
      "co2_emissions_kg",
      "energy_kwh",
      "water_m3",
      "waste_kg",
      "fuel_liters",
      "renewable_pct",
      "scope1_emissions",
      "scope2_emissions",
      "scope3_emissions",
    ],
  },
  social: {
    label: "Social",
    icon: <Users className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800 border-blue-300",
    accent: "text-blue-600",
    fields: [
      "employee_count",
      "female_employees_pct",
      "training_hours",
      "accident_rate",
      "turnover_rate",
      "local_hire_pct",
      "community_investment",
      "health_coverage_pct",
    ],
  },
  governance: {
    label: "Governance",
    icon: <Shield className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800 border-purple-300",
    accent: "text-purple-600",
    fields: [
      "board_independence_pct",
      "audit_findings",
      "compliance_score",
      "policy_violations",
      "data_breaches",
      "supplier_audits",
      "ethics_training_pct",
      "anti_corruption_score",
    ],
  },
};

const MOCK_PREVIEW: PreviewRow[] = [
  { id: 1, date: "2024-03", electricity_kwh: 12400, gas_m3: 340, employees: 87, waste_tons: 2.1 },
  { id: 2, date: "2024-04", electricity_kwh: 11800, gas_m3: 290, employees: 89, waste_tons: 1.9 },
  { id: 3, date: "2024-05", electricity_kwh: 13100, gas_m3: 310, employees: 91, waste_tons: 2.4 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PillarBadge({ pillar }: { pillar: ESGPillar }) {
  const p = ESG_PILLARS[pillar];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.color}`}>
      {p.icon} {p.label}
    </span>
  );
}

function StatusBadge({ status, error }: { status: ConnStatus; error?: string }) {
  if (status === "connected")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 border border-green-300 text-green-700 rounded-full text-xs font-bold">
        <CheckCircle2 className="w-3 h-3" /> Connected
      </span>
    );
  if (status === "testing")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold">
        <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        Testing…
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 rounded-full text-xs font-bold" title={error}>
        <AlertCircle className="w-3 h-3" /> Error
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-500 rounded-full text-xs font-bold">
      <Clock className="w-3 h-3" /> Not connected
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DatabaseIntegrationTab() {
  const userRole: UserRole = (localStorage.getItem("user_role") as UserRole) || "user";
  const isAdmin = userRole === "admin";

  // Wizard state
  const [step, setStep] = useState<"list" | "wizard-type" | "wizard-config" | "wizard-map" | "wizard-sync">("list");
  const [wizardType, setWizardType] = useState<ConnectorType>("rest");
  const [wizardConfig, setWizardConfig] = useState<Record<string, string>>({});
  const [wizardName, setWizardName] = useState("");
  const [wizardFile, setWizardFile] = useState<File | null>(null);
  const [testStatus, setTestStatus] = useState<ConnStatus>("idle");
  const [testError, setTestError] = useState("");
  const [wizardMappings, setWizardMappings] = useState<FieldMapping[]>([]);
  const [wizardSyncFreq, setWizardSyncFreq] = useState<SyncFreq>("daily");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // List state
  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: "conn-1",
      name: "ERP Principal (SAP)",
      type: "rest",
      status: "connected",
      config: { "Base URL": "https://sap.company.com/api", "API Key": "••••••••••" },
      syncFreq: "daily",
      lastSync: "Today, 06:00",
      recordCount: 1284,
      createdBy: "admin",
      mappings: [
        { id: "m1", sourceField: "elec_consommation", targetField: "energy_kwh", pillar: "environment", unit: "kWh", enabled: true },
        { id: "m2", sourceField: "nb_employes", targetField: "employee_count", pillar: "social", enabled: true },
        { id: "m3", sourceField: "audit_score", targetField: "compliance_score", pillar: "governance", enabled: true },
      ],
    },
  ]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──

  const addMapping = () => {
    setWizardMappings((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sourceField: "",
        targetField: "",
        pillar: "environment",
        unit: "",
        enabled: true,
      },
    ]);
  };

  const updateMapping = (id: string, key: keyof FieldMapping, val: string | boolean) => {
    setWizardMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [key]: val } : m))
    );
  };

  const handleTest = async () => {
    setTestStatus("testing");
    setTestError("");
    await new Promise((r) => setTimeout(r, 2000));
    const success = Math.random() > 0.2;
    if (success) {
      setTestStatus("connected");
    } else {
      setTestStatus("error");
      setTestError("Connection refused: check your credentials or URL.");
    }
  };

  const handlePreview = async () => {
    setLoadingPreview(true);
    setPreviewOpen(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPreviewData(MOCK_PREVIEW);
    setLoadingPreview(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setWizardFile(e.target.files[0]);
  };

  const handleSave = () => {
    const newConn: Connector = {
      id: `conn-${Date.now()}`,
      name: wizardName || `${CONNECTOR_META[wizardType].label} Integration`,
      type: wizardType,
      status: testStatus === "connected" ? "connected" : "idle",
      config: wizardConfig,
      mappings: wizardMappings,
      syncFreq: wizardSyncFreq,
      createdBy: userRole,
      lastSync: testStatus === "connected" ? "Just now" : undefined,
      recordCount: testStatus === "connected" ? Math.floor(Math.random() * 2000 + 100) : undefined,
    };
    setConnectors((prev) => [newConn, ...prev]);
    resetWizard();
  };

  const resetWizard = () => {
    setStep("list");
    setWizardType("rest");
    setWizardConfig({});
    setWizardName("");
    setWizardFile(null);
    setTestStatus("idle");
    setTestError("");
    setWizardMappings([]);
    setWizardSyncFreq("daily");
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    await new Promise((r) => setTimeout(r, 2200));
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, lastSync: "Just now", recordCount: (c.recordCount || 0) + Math.floor(Math.random() * 50) }
          : c
      )
    );
    setSyncing(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ── ESG coverage stats ──
  const allMappings = connectors.flatMap((c) => c.mappings.filter((m) => m.enabled));
  const esgCoverage = {
    environment: allMappings.filter((m) => m.pillar === "environment").length,
    social: allMappings.filter((m) => m.pillar === "social").length,
    governance: allMappings.filter((m) => m.pillar === "governance").length,
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-12 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-green-900">
            Data Integrations
          </h1>
          <p className="text-green-700 text-sm md:text-base mt-1">
            Connect your ERP, databases & files — map any field to ESG indicators automatically
          </p>
        </div>
        {step === "list" && (
          <button
            onClick={() => setStep("wizard-type")}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            New Integration
          </button>
        )}
        {step !== "list" && (
          <button
            onClick={resetWizard}
            className="flex items-center gap-2 px-4 py-2 text-green-700 border border-green-300 rounded-lg hover:bg-green-50 text-sm font-semibold"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>

      {/* ── ESG Coverage Summary (list view) ── */}
      {step === "list" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["environment", "social", "governance"] as ESGPillar[]).map((p) => {
            const cfg = ESG_PILLARS[p];
            return (
              <Card key={p} className="p-4 border border-green-200 rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <span className="text-xs font-bold text-green-800 uppercase tracking-widest">{cfg.label}</span>
                </div>
                <p className="text-3xl font-black text-green-900">{esgCoverage[p]}</p>
                <p className="text-xs text-green-600 mt-0.5">mapped fields active</p>
                <div className="mt-2 h-1.5 bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (esgCoverage[p] / cfg.fields.length) * 100)}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          WIZARD
      ═══════════════════════════════════════════════════════ */}

      {step !== "list" && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            {["wizard-type", "wizard-config", "wizard-map", "wizard-sync"].map((s, i) => {
              const steps = ["wizard-type", "wizard-config", "wizard-map", "wizard-sync"];
              const current = steps.indexOf(step);
              const done = i < current;
              const active = i === current;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      done
                        ? "bg-green-600 border-green-600 text-white"
                        : active
                        ? "border-green-600 text-green-700 bg-green-50"
                        : "border-green-200 text-green-300 bg-white"
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-0.5 rounded-full ${done ? "bg-green-500" : "bg-green-100"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-green-500 uppercase tracking-wider px-1">
            <span>Source Type</span>
            <span>Configure</span>
            <span>Map Fields</span>
            <span>Sync</span>
          </div>

          {/* ── STEP 1: Choose type ── */}
          {step === "wizard-type" && (
            <Card className="p-6 border border-green-200 rounded-xl bg-white space-y-5">
              <h2 className="text-xl font-black text-green-900">Choose your data source</h2>
              <p className="text-sm text-green-600">Select the type of connection you want to establish</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(CONNECTOR_META) as ConnectorType[]).map((t) => {
                  const meta = CONNECTOR_META[t];
                  const active = wizardType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setWizardType(t)}
                      className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        active
                          ? "border-green-600 bg-green-50 shadow-md scale-[1.02]"
                          : "border-green-200 bg-white hover:border-green-400 hover:bg-green-50"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${meta.color}`}>
                        {meta.icon}
                      </div>
                      <span className="text-sm font-bold text-green-900">{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                  Integration Name
                </label>
                <input
                  value={wizardName}
                  onChange={(e) => setWizardName(e.target.value)}
                  placeholder={`e.g. ${wizardType === "sql" ? "SAP Production DB" : wizardType === "rest" ? "ERP REST API" : "Monthly Export"}`}
                  className="w-full px-4 py-2.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep("wizard-config")}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Card>
          )}

          {/* ── STEP 2: Configure ── */}
          {step === "wizard-config" && (
            <Card className="p-6 border border-green-200 rounded-xl bg-white space-y-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${CONNECTOR_META[wizardType].color}`}>
                  {CONNECTOR_META[wizardType].icon}
                </div>
                <div>
                  <h2 className="text-xl font-black text-green-900">Configure {CONNECTOR_META[wizardType].label}</h2>
                  <p className="text-xs text-green-600">{wizardName || "New integration"}</p>
                </div>
              </div>

              {/* File upload for CSV / Excel */}
              {(wizardType === "csv" || wizardType === "excel") && (
                <div>
                  <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                    Upload File
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-green-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept={wizardType === "csv" ? ".csv,.txt" : ".xlsx,.xls,.ods"}
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Upload className="w-7 h-7 text-green-400" />
                    {wizardFile ? (
                      <p className="text-sm font-bold text-green-700">{wizardFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-green-700">
                          Drop your {wizardType === "csv" ? "CSV" : "Excel"} file here
                        </p>
                        <p className="text-xs text-green-500">
                          {wizardType === "csv" ? ".csv, .txt" : ".xlsx, .xls, .ods"} supported
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* JSON paste */}
              {wizardType === "json" && (
                <div>
                  <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                    Paste JSON or enter URL
                  </label>
                  <textarea
                    rows={5}
                    value={wizardConfig["URL or Paste JSON"] || ""}
                    onChange={(e) =>
                      setWizardConfig((p) => ({ ...p, "URL or Paste JSON": e.target.value }))
                    }
                    placeholder={'{"data": [...]} or https://api.company.com/data.json'}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              )}

              {/* GraphQL query */}
              {wizardType === "graphql" && (
                <>
                  {["Endpoint URL", "API Key"].map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                        {field}
                      </label>
                      <input
                        type={field.toLowerCase().includes("key") ? "password" : "text"}
                        value={wizardConfig[field] || ""}
                        onChange={(e) => setWizardConfig((p) => ({ ...p, [field]: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={field === "Endpoint URL" ? "https://api.company.com/graphql" : "Bearer token or API key"}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                      GraphQL Query
                    </label>
                    <textarea
                      rows={4}
                      value={wizardConfig["Query"] || ""}
                      onChange={(e) => setWizardConfig((p) => ({ ...p, Query: e.target.value }))}
                      placeholder={"query {\n  emissions {\n    date\n    electricity_kwh\n  }\n}"}
                      className="w-full px-4 py-3 border border-green-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Generic fields for REST / SQL */}
              {(wizardType === "rest" || wizardType === "sql" || (wizardType !== "graphql" && wizardType !== "json" && wizardType !== "csv" && wizardType !== "excel")) &&
                CONNECTOR_META[wizardType].fields.map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                      {field}
                    </label>
                    <input
                      type={
                        field.toLowerCase().includes("password") || field.toLowerCase().includes("key")
                          ? "password"
                          : field.toLowerCase().includes("port")
                          ? "number"
                          : "text"
                      }
                      value={wizardConfig[field] || ""}
                      onChange={(e) => setWizardConfig((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={
                        field === "Base URL" ? "https://erp.company.com/api" :
                        field === "Endpoint Path" ? "/v1/emissions" :
                        field === "Host" ? "db.company.com" :
                        field === "Port" ? "5432" : ""
                      }
                    />
                  </div>
                ))
              }

              {/* Role restriction notice */}
              {!isAdmin && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <strong>User mode:</strong> You can configure the source but an Admin must approve before syncing begins.
                  </p>
                </div>
              )}

              {/* Test connection */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTest}
                  disabled={testStatus === "testing"}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-green-600 text-green-700 font-bold rounded-lg hover:bg-green-50 transition-all disabled:opacity-50"
                >
                  {testStatus === "testing" ? (
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plug className="w-4 h-4" />
                  )}
                  {testStatus === "testing" ? "Testing…" : "Test Connection"}
                </button>
                <StatusBadge status={testStatus} error={testError} />
              </div>

              {testStatus === "connected" && (
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 text-xs text-green-600 hover:text-green-800 font-semibold underline underline-offset-2"
                >
                  <Table className="w-3.5 h-3.5" />
                  Preview fetched data
                </button>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep("wizard-type")} className="px-4 py-2 text-green-600 border border-green-200 rounded-lg text-sm font-semibold hover:bg-green-50">
                  ← Back
                </button>
                <button
                  onClick={() => setStep("wizard-map")}
                  disabled={wizardType !== "csv" && wizardType !== "excel" && wizardType !== "json" && testStatus !== "connected"}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Card>
          )}

          {/* ── STEP 3: Map Fields ── */}
          {step === "wizard-map" && (
            <Card className="p-6 border border-green-200 rounded-xl bg-white space-y-5">
              <div>
                <h2 className="text-xl font-black text-green-900">Map Fields to ESG Indicators</h2>
                <p className="text-sm text-green-600">
                  Link your source columns to the 3 ESG pillars: Environment, Social, Governance
                </p>
              </div>

              {/* Pillar legend */}
              <div className="flex flex-wrap gap-2">
                {(["environment", "social", "governance"] as ESGPillar[]).map((p) => (
                  <PillarBadge key={p} pillar={p} />
                ))}
              </div>

              {/* Mapping rows */}
              <div className="space-y-3">
                {wizardMappings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-green-200 rounded-xl gap-2">
                    <ArrowRight className="w-6 h-6 text-green-300" />
                    <p className="text-sm text-green-500">No mappings yet — add your first field below</p>
                  </div>
                )}
                {wizardMappings.map((m) => (
                  <div key={m.id} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border transition-all ${m.enabled ? "border-green-200 bg-green-50/40" : "border-green-100 bg-gray-50 opacity-60"}`}>
                    {/* Source field */}
                    <div className="col-span-3">
                      <input
                        value={m.sourceField}
                        onChange={(e) => updateMapping(m.id, "sourceField", e.target.value)}
                        placeholder="Source column"
                        className="w-full px-2 py-1.5 border border-green-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                      />
                    </div>

                    {/* Arrow */}
                    <div className="col-span-1 flex justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-green-400" />
                    </div>

                    {/* Pillar */}
                    <div className="col-span-2">
                      <select
                        value={m.pillar}
                        onChange={(e) => updateMapping(m.id, "pillar", e.target.value)}
                        className="w-full px-2 py-1.5 border border-green-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                      >
                        <option value="environment">🌿 Env</option>
                        <option value="social">👥 Social</option>
                        <option value="governance">🛡 Gov</option>
                      </select>
                    </div>

                    {/* Target field */}
                    <div className="col-span-3">
                      <select
                        value={m.targetField}
                        onChange={(e) => updateMapping(m.id, "targetField", e.target.value)}
                        className="w-full px-2 py-1.5 border border-green-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                      >
                        <option value="">— ESG field —</option>
                        {ESG_PILLARS[m.pillar].fields.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Unit */}
                    <div className="col-span-2">
                      <input
                        value={m.unit || ""}
                        onChange={(e) => updateMapping(m.id, "unit", e.target.value)}
                        placeholder="unit"
                        className="w-full px-2 py-1.5 border border-green-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                      />
                    </div>

                    {/* Toggle + delete */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => updateMapping(m.id, "enabled", !m.enabled)}
                        className={m.enabled ? "text-green-600" : "text-gray-400"}
                      >
                        {m.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => setWizardMappings((prev) => prev.filter((x) => x.id !== m.id))}
                        className="text-green-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addMapping}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-xl text-sm font-bold hover:border-green-500 hover:bg-green-50 transition-all w-full justify-center"
              >
                <Plus className="w-4 h-4" /> Add Field Mapping
              </button>

              {/* Quick-suggest */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-green-800">AI Field Suggestions</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    After connecting, our AI will auto-suggest mappings based on your column names. You can accept or override them.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep("wizard-config")} className="px-4 py-2 text-green-600 border border-green-200 rounded-lg text-sm font-semibold hover:bg-green-50">
                  ← Back
                </button>
                <button
                  onClick={() => setStep("wizard-sync")}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Card>
          )}

          {/* ── STEP 4: Sync settings + save ── */}
          {step === "wizard-sync" && (
            <Card className="p-6 border border-green-200 rounded-xl bg-white space-y-5">
              <h2 className="text-xl font-black text-green-900">Sync & Permissions</h2>

              {/* Sync frequency */}
              <div>
                <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                  Sync Frequency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["manual", "hourly", "daily", "weekly"] as SyncFreq[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setWizardSyncFreq(f)}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-bold capitalize transition-all ${
                        wizardSyncFreq === f
                          ? "border-green-600 bg-green-50 text-green-900"
                          : "border-green-200 text-green-600 hover:border-green-400"
                      }`}
                    >
                      {f === "manual" ? "🖱 Manual" : f === "hourly" ? "⏱ Hourly" : f === "daily" ? "📅 Daily" : "📆 Weekly"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role permissions */}
              <div>
                <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-3">
                  Access Permissions
                </label>
                <div className="space-y-2">
                  {[
                    { icon: <Lock className="w-4 h-4 text-green-700" />, label: "Admin", desc: "Full access: configure, sync, delete, approve", always: true },
                    { icon: <Unlock className="w-4 h-4 text-blue-600" />, label: "User", desc: "Can view data and trigger manual sync. Cannot edit config.", always: false },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        {row.icon}
                        <div>
                          <p className="text-sm font-bold text-green-900">{row.label}</p>
                          <p className="text-xs text-green-600">{row.desc}</p>
                        </div>
                      </div>
                      {row.always ? (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">Always</span>
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-green-50 border border-green-300 rounded-xl space-y-2">
                <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-green-600">Name: </span><span className="font-bold text-green-900">{wizardName || "—"}</span></div>
                  <div><span className="text-green-600">Type: </span><span className="font-bold text-green-900">{CONNECTOR_META[wizardType].label}</span></div>
                  <div><span className="text-green-600">Mappings: </span><span className="font-bold text-green-900">{wizardMappings.filter(m => m.enabled).length} active</span></div>
                  <div><span className="text-green-600">Sync: </span><span className="font-bold text-green-900 capitalize">{wizardSyncFreq}</span></div>
                  <div><span className="text-green-600">Status: </span><StatusBadge status={testStatus} /></div>
                  <div>
                    <span className="text-green-600">ESG: </span>
                    <span className="font-bold text-green-900">
                      {[...new Set(wizardMappings.filter(m => m.enabled).map(m => m.pillar))].length} / 3 pillars
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep("wizard-map")} className="px-4 py-2 text-green-600 border border-green-200 rounded-lg text-sm font-semibold hover:bg-green-50">
                  ← Back
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Integration
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          CONNECTORS LIST
      ═══════════════════════════════════════════════════════ */}

      {step === "list" && (
        <div className="space-y-4">
          {connectors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border-2 border-dashed border-green-200 rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <Database className="w-7 h-7 text-green-300" />
              </div>
              <p className="text-green-700 font-semibold">No integrations yet</p>
              <p className="text-green-500 text-sm max-w-xs">Connect your first ERP, database or file to start mapping ESG data automatically.</p>
              <button onClick={() => setStep("wizard-type")} className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                <Plus className="w-4 h-4" /> Add Integration
              </button>
            </div>
          ) : (
            connectors.map((conn) => (
              <Card key={conn.id} className="border border-green-200 rounded-xl bg-white overflow-hidden">
                {/* Row header */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${CONNECTOR_META[conn.type].color}`}>
                    {CONNECTOR_META[conn.type].icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-green-900 text-sm">{conn.name}</p>
                      <span className="text-[10px] bg-green-100 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                        {CONNECTOR_META[conn.type].label}
                      </span>
                      {conn.createdBy === "admin" && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <StatusBadge status={conn.status} error={conn.lastError} />
                      {conn.lastSync && <span className="text-xs text-green-500">Last sync: {conn.lastSync}</span>}
                      {conn.recordCount && <span className="text-xs text-green-500">{conn.recordCount.toLocaleString()} records</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Sync */}
                    <button
                      onClick={() => handleSync(conn.id)}
                      disabled={syncing === conn.id || conn.status !== "connected"}
                      className="p-2 text-green-400 hover:text-green-700 hover:bg-green-100 rounded-lg border border-green-200 transition-colors disabled:opacity-30"
                      title="Sync now"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing === conn.id ? "animate-spin" : ""}`} />
                    </button>

                    {/* Expand */}
                    <button
                      onClick={() => setExpandedId(expandedId === conn.id ? null : conn.id)}
                      className="p-2 text-green-400 hover:text-green-700 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                      title="View mappings"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === conn.id ? "rotate-180" : ""}`} />
                    </button>

                    {/* Delete — admin only or own */}
                    {(isAdmin || conn.createdBy === userRole) && (
                      <button
                        onClick={() => setDeleteId(conn.id)}
                        className="p-2 text-green-300 hover:text-red-500 hover:bg-red-50 rounded-lg border border-green-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded mappings */}
                {expandedId === conn.id && (
                  <div className="border-t border-green-100 px-6 py-4 bg-green-50/30 space-y-3">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider">ESG Field Mappings</p>
                    {conn.mappings.length === 0 ? (
                      <p className="text-xs text-green-500 italic">No field mappings configured.</p>
                    ) : (
                      <div className="space-y-2">
                        {conn.mappings.map((m) => (
                          <div key={m.id} className="flex items-center gap-3 flex-wrap">
                            <code className="text-xs bg-white border border-green-200 px-2 py-1 rounded font-mono text-green-800">{m.sourceField}</code>
                            <ArrowRight className="w-3 h-3 text-green-400 flex-shrink-0" />
                            <code className="text-xs bg-white border border-green-200 px-2 py-1 rounded font-mono text-green-800">{m.targetField}</code>
                            {m.unit && <span className="text-[10px] text-green-500 font-bold">[{m.unit}]</span>}
                            <PillarBadge pillar={m.pillar} />
                            {!m.enabled && <span className="text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded-full font-bold">disabled</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Stats */}
      {step === "list" && connectors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Active Connectors</p>
            <p className="text-2xl font-black text-green-900">{connectors.filter(c => c.status === "connected").length}</p>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Total Records Synced</p>
            <p className="text-2xl font-black text-green-900">{connectors.reduce((s, c) => s + (c.recordCount || 0), 0).toLocaleString()}</p>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Active Field Mappings</p>
            <p className="text-2xl font-black text-green-900">{connectors.flatMap(c => c.mappings.filter(m => m.enabled)).length}</p>
          </Card>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-green-300 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-green-700" />
                <h3 className="font-bold text-green-900">Data Preview</h3>
                <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full font-bold">First 3 rows</span>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="p-1.5 rounded-lg text-green-500 hover:bg-green-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              {loadingPreview ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-green-600 text-sm">Fetching data…</span>
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      {Object.keys(previewData[0] || {}).map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-bold text-green-800 border border-green-200">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="hover:bg-green-50">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 font-mono text-green-700 border border-green-200">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-green-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Delete Integration</h3>
                <p className="text-sm text-green-700 mt-1">
                  This will remove the connector and all its field mappings. Historical synced data is preserved.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 text-green-700 hover:bg-green-100 rounded-lg font-semibold border border-green-300 text-sm">
                Cancel
              </button>
              <button
                onClick={() => {
                  setConnectors((prev) => prev.filter((c) => c.id !== deleteId));
                  setDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}