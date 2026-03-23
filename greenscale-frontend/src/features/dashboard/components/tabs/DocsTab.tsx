import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Scan,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Zap,
  FileImage,
  File,
  X,
  Camera,
  Building2,
  Receipt,
  ScrollText,
  ChevronRight,
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
    confidence?: number;
  };
  previewUrl?: string;
  fileType: "pdf" | "image" | "other";
}

const CATEGORY_CONFIG: Record<
  DocumentCategory,
  { label: string; icon: React.ReactNode; color: string; description: string }
> = {
  invoice: {
    label: "Invoice",
    icon: <Receipt className="w-5 h-5" />,
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    description: "Utility bills, supplier invoices",
  },
  company: {
    label: "Company Doc",
    icon: <Building2 className="w-5 h-5" />,
    color: "bg-green-100 text-green-700 border-green-300",
    description: "Corporate documents, contracts",
  },
  report: {
    label: "Report",
    icon: <ScrollText className="w-5 h-5" />,
    color: "bg-teal-100 text-teal-700 border-teal-300",
    description: "Audit reports, certifications",
  },
  other: {
    label: "Other",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-lime-100 text-lime-700 border-lime-300",
    description: "Miscellaneous documents",
  },
};

// Mock AI extraction — replace with real API call
const mockExtractFromDocument = async (
  file: File,
  category: DocumentCategory
): Promise<ScannedDocument["extractedData"]> => {
  await new Promise((r) => setTimeout(r, 2200));
  if (category === "invoice") {
    return {
      totalAmount: `${(Math.random() * 2000 + 100).toFixed(2)} TND`,
      date: new Date(Date.now() - Math.random() * 30 * 86400000)
        .toLocaleDateString("en-GB"),
      vendor: ["STEG", "SONEDE", "Total Energies", "Tunisie Telecom"][
        Math.floor(Math.random() * 4)
      ],
      co2Equivalent: `${(Math.random() * 500 + 20).toFixed(1)} kg CO₂`,
      confidence: Math.round(85 + Math.random() * 13),
    };
  }
  return {
    date: new Date().toLocaleDateString("en-GB"),
    confidence: Math.round(70 + Math.random() * 20),
  };
};

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    DocumentCategory | "all"
  >("all");
  const [previewDoc, setPreviewDoc] = useState<ScannedDocument | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (!fileArray.length) return;

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
          uploadedAt: new Date().toLocaleString("en-US", {
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
          const extracted = await mockExtractFromDocument(
            file,
            selectedCategory
          );
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === tempId
                ? { ...d, status: "ready", extractedData: extracted }
                : d
            )
          );
          setScanStatus("done");
        } catch {
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === tempId ? { ...d, status: "error" } : d
            )
          );
          setScanStatus("error");
        }
      }
    },
    [selectedCategory]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const filtered = documents.filter((d) => {
    const matchCat = filterCategory === "all" || d.category === filterCategory;
    const matchSearch = d.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalDocs = documents.length;
  const readyDocs = documents.filter((d) => d.status === "ready").length;
  const co2Docs = documents.filter(
    (d) => d.extractedData?.co2Equivalent
  ).length;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-12 space-y-8 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-green-900">
            Document Scanner
          </h1>
          <p className="text-green-700 text-sm md:text-base mt-1">
            Upload invoices and company documents — AI extracts emissions data
            automatically
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-300 rounded-lg">
          <Scan className="w-4 h-4 text-green-600 animate-pulse" />
          <span className="text-xs font-semibold text-green-700 uppercase tracking-widest">
            AI-Powered OCR
          </span>
        </div>
      </div>

      {/* Category selector */}
      <div>
        <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">
          Document Type
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
              ? "Release to upload"
              : "Drop files here or click to browse"}
          </p>
          <p className="text-green-600 text-sm mt-1">
            PDF, JPG, PNG, WEBP — up to 20 MB each
          </p>
        </div>

        {/* Category badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${CATEGORY_CONFIG[selectedCategory].color}`}
        >
          {CATEGORY_CONFIG[selectedCategory].icon}
          Will be saved as: {CATEGORY_CONFIG[selectedCategory].label}
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
          Scan with Camera
        </button>
      </div>

      {/* Search & Filter */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as DocumentCategory | "all")
            }
            className="px-4 py-2.5 bg-white border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="all">All Categories</option>
            {(Object.keys(CATEGORY_CONFIG) as DocumentCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_CONFIG[c].label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Documents List */}
      {filtered.length > 0 ? (
        <Card className="overflow-hidden rounded-xl shadow-lg bg-white border border-green-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 border-b border-green-300">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-green-900">
                    Document
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-green-900 hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-green-900 hidden md:table-cell">
                    Extracted Info
                  </th>
                  <th className="text-center px-6 py-4 font-bold text-green-900">
                    Status
                  </th>
                  <th className="text-center px-6 py-4 font-bold text-green-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className="border-b border-green-100 hover:bg-green-50 transition-colors"
                  >
                    {/* Doc name + size */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center flex-shrink-0">
                          <FileTypeIcon
                            type={doc.fileType}
                            className="w-4 h-4 text-green-700"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-green-900 truncate max-w-[160px] sm:max-w-[220px]">
                            {doc.name}
                          </p>
                          <p className="text-xs text-green-500">
                            {doc.size} · {doc.uploadedAt}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_CONFIG[doc.category].color}`}
                      >
                        {CATEGORY_CONFIG[doc.category].icon}
                        {CATEGORY_CONFIG[doc.category].label}
                      </div>
                    </td>

                    {/* Extracted data */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      {doc.status === "processing" ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <div className="w-3.5 h-3.5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">Scanning…</span>
                        </div>
                      ) : doc.status === "ready" && doc.extractedData ? (
                        <div className="space-y-0.5">
                          {doc.extractedData.vendor && (
                            <p className="text-xs text-green-800 font-medium">
                              🏢 {doc.extractedData.vendor}
                            </p>
                          )}
                          {doc.extractedData.totalAmount && (
                            <p className="text-xs text-green-700">
                              💰 {doc.extractedData.totalAmount}
                            </p>
                          )}
                          {doc.extractedData.co2Equivalent && (
                            <p className="text-xs font-bold text-green-800">
                              🌿 {doc.extractedData.co2Equivalent}
                            </p>
                          )}
                          {doc.extractedData.confidence && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex-1 h-1 bg-green-100 rounded-full overflow-hidden max-w-[60px]">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${doc.extractedData.confidence}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-green-500">
                                {doc.extractedData.confidence}% confidence
                              </span>
                            </div>
                          )}
                        </div>
                      ) : doc.status === "error" ? (
                        <span className="text-xs text-red-500">
                          Extraction failed
                        </span>
                      ) : null}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 text-center">
                      {doc.status === "processing" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-700 rounded-full text-xs font-bold">
                          <Clock className="w-3 h-3" />
                          Processing
                        </span>
                      ) : doc.status === "ready" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 border border-green-300 text-green-700 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 rounded-full text-xs font-bold">
                          <AlertCircle className="w-3 h-3" />
                          Error
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          disabled={doc.status === "processing"}
                          className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-300 disabled:opacity-30"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-300"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(doc.id)}
                          className="p-2 text-green-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-green-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          <p className="text-green-700 font-semibold">No documents yet</p>
          <p className="text-green-500 text-sm max-w-xs">
            Upload your invoices and company documents to extract emissions data
            automatically.
          </p>
        </div>
      ) : null}

      {/* Stats Footer */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Total Documents</p>
            <p className="text-2xl font-black text-green-900">{totalDocs}</p>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Successfully Scanned</p>
            <p className="text-2xl font-black text-green-900">
              {readyDocs}
              <span className="text-sm font-medium text-green-500 ml-1">
                / {totalDocs}
              </span>
            </p>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">With CO₂ Data</p>
            <p className="text-2xl font-black text-green-900">{co2Docs}</p>
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
                  alt="Document preview"
                  className="max-h-40 object-contain rounded-lg shadow"
                />
              </div>
            )}

            {/* Extracted data */}
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-green-700 uppercase tracking-widest flex items-center gap-2">
                <Scan className="w-3.5 h-3.5" />
                Extracted Data
              </p>

              {previewDoc.status === "processing" ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-green-600 text-sm">
                    AI is scanning your document…
                  </span>
                </div>
              ) : previewDoc.extractedData ? (
                <div className="space-y-2">
                  {[
                    {
                      key: "vendor",
                      label: "Vendor / Issuer",
                      icon: "🏢",
                    },
                    {
                      key: "date",
                      label: "Document Date",
                      icon: "📅",
                    },
                    {
                      key: "totalAmount",
                      label: "Total Amount",
                      icon: "💰",
                    },
                    {
                      key: "co2Equivalent",
                      label: "CO₂ Equivalent",
                      icon: "🌿",
                    },
                  ].map(({ key, label, icon }) => {
                    const val =
                      previewDoc.extractedData?.[
                        key as keyof typeof previewDoc.extractedData
                      ];
                    if (!val || typeof val === "number") return null;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between px-4 py-2.5 bg-green-50 rounded-lg border border-green-200"
                      >
                        <span className="text-xs text-green-600 font-medium">
                          {icon} {label}
                        </span>
                        <span className="text-sm font-bold text-green-900">
                          {val}
                        </span>
                      </div>
                    );
                  })}

                  {previewDoc.extractedData.confidence && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-green-600 mb-1">
                        <span>AI Confidence</span>
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
                  Could not extract data from this document.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-5">
              <button
                onClick={() => setPreviewDoc(null)}
                className="flex-1 px-4 py-2.5 text-green-700 hover:bg-green-100 rounded-lg font-semibold transition-colors border border-green-300 text-sm"
              >
                Close
              </button>
              {previewDoc.status === "ready" &&
                previewDoc.extractedData?.co2Equivalent && (
                  <button
                    onClick={() => {
                      // TODO: wire to emission logger
                      setPreviewDoc(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Zap className="w-4 h-4" />
                    Log as Emission
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
            </div>
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
                <h3 className="font-bold text-green-900">Delete Document</h3>
                <p className="text-sm text-green-700 mt-1">
                  This will permanently remove the document and its extracted
                  data.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-green-700 hover:bg-green-100 rounded-lg font-semibold border border-green-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDocuments((prev) => prev.filter((d) => d.id !== deleteId));
                  setDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}