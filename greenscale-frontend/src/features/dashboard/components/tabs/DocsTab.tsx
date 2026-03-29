import { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { apiUrl } from "@/config/api";
import {
  Upload,
  FileText,
  Scan,
  Trash2,
  AlertCircle,
  Zap,
  FileImage,
  File,
  X,
  Camera,
  Building2,
  Receipt,
  ScrollText,
  ChevronRight,
  Loader2,
} from "lucide-react";

type DocumentCategory = "invoice" | "company" | "report" | "other";
type ScanStatus = "idle" | "scanning" | "done" | "error";
type DocStatus = "processing" | "ready" | "error";

interface ScannedDocument {
  id: number;
  name: string;
  category: DocumentCategory;
  size: string;
  uploadedAt: string;
  status: DocStatus;
  extractedData?: {
    totalAmount?: string;
    date?: string;
    vendor?: string;
    co2Equivalent?: string;
    activityValue?: number;
    activityUnit?: string;
    activityType?: string;
    consumptionRows?: Array<{
      libelle: string;
      consommation: string | null;
      montant: string | null;
      periode: string | null;
    }>;
    invoiceType?: string;
    invoicePeriod?: string;
    confidence?: number;
  };
  previewUrl?: string;
  fileType: "pdf" | "image" | "other";
  errorMessage?: string;
}

interface SavedExtractedDoc {
  id: number;
  document_id: number;
  filename: string;
  category: DocumentCategory;
  created_at: string | null;
  extractedData: ScannedDocument["extractedData"] | null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, ".").replace(/\s+/g, " ").trim();
    const match = normalized.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;
    const n = Number(match[0]);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

type EmissionType = "Electricity" | "Natural Gas" | "Fuel" | "Waste";

function deriveEmissionFromExtractedData(
  extracted: ScannedDocument["extractedData"],
): { type: EmissionType; value: number; unit: string } {
  if (!extracted) {
    throw new Error("Aucune donnée extraite disponible");
  }

  const activityType = extracted.activityType;
  const activityValue = toNumber(extracted.activityValue);
  const activityUnit = typeof extracted.activityUnit === "string" ? extracted.activityUnit : null;

  const mapActivity = (at: string): { type: EmissionType; defaultUnit: string } => {
    switch (at) {
      case "electricity_kwh":
        return { type: "Electricity", defaultUnit: "kWh" };
      case "natural_gas_m3":
        return { type: "Natural Gas", defaultUnit: "m³" };
      case "diesel_l":
      case "petrol_l":
        return { type: "Fuel", defaultUnit: "Liters" };
      case "waste_kg":
        return { type: "Waste", defaultUnit: "kg" };
      case "water_m3":
      case "transport_km":
        throw new Error(
          "Type d’activité non pris en charge pour l’export automatique (eau/transport). Veuillez l’ajouter manuellement."
        );
      default:
        throw new Error("Type d’activité inconnu — impossible d’exporter automatiquement");
    }
  };

  if (typeof activityType === "string" && activityType) {
    const mapped = mapActivity(activityType);
    const unit = activityUnit || mapped.defaultUnit;

    if (activityValue !== null && activityValue > 0) {
      return { type: mapped.type, value: activityValue, unit };
    }

    // Fallback: sum consumptionRows when activityValue is missing.
    const rows = Array.isArray(extracted.consumptionRows) ? extracted.consumptionRows : [];
    const sum = rows.reduce((acc, r) => {
      const n = toNumber(r?.consommation);
      return acc + (n ?? 0);
    }, 0);
    if (sum > 0) {
      return { type: mapped.type, value: sum, unit };
    }

    throw new Error(
      "Valeur de consommation introuvable (ni activityValue, ni lignes consommation)."
    );
  }

  throw new Error(
    "activityType manquant dans l’extraction — impossible de déterminer le type d’émission automatiquement"
  );
}

const CATEGORY_CONFIG: Record<
  DocumentCategory,
  { label: string; icon: React.ReactNode; color: string; description: string }
> = {
  invoice: {
    label: "Facture",
    icon: <Receipt className="w-5 h-5" />,
    color: "bg-green-100 text-green-700 border-green-300",
    description: "Factures d’énergie, factures fournisseurs",
  },
  company: {
    label: "Document d’entreprise",
    icon: <Building2 className="w-5 h-5" />,
    color: "bg-green-100 text-green-700 border-green-300",
    description: "Documents d’entreprise, contrats",
  },
  report: {
    label: "Rapport",
    icon: <ScrollText className="w-5 h-5" />,
    color: "bg-teal-100 text-teal-700 border-teal-300",
    description: "Rapports d’audit, certifications",
  },
  other: {
    label: "Autre",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-lime-100 text-lime-700 border-lime-300",
    description: "Documents divers",
  },
};

async function extractFromDocument(
  file: File,
  category: DocumentCategory,
  businessId: string | null
): Promise<ScannedDocument["extractedData"]> {
  if (!businessId) {
    throw new Error("business_id manquant (veuillez vous reconnecter)");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("business_id", businessId);
  formData.append("category", category);

  const response = await fetch(apiUrl("/documents/scan"), {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    const message =
      (data && typeof data.detail === "string" && data.detail) ||
      "Échec de l’extraction OCR";
    throw new Error(message);
  }

  return (data?.extractedData || null) as ScannedDocument["extractedData"];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(file: File): "pdf" | "image" | "other" {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "other";
}

function getFileTypeFromFilename(filename: string): "pdf" | "image" | "other" {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".tif") ||
    lower.endsWith(".tiff") ||
    lower.endsWith(".heic")
  )
    return "image";
  return "other";
}

function FileTypeIcon({
  type,
  className,
}: {
  type: "pdf" | "image" | "other";
  className?: string;
}) {
  if (type === "pdf") return <FileText className={className} />;
  if (type === "image") return <FileImage className={className} />;
  return <File className={className} />;
}

export function DocumentScannerTab() {
  const businessId = localStorage.getItem("user_id");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<DocumentCategory>("invoice");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [previewDoc, setPreviewDoc] = useState<ScannedDocument | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [savedExtracts, setSavedExtracts] = useState<SavedExtractedDoc[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [lastScanError, setLastScanError] = useState<string | null>(null);
  const [isExportingEmission, setIsExportingEmission] = useState(false);
  const [exportEmissionError, setExportEmissionError] = useState<string | null>(null);

  const refreshSavedExtracts = useCallback(async () => {
    if (!businessId) {
      setSavedExtracts([]);
      setSavedError("business_id manquant (veuillez vous reconnecter)");
      return;
    }

    setSavedLoading(true);
    setSavedError(null);
    try {
      const resp = await fetch(
        apiUrl(`/documents/extracted?business_id=${encodeURIComponent(businessId)}&limit=50`)
      );
      const data = (await resp.json().catch(() => null)) as any;
      if (!resp.ok) {
        const message =
          (data && typeof data.detail === "string" && data.detail) ||
          "Impossible de charger les extractions enregistrées";
        throw new Error(message);
      }

      const items = Array.isArray(data?.items) ? data.items : [];
      const normalized: SavedExtractedDoc[] = items
        .map((it: any) => {
          const cat: DocumentCategory =
            it?.category === "invoice" ||
            it?.category === "company" ||
            it?.category === "report" ||
            it?.category === "other"
              ? it.category
              : "other";

          return {
            id: Number(it?.id),
            document_id: Number(it?.document_id),
            filename: String(it?.filename || "document"),
            category: cat,
            created_at: typeof it?.created_at === "string" ? it.created_at : null,
            extractedData: (it?.extractedData || null) as SavedExtractedDoc["extractedData"],
          };
        })
        .filter((it: SavedExtractedDoc) => Number.isFinite(it.id) && Number.isFinite(it.document_id));

      setSavedExtracts(normalized);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to load saved extracts", e);
      setSavedError(e instanceof Error ? e.message : "Impossible de charger les extractions enregistrées");
    } finally {
      setSavedLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    refreshSavedExtracts();
  }, [refreshSavedExtracts]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (!fileArray.length) return;

      setLastScanError(null);

      for (const file of fileArray) {
        const tempId = Date.now() + Math.random();
        const previewUrl =
          file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined;

        const newDoc: ScannedDocument = {
          id: tempId,
          name: file.name,
          category: selectedCategory,
          size: formatBytes(file.size),
          uploadedAt: new Date().toLocaleString("fr-FR", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "processing",
          fileType: getFileType(file),
          previewUrl,
        };

        setDocuments((prev) => [newDoc, ...prev]);
        setScanStatus("scanning");

        try {
          const extracted = await extractFromDocument(
            file,
            selectedCategory,
            businessId
          );
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === tempId
                ? { ...d, status: "ready", extractedData: extracted }
                : d
            )
          );
          setScanStatus("done");
          refreshSavedExtracts();
        } catch (e) {
          // Keep UI simple but make debugging possible via console.
          // (Backend error strings are already human readable.)
          // eslint-disable-next-line no-console
          console.error("Document scan failed", e);
          const message =
            e instanceof Error
              ? e.message
              : "Échec de l’analyse du document (erreur inconnue)";
          setLastScanError(message);
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === tempId ? { ...d, status: "error", errorMessage: message } : d
            )
          );
          setScanStatus("error");
        }
      }
    },
    [selectedCategory, businessId, refreshSavedExtracts]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const invoiceRows = documents.flatMap((doc) => {
    const rows = doc.extractedData?.consumptionRows;
    if (!rows || rows.length === 0) return [];
    return rows.map((r) => ({
      docId: doc.id,
      libelle: r.libelle,
      consommation: r.consommation,
      montant: r.montant,
    }));
  });

  const totalDocs = documents.length;

  const exportPreviewDocAsEmission = useCallback(async () => {
    if (!previewDoc) return;
    if (!businessId) {
      setExportEmissionError("business_id manquant (veuillez vous reconnecter)");
      return;
    }

    const numericBusinessId = Number(businessId);
    if (!Number.isFinite(numericBusinessId) || numericBusinessId <= 0) {
      setExportEmissionError("business_id invalide (veuillez vous reconnecter)");
      return;
    }

    setIsExportingEmission(true);
    setExportEmissionError(null);

    try {
      const payload = deriveEmissionFromExtractedData(previewDoc.extractedData);
      const resp = await fetch(apiUrl("/add-emission"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: numericBusinessId,
          type: payload.type,
          value: payload.value,
          unit: payload.unit,
        }),
      });

      const data = (await resp.json().catch(() => null)) as any;
      if (!resp.ok) {
        const message =
          (data && typeof data.detail === "string" && data.detail) ||
          "Impossible d’enregistrer l’émission";
        throw new Error(message);
      }

      alert(
        `✅ Émission enregistrée : ${payload.type} — ${payload.value} ${payload.unit} (impact: ${data?.impact ?? "N/A"} kg CO₂e)`
      );
      setPreviewDoc(null);
    } catch (e) {
      setExportEmissionError(
        e instanceof Error ? e.message : "Erreur inconnue lors de l’export"
      );
    } finally {
      setIsExportingEmission(false);
    }
  }, [previewDoc, businessId]);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-12 space-y-8 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-green-900">
            Scanner de documents
          </h1>
          <p className="text-green-700 text-sm md:text-base mt-1">
            Téléversez des factures et des documents d’entreprise — l’IA extrait automatiquement les données d’émissions
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-300 rounded-lg">
          <Scan className="w-4 h-4 text-green-600 animate-pulse" />
          <span className="text-xs font-semibold text-green-700 uppercase tracking-widest">
            OCR propulsé par l’IA
          </span>
        </div>
      </div>

      {scanStatus === "error" && lastScanError && (
        <div className="py-3 px-4 bg-white border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm font-semibold">Échec du scan : {lastScanError}</p>
        </div>
      )}

      {/* Saved Extractions (from DB) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
              Extractions enregistrées
            </p>
            <p className="text-green-600 text-sm">
              Elles sont enregistrées dans la table <span className="font-semibold">extracted_Doc</span>
            </p>
          </div>
          {savedLoading && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Chargement…</span>
            </div>
          )}
        </div>

        {savedError && (
          <div className="py-3 px-4 bg-white border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-semibold">{savedError}</p>
          </div>
        )}

        {savedExtracts.length > 0 ? (
          <Card className="overflow-hidden rounded-xl shadow-lg bg-white border border-green-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-50 border-b border-green-300">
                  <tr>
                    <th className="text-left px-6 py-4 font-bold text-green-900">FICHIER</th>
                    <th className="text-left px-6 py-4 font-bold text-green-900">CATÉGORIE</th>
                    <th className="text-left px-6 py-4 font-bold text-green-900">DATE</th>
                    <th className="text-left px-6 py-4 font-bold text-green-900">FOURNISSEUR</th>
                    <th className="text-left px-6 py-4 font-bold text-green-900">PÉRIODE</th>
                    <th className="text-right px-6 py-4 font-bold text-green-900">TOTAL</th>
                    <th className="text-right px-6 py-4 font-bold text-green-900">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {savedExtracts.map((it) => {
                    const vendor = it.extractedData?.vendor || "—";
                    const period = it.extractedData?.invoicePeriod || "—";
                    const total = it.extractedData?.totalAmount || "—";
                    const when = it.created_at
                      ? new Date(it.created_at).toLocaleString()
                      : "—";
                    return (
                      <tr
                        key={it.id}
                        className="border-b border-green-100 hover:bg-green-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-green-900 font-semibold">{it.filename}</td>
                        <td className="px-6 py-4 text-green-800">{CATEGORY_CONFIG[it.category].label}</td>
                        <td className="px-6 py-4 text-green-800">{when}</td>
                        <td className="px-6 py-4 text-green-800">{vendor}</td>
                        <td className="px-6 py-4 text-green-800">{period}</td>
                        <td className="px-6 py-4 text-right text-green-800">{total}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              const doc: ScannedDocument = {
                                id: it.document_id,
                                name: it.filename,
                                category: it.category,
                                size: "Enregistré",
                                uploadedAt: when,
                                status: "ready",
                                extractedData: it.extractedData || undefined,
                                previewUrl: undefined,
                                fileType: getFileTypeFromFilename(it.filename),
                              };
                              setPreviewDoc(doc);
                            }}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Voir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="py-6 px-4 bg-white border border-green-200 rounded-xl">
            <p className="text-green-700 text-sm font-semibold">Aucune extraction enregistrée pour le moment.</p>
            <p className="text-green-500 text-sm mt-1">
              Téléversez un document ci-dessus pour en créer une.
            </p>
          </div>
        )}
      </div>

      {/* Category selector */}
      <div>
        <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">
          Type de document
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(CATEGORY_CONFIG) as DocumentCategory[]).map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex flex-col gap-1.5 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  active
                    ? "border-green-600 bg-green-50 shadow-md scale-[1.02]"
                    : "border-green-200 bg-white hover:border-green-400 hover:bg-green-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cfg.color}`}
                >
                  {cfg.icon}
                </div>
                <span className="text-sm font-bold text-green-900">
                  {cfg.label}
                </span>
                <span className="text-xs text-green-600 leading-snug">
                  {cfg.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 group ${
          isDragging
            ? "border-green-600 bg-green-50 scale-[1.01]"
            : "border-green-300 hover:border-green-500 hover:bg-green-50 bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.tiff,.docx"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {/* Animated icon ring */}
        <div
          className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
            isDragging
              ? "border-green-600 bg-green-100"
              : "border-green-300 bg-green-50 group-hover:border-green-500"
          }`}
        >
          <div
            className={`absolute inset-0 rounded-full border-2 border-green-400 transition-all duration-500 ${
              isDragging ? "scale-110 opacity-60" : "scale-100 opacity-0"
            }`}
          />
          <Upload
            className={`w-8 h-8 transition-colors duration-200 ${
              isDragging ? "text-green-700" : "text-green-400 group-hover:text-green-600"
            }`}
          />
        </div>

        <div className="text-center">
          <p className="text-green-900 font-bold text-base">
            {isDragging
              ? "Relâchez pour téléverser"
              : "Déposez des fichiers ici ou cliquez pour parcourir"}
          </p>
          <p className="text-green-600 text-sm mt-1">
            PDF, JPG, PNG, WEBP — jusqu’à 20 Mo chacun
          </p>
        </div>

        {/* Category badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${CATEGORY_CONFIG[selectedCategory].color}`}
        >
          {CATEGORY_CONFIG[selectedCategory].icon}
          Sera enregistré comme : {CATEGORY_CONFIG[selectedCategory].label}
        </div>

        {/* Camera quick-upload on mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.capture = "environment";
            input.onchange = (ev) => {
              const f = (ev.target as HTMLInputElement).files;
              if (f) handleFiles(f);
            };
            input.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-md sm:hidden"
        >
          <Camera className="w-4 h-4" />
          Scanner avec la caméra
        </button>
      </div>

      {/* Extracted Data */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
              Données extraites
            </p>
            <p className="text-green-600 text-sm">
              LIBELLE / CONSOMMATION / MONTANT
            </p>
          </div>
          {scanStatus === "scanning" && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Extraction…</span>
            </div>
          )}
        </div>

        {invoiceRows.length > 0 ? (
          <Card className="overflow-hidden rounded-xl shadow-lg bg-white border border-green-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-50 border-b border-green-300">
                  <tr>
                    <th className="text-left px-6 py-4 font-bold text-green-900">
                      LIBELLE
                    </th>
                    <th className="text-right px-6 py-4 font-bold text-green-900">
                      CONSOMMATION
                    </th>
                    <th className="text-right px-6 py-4 font-bold text-green-900">
                      MONTANT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceRows.map((r, idx) => (
                    <tr
                      key={`${r.docId}-${r.libelle}-${idx}`}
                      className="border-b border-green-100 hover:bg-green-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-green-900 font-semibold">
                        {r.libelle}
                      </td>
                      <td className="px-6 py-4 text-right text-green-800">
                        {r.consommation ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-green-800">
                        {r.montant ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <FileText className="w-7 h-7 text-green-300" />
            </div>
            <p className="text-green-700 font-semibold">Aucun scan pour l’instant</p>
            <p className="text-green-500 text-sm max-w-xs">
              Téléversez une facture pour extraire les lignes.
            </p>
          </div>
        ) : scanStatus === "scanning" ? (
          <div className="flex items-center gap-3 py-6 px-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-green-700 text-sm font-semibold">
              Extraction des données de la facture…
            </span>
          </div>
        ) : (
          <div className="py-6 px-4 bg-white border border-green-200 rounded-xl">
            <p className="text-green-700 text-sm font-semibold">
              Aucune ligne extraite trouvée pour le dernier scan.
            </p>
            <p className="text-green-500 text-sm mt-1">
              Essayez une image plus nette ou une facture STEG/de service public.
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Nombre total de scans</p>
            <p className="text-2xl font-black text-green-900">{totalDocs}</p>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-green-300 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white border border-green-300 flex items-center justify-center flex-shrink-0">
                  <FileTypeIcon
                    type={previewDoc.fileType}
                    className="w-4 h-4 text-green-700"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-green-900 truncate text-sm">
                    {previewDoc.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {previewDoc.size} ·{" "}
                    {CATEGORY_CONFIG[previewDoc.category].label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-green-500 hover:bg-green-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image preview */}
            {previewDoc.previewUrl && (
              <div className="bg-green-50 border-b border-green-200 flex items-center justify-center p-4 max-h-48 overflow-hidden">
                <img
                  src={previewDoc.previewUrl}
                  alt="Aperçu du document"
                  className="max-h-40 object-contain rounded-lg shadow"
                />
              </div>
            )}

            {/* Extracted data */}
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-green-700 uppercase tracking-widest flex items-center gap-2">
                <Scan className="w-3.5 h-3.5" />
                Données extraites
              </p>

              {previewDoc.status === "processing" ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-green-600 text-sm">
                    L’IA analyse votre document…
                  </span>
                </div>
              ) : previewDoc.extractedData ? (
                <div className="space-y-2">
                  {[
                    {
                      key: "vendor",
                      label: "Fournisseur / Émetteur",
                      icon: "🏢",
                    },
                    {
                      key: "date",
                      label: "Date du document",
                      icon: "📅",
                    },
                    {
                      key: "totalAmount",
                      label: "Montant total",
                      icon: "💰",
                    },
                    {
                      key: "activityValue",
                      label: "Activité",
                      icon: "⚡",
                    },
                    {
                      key: "co2Equivalent",
                      label: "Équivalent CO₂",
                      icon: "🌿",
                    },
                  ].map(({ key, label, icon }) => {
                    const val =
                      previewDoc.extractedData?.[
                        key as keyof typeof previewDoc.extractedData
                      ];
                    if (!val) return null;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between px-4 py-2.5 bg-green-50 rounded-lg border border-green-200"
                      >
                        <span className="text-xs text-green-600 font-medium">
                          {icon} {label}
                        </span>
                        <span className="text-sm font-bold text-green-900">
                          {key === "activityValue"
                            ? `${val}${
                                previewDoc.extractedData?.activityUnit
                                  ? ` ${previewDoc.extractedData.activityUnit}`
                                  : ""
                              }${
                                previewDoc.extractedData?.activityType
                                  ? ` (${previewDoc.extractedData.activityType})`
                                  : ""
                              }`
                            : (val as any)}
                        </span>
                      </div>
                    );
                  })}

                  {previewDoc.extractedData.consumptionRows &&
                    previewDoc.extractedData.consumptionRows.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2">
                          Consommation
                        </p>
                        <div className="overflow-hidden rounded-lg border border-green-200">
                          <table className="w-full text-xs">
                            <thead className="bg-green-50 text-green-800">
                              <tr>
                                <th className="px-3 py-2 text-left font-bold">
                                  LIBELLE
                                </th>
                                <th className="px-3 py-2 text-right font-bold">
                                  CONSOMMATION
                                </th>
                                <th className="px-3 py-2 text-right font-bold">
                                  MONTANT
                                </th>
                                <th className="px-3 py-2 text-right font-bold">
                                  PERIODE
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {previewDoc.extractedData.consumptionRows.map(
                                (r, i) => (
                                  <tr
                                    key={`${r.libelle}-${i}`}
                                    className="border-t border-green-100"
                                  >
                                    <td className="px-3 py-2 text-green-900 font-semibold">
                                      {r.libelle}
                                    </td>
                                    <td className="px-3 py-2 text-right text-green-800">
                                      {r.consommation ?? "—"}
                                    </td>
                                    <td className="px-3 py-2 text-right text-green-800">
                                      {r.montant ?? "—"}
                                    </td>
                                    <td className="px-3 py-2 text-right text-green-800">
                                      {r.periode ?? "—"}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {previewDoc.extractedData.confidence && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-green-600 mb-1">
                        <span>Confiance de l’IA</span>
                        <span className="font-bold">
                          {previewDoc.extractedData.confidence}%
                        </span>
                      </div>
                      <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-700"
                          style={{
                            width: `${previewDoc.extractedData.confidence}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-500">
                  Impossible d’extraire des données de ce document.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-5">
              <button
                onClick={() => setPreviewDoc(null)}
                className="flex-1 px-4 py-2.5 text-green-700 hover:bg-green-100 rounded-lg font-semibold transition-colors border border-green-300 text-sm"
              >
                Fermer
              </button>
              {previewDoc.status === "ready" && previewDoc.extractedData && (
                <button
                  onClick={exportPreviewDocAsEmission}
                  disabled={isExportingEmission}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isExportingEmission ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Enregistrer comme émission
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {exportEmissionError && (
              <div className="px-6 pb-6">
                <div className="py-3 px-4 bg-white border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm font-semibold">
                    Échec de l’export émission : {exportEmissionError}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-green-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Supprimer le document</h3>
                <p className="text-sm text-green-700 mt-1">
                  Cela supprimera définitivement le document et ses données extraites.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-green-700 hover:bg-green-100 rounded-lg font-semibold border border-green-300 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setDocuments((prev) => prev.filter((d) => d.id !== deleteId));
                  setDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}