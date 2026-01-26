import { useState } from "react";
import { Download, FileText, AlertCircle, CheckCircle2, Loader, TrendingUp, Shield, Clock, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ComplianceStatus {
  standard: string;
  status: 'compliant' | 'pending' | 'non-compliant';
  lastAudit: string;
  nextReview: string;
}

interface AuditLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  status: 'success' | 'warning' | 'info';
}

export function ReportsTab() {
  const businessId = localStorage.getItem("user_id");
  
  // Export states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPDFDownloading, setIsPDFDownloading] = useState(false);
  const [pdfDownloadStatus, setPDFDownloadStatus] = useState<"idle" | "success" | "error">("idle");
  
  // Report generation states
  const [reportType, setReportType] = useState("full");
  const [dateRange, setDateRange] = useState("month");
  
  // Compliance states
  const [complianceStatus] = useState<ComplianceStatus[]>([
    { standard: "ISO 14064-1", status: 'compliant', lastAudit: "2025-12-15", nextReview: "2026-12-15" },
    { standard: "GHG Protocol", status: 'compliant', lastAudit: "2025-11-20", nextReview: "2026-05-20" },
    { standard: "Carbon Trust", status: 'pending', lastAudit: "2025-10-10", nextReview: "2026-01-10" },
  ]);
  
  // Audit logs
  const [auditLogs] = useState<AuditLog[]>([
    { id: 1, action: "Emissions Data Updated", user: "System", timestamp: "2025-01-25 10:30 AM", details: "Scope 1 & 2 data synchronized", status: 'success' },
    { id: 2, action: "CSV Export Generated", user: "Admin", timestamp: "2025-01-25 09:15 AM", details: "Q4 2025 emissions report", status: 'success' },
    { id: 3, action: "Supplier Added", user: "Manager", timestamp: "2025-01-24 02:45 PM", details: "New Scope 3 supplier registered", status: 'info' },
    { id: 4, action: "Data Validation Warning", user: "System", timestamp: "2025-01-23 11:20 AM", details: "Fuel consumption unusually high", status: 'warning' },
    { id: 5, action: "PDF Report Generated", user: "System", timestamp: "2025-01-22 08:00 AM", details: "Monthly compliance report", status: 'success' },
  ]);

  const [chartData] = useState([
    { month: 'Jan', co2: 450, target: 400, compliance: 92 },
    { month: 'Feb', co2: 420, target: 400, compliance: 95 },
    { month: 'Mar', co2: 380, target: 400, compliance: 105 },
    { month: 'Apr', co2: 410, target: 400, compliance: 97 },
    { month: 'May', co2: 395, target: 400, compliance: 101 },
    { month: 'Jun', co2: 365, target: 400, compliance: 109 },
  ]);

  const handleDownloadCSV = async () => {
    if (!businessId || businessId === "undefined") {
      alert("❌ Please log in to download your report");
      return;
    }

    setIsDownloading(true);
    setDownloadStatus("idle");
    console.log("📥 Initiating CSV export for business:", businessId);

    try {
      const response = await fetch(`http://127.0.0.1:8000/export-data/${businessId}`);

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
      const response = await fetch(`http://127.0.0.1:8000/export-pdf/${businessId}`);

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
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-white rounded-3xl p-8 border border-green-200/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Reports & Compliance</h1>
            <p className="text-slate-600 text-sm">Generate reports, track compliance, and maintain audit trails</p>
          </div>
        </div>
      </div>

      {/* Report Generation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Options */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Generate Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="full">Full Dataset Export</option>
                  <option value="monthly">Monthly Summary</option>
                  <option value="compliance">Compliance Report</option>
                  <option value="scope3">Scope 3 Supply Chain</option>
                  <option value="financial">Financial Impact</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="ytd">Year-to-Date</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDownloadCSV}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-lg transition-all"
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

              <button
                onClick={handleDownloadPDF}
                disabled={isPDFDownloading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-bold rounded-lg transition-all"
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
            </div>
          </div>

          {/* Compliance Tracking Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Compliance Tracking</h2>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="co2" stroke="#16a34a" strokeWidth={2} name="CO₂ (kg)" />
                <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeDasharray="5 5" strokeWidth={2} name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Compliance Status
          </h2>
          <div className="space-y-3">
            {complianceStatus.map((standard, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 text-sm">{standard.standard}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    standard.status === 'compliant' ? 'bg-green-100 text-green-700' :
                    standard.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {standard.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>✓ Last Audit: {standard.lastAudit}</p>
                  <p>→ Next Review: {standard.nextReview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Audit Trail
          </h2>
          <button className="px-3 py-1 text-sm font-semibold text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Timestamp</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Details</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{log.action}</td>
                  <td className="py-3 px-4 text-slate-600">{log.user}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{log.timestamp}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{log.details}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' :
                      log.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Types & Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Reports */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Report Types
          </h2>
          <div className="space-y-3">
            {[
              { title: "Full Dataset", desc: "Complete emissions history", status: "available" },
              { title: "Monthly Summary", desc: "Aggregated by month and type", status: "available" },
              { title: "Compliance Report", desc: "ISO 14001 & GHG Protocol", status: "available" },
              { title: "Scope 3 Analysis", desc: "Supply chain emissions", status: "available" },
            ].map((report, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900">{report.title}</p>
                  <p className="text-xs text-slate-600">{report.desc}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Standards & Frameworks
          </h2>
          <div className="space-y-3">
            {[
              { name: "ISO 14064-1", desc: "Greenhouse gas quantification" },
              { name: "GHG Protocol", desc: "International accounting standards" },
              { name: "Carbon Trust", desc: "Carbon footprint measurement" },
              { name: "CSRD", desc: "Corporate sustainability reporting" },
            ].map((standard, idx) => (
              <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-slate-900">{standard.name}</p>
                <p className="text-xs text-slate-600">{standard.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Data Privacy & Security</h3>
            <p className="text-sm text-slate-700 mb-2">
              All reports are encrypted and securely stored. Audit logs track all data access and modifications for regulatory compliance and accountability.
            </p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>✓ End-to-end encryption for all exports</li>
              <li>✓ Complete audit trail of all changes</li>
              <li>✓ GDPR and data protection compliant</li>
              <li>✓ Automated compliance verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}