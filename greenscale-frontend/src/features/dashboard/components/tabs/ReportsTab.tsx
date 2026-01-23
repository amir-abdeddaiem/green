import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Download, FileText, AlertCircle, CheckCircle2, Loader } from "lucide-react";

export function ReportsTab() {
  const businessId = localStorage.getItem("user_id");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPDFDownloading, setIsPDFDownloading] = useState(false);
  const [pdfDownloadStatus, setPDFDownloadStatus] = useState<"idle" | "success" | "error">("idle");

  const handleDownloadCSV = async () => {
    if (!businessId || businessId === "undefined") {
      alert("❌ Please log in to download your report");
      return;
    }

    setIsDownloading(true);
    setDownloadStatus("idle");
    console.log("📥 Initiating CSV export for business:", businessId);

    try {
      const response = await fetch(`http://127.0.0.1:8001/export-data/${businessId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Export failed");
      }

      // Extract filename from header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "carbon_report.csv";

      // Download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadStatus("success");
      console.log("✅ CSV downloaded:", filename);
      setTimeout(() => setDownloadStatus("idle"), 3000);
    } catch (err) {
      console.error("❌ Download failed:", err);
      setDownloadStatus("error");
      alert(`❌ Download failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setTimeout(() => setDownloadStatus("idle"), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!businessId || businessId === "undefined") {
      alert("❌ Please log in to download your report");
      return;
    }

    setIsPDFDownloading(true);
    setPDFDownloadStatus("idle");
    console.log("📥 Initiating PDF export for business:", businessId);

    try {
      const response = await fetch(`http://127.0.0.1:8001/export-pdf/${businessId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Export failed");
      }

      // Extract filename from header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "carbon_report.pdf";

      // Download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setPDFDownloadStatus("success");
      console.log("✅ PDF downloaded:", filename);
      setTimeout(() => setPDFDownloadStatus("idle"), 3000);
    } catch (err) {
      console.error("❌ PDF Download failed:", err);
      setPDFDownloadStatus("error");
      alert(`❌ PDF Download failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setTimeout(() => setPDFDownloadStatus("idle"), 3000);
    } finally {
      setIsPDFDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-12 space-y-8 md:space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900">Reports & Compliance</h1>
        <p className="text-gray-600 text-sm md:text-base">Export your emissions data for audits and sustainability reporting</p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <Card className="p-6 rounded-lg shadow-lg bg-white border border-gray-300 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                <FileText className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">CSV Export</h3>
                <p className="text-xs text-gray-600">All emissions data</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded border border-gray-300">Ready</span>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            Download your complete emissions history in CSV format. Perfect for spreadsheet analysis and compliance documentation.
          </p>

          <div className="space-y-2 mb-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-700" />
              <span>All emissions included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-700" />
              <span>Normalized date formatting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-700" />
              <span>Professional column headers</span>
            </div>
          </div>

          <button
            onClick={handleDownloadCSV}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all duration-300"
          >
            {isDownloading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : downloadStatus === "success" ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download CSV</span>
              </>
            )}
          </button>
        </Card>

        {/* PDF Export Card */}
        <Card className="p-6 rounded-lg shadow-lg bg-white border border-gray-300 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center">
                <FileText className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">PDF Report</h3>
                <p className="text-xs text-gray-600">Professional formatted</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded border border-gray-300">Ready</span>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            Beautiful branded PDF report with comprehensive emissions summary, charts, and compliance formatting.
          </p>

          <div className="space-y-2 mb-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-700" />
              <span>Branded headers and footers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-700" />
              <span>Emissions summary & statistics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-700" />
              <span>Professional formatting</span>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isPDFDownloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all duration-300"
          >
            {isPDFDownloading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : pdfDownloadStatus === "success" ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </Card>
      </div>

      {/* Report Types */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 rounded-lg bg-white border border-gray-300">
            <h3 className="font-bold text-gray-900 mb-2">Full Dataset Export</h3>
            <p className="text-xs text-gray-600 mb-3">Complete history of all emissions with timestamps and calculations</p>
            <span className="text-xs font-semibold text-gray-700 border border-gray-300 px-2 py-1 rounded">Available now</span>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-gray-300">
            <h3 className="font-bold text-gray-900 mb-2">Monthly Summary</h3>
            <p className="text-xs text-gray-600 mb-3">Aggregated CO2 impact broken down by month and emission type</p>
            <span className="text-xs font-semibold text-gray-500">Coming soon</span>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-gray-300">
            <h3 className="font-bold text-gray-900 mb-2">Compliance Report</h3>
            <p className="text-xs text-gray-600 mb-3">ISO 14001 and GHG Protocol formatted reports for audits</p>
            <span className="text-xs font-semibold text-gray-500">Coming soon</span>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-gray-300">
            <h3 className="font-bold text-gray-900 mb-2">Year-over-Year Analysis</h3>
            <p className="text-xs text-gray-600 mb-3">Compare emissions trends across multiple years</p>
            <span className="text-xs font-semibold text-gray-500">Coming soon</span>
          </Card>
        </div>
      </div>

      {/* Compliance Info */}
      <Card className="p-6 rounded-lg bg-gray-50 border border-gray-300">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Compliance Standards</h3>
            <p className="text-sm text-gray-700 mb-3">
              Reports are formatted to meet international carbon accounting standards including:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>ISO 14064-1</strong> - Greenhouse gas quantification and reporting</li>
              <li>• <strong>GHG Protocol</strong> - The most widely used international greenhouse gas accounting standards</li>
              <li>• <strong>Carbon Trust Standard</strong> - Requirements for carbon footprint measurement</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}