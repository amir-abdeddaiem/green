import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Search, Zap, Flame, Wind, Trash2, Calendar, AlertCircle, Edit2, CheckCircle2, Clock } from "lucide-react";
import { AddEmissionModal } from "../AddEmissionModal";
import { apiUrl } from "@/config/api";

interface Emission {
  id: number;
  type: string;
  value: number;
  unit: string;
  co2_impact: number;
  recorded_at: string;
  status?: "active" | "draft" | "archived";
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

function estimateImpactKg(type: string, value: number): number {
  const factors: Record<string, number> = {
    Electricity: 0.4,
    "Natural Gas": 2.0,
    Fuel: 2.7,
    Waste: 0.5,
  };

  const factor = factors[type] ?? 0.1;
  return Math.round(value * factor * 100) / 100;
}

function normalizeEmission(raw: any): Emission | null {
  const id = Number(raw?.id);
  const type = typeof raw?.type === "string" ? raw.type : null;
  const unit = typeof raw?.unit === "string" ? raw.unit : null;
  const recordedAtRaw = raw?.recorded_at;
  const recorded_at =
    typeof recordedAtRaw === "string"
      ? recordedAtRaw
      : recordedAtRaw instanceof Date
        ? recordedAtRaw.toISOString()
        : null;

  const value = toNumber(raw?.value);
  const impactRaw = toNumber(raw?.co2_impact);

  if (!Number.isFinite(id) || !type || !unit || value === null || !recorded_at) {
    return null;
  }

  const co2_impact = impactRaw !== null ? impactRaw : estimateImpactKg(type, value);

  const status =
    raw?.status === "active" || raw?.status === "draft" || raw?.status === "archived"
      ? raw.status
      : undefined;

  return {
    id,
    type,
    value,
    unit,
    co2_impact,
    recorded_at,
    status,
  };
}

export function EmissionsLogTab() {
  const businessId = localStorage.getItem("user_id");
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [filteredEmissions, setFilteredEmissions] = useState<Emission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditId, setSelectedEditId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ type: "", value: "", unit: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "draft" | "archived">("active");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emissionType, setEmissionType] = useState<'Electricity' | 'Natural Gas' | 'Fuel' | 'Waste'>('Electricity');

  const TYPE_LABELS: Record<string, string> = {
    Electricity: "Électricité",
    "Natural Gas": "Gaz naturel",
    Fuel: "Carburant",
    Waste: "Déchets",
  };

  useEffect(() => {
    fetchAllEmissions();
  }, [businessId]);

  useEffect(() => {
    filterEmissions();
  }, [emissions, searchTerm, filterType]);

  const fetchAllEmissions = async () => {
    if (!businessId || businessId === "undefined") {
      console.log("❌ No business ID for emissions log");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl(`/recent-logs/${businessId}`));
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : [];
        const normalized = items
          .map(normalizeEmission)
          .filter((it): it is Emission => it !== null);
        setEmissions(normalized);
        console.log("✅ Emissions fetched:", data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch emissions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (emissionId: number) => {
    setSelectedDeleteId(emissionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedDeleteId === null) return;

    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl(`/delete-emission/${selectedDeleteId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("✅ Emission deleted successfully");
        // Remove from state
        setEmissions(emissions.filter((e) => e.id !== selectedDeleteId));
        setDeleteDialogOpen(false);
        setSelectedDeleteId(null);
      } else {
        console.error("❌ Failed to delete emission");
      }
    } catch (error) {
      console.error("❌ Error deleting emission:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (emission: Emission) => {
    setSelectedEditId(emission.id);
    setEditFormData({
      type: emission.type,
      value: emission.value.toString(),
      unit: emission.unit,
    });
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (selectedEditId === null) return;

    setIsSavingEdit(true);
    try {
      const response = await fetch(apiUrl(`/update-emission/${selectedEditId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editFormData.type,
          value: parseFloat(editFormData.value),
          unit: editFormData.unit,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        console.log("✅ Emission updated successfully");
        
        // Update in state
        setEmissions(emissions.map(e => 
          e.id === selectedEditId 
            ? { ...e, ...updatedData }
            : e
        ));
        setEditDialogOpen(false);
        setSelectedEditId(null);
      } else {
        console.error("❌ Failed to update emission");
      }
    } catch (error) {
      console.error("❌ Error updating emission:", error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleStatusClick = (emissionId: number, currentStatus: string) => {
    setSelectedStatusId(emissionId);
    setNewStatus((currentStatus === "draft" ? "active" : "draft") as "active" | "draft");
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (selectedStatusId === null) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(apiUrl(`/update-emission-status/${selectedStatusId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        console.log("✅ Emission status updated successfully");
        
        // Update in state
        setEmissions(emissions.map(e => 
          e.id === selectedStatusId 
            ? { ...e, status: newStatus }
            : e
        ));
        setStatusDialogOpen(false);
        setSelectedStatusId(null);
      } else {
        console.error("❌ Failed to update status");
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filterEmissions = () => {
    let result = emissions;

    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType);
    }

    if (searchTerm) {
      result = result.filter(
        (e) =>
          e.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.recorded_at.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmissions(result);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Electricity":
        return <Zap className="w-4 h-4" />;
      case "Natural Gas":
        return <Flame className="w-4 h-4" />;
      case "Fuel":
        return <Wind className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Electricity":
        return "bg-green-100 text-green-700 border border-green-300";
      case "Natural Gas":
        return "bg-green-100 text-green-700 border border-green-300";
      case "Fuel":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-green-100 text-green-700 border border-green-300";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 lg:p-12 space-y-8 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-green-900">Journal d’audit des émissions</h1>
          <p className="text-green-700 text-sm md:text-base">Historique complet de toutes les émissions enregistrées avec recherche et filtres</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setEmissionType('Electricity'); setIsModalOpen(true); }}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-lg"
            title="Enregistrer la consommation d’électricité"
          >
            ⚡ Électricité
          </button>
          <button
            onClick={() => { setEmissionType('Natural Gas'); setIsModalOpen(true); }}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-lg"
            title="Enregistrer l’utilisation de gaz naturel"
          >
            🔥 Gaz
          </button>
          <button
            onClick={() => { setEmissionType('Fuel'); setIsModalOpen(true); }}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-lg"
            title="Enregistrer la consommation de carburant"
          >
            ⛽ Carburant
          </button>
          <button
            onClick={() => { setEmissionType('Waste'); setIsModalOpen(true); }}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-lg"
            title="Enregistrer les déchets"
          >
            ♻️ Déchets
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
          <input
            type="text"
            placeholder="Rechercher par type ou date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-white border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
        >
          <option value="all">Tous les types</option>
          <option value="Electricity">Électricité</option>
          <option value="Natural Gas">Gaz naturel</option>
          <option value="Fuel">Carburant</option>
          <option value="Waste">Déchets</option>
        </select>
      </div>

      {/* Emissions Table */}
      <Card className="overflow-hidden rounded-lg shadow-lg bg-white border border-green-300">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredEmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 border-b border-green-300">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-green-900">Date</th>
                  <th className="text-left px-6 py-4 font-bold text-green-900">Type</th>
                  <th className="text-left px-6 py-4 font-bold text-green-900">Consommation</th>
                  <th className="text-right px-6 py-4 font-bold text-green-900">Impact CO₂</th>
                  <th className="text-center px-6 py-4 font-bold text-green-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmissions.map((emission, idx) => (
                  <tr
                    key={emission.id}
                    className="border-b border-green-200 hover:bg-green-50 transition-colors"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-green-900 font-medium">{formatDate(emission.recorded_at)}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(emission.type)}`}>
                        {getTypeIcon(emission.type)}
                        {TYPE_LABELS[emission.type] || emission.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-green-700">
                      {emission.value} {emission.unit}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-300">
                        {emission.co2_impact} kg
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button 
                          onClick={() => handleEditClick(emission)}
                          className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-300"
                          title="Modifier l’émission"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Status Button */}
                        <button 
                          onClick={() => handleStatusClick(emission.id, emission.status || "active")}
                          className={`p-2 rounded-lg transition-colors duration-200 border border-green-300 ${
                            emission.status === "draft"
                              ? "text-green-600 hover:bg-green-100"
                              : "text-green-900 hover:bg-green-100"
                          }`}
                          title={emission.status === "draft" ? "Activer" : "Passer en brouillon"}
                        >
                          {emission.status === "draft" ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>

                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDeleteClick(emission.id)}
                          className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-300"
                          title="Supprimer l’émission"
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Calendar className="w-12 h-12 text-green-300 mb-3" />
            <p className="text-green-600 font-medium">Aucune émission enregistrée</p>
            <p className="text-green-500 text-sm">Commencez à enregistrer vos émissions pour les voir ici</p>
          </div>
        )}
      </Card>

      {/* Stats Footer */}
      {filteredEmissions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Nombre d’entrées</p>
            <p className="text-2xl font-black text-green-900">{filteredEmissions.length}</p>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Impact CO₂ total</p>
            <p className="text-2xl font-black text-green-900">{filteredEmissions.reduce((sum, e) => sum + (Number.isFinite(e.co2_impact) ? e.co2_impact : 0), 0).toFixed(2)} kg</p>
          </Card>
          <Card className="p-4 rounded-lg bg-white border border-green-300">
            <p className="text-xs text-green-600 font-medium">Moyenne par entrée</p>
            <p className="text-2xl font-black text-green-900">
              {(
                filteredEmissions.reduce(
                  (sum, e) => sum + (Number.isFinite(e.co2_impact) ? e.co2_impact : 0),
                  0
                ) / filteredEmissions.length
              ).toFixed(2)} kg
            </p>
          </Card>
        </div>
      )}

      {/* Edit Emission Dialog */}
      {editDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full animate-in border border-green-300">
            <h3 className="text-lg font-bold text-green-900 mb-4">Modifier l’émission</h3>
            
            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Type d’émission</label>
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="Electricity">Électricité</option>
                  <option value="Natural Gas">Gaz naturel</option>
                  <option value="Fuel">Carburant</option>
                  <option value="Waste">Déchets</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Valeur de consommation</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.value}
                  onChange={(e) => setEditFormData({ ...editFormData, value: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Saisir une valeur"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2">Unité</label>
                <input
                  type="text"
                  value={editFormData.unit}
                  onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="ex. : kWh, m³"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedEditId(null);
                }}
                disabled={isSavingEdit}
                className="flex-1 px-4 py-2.5 text-green-700 hover:bg-green-100 rounded-lg font-semibold transition-colors disabled:opacity-50 border border-green-300"
              >
                Annuler
              </button>
              <button
                onClick={confirmEdit}
                disabled={isSavingEdit}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingEdit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Dialog */}
      {statusDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full animate-in border border-green-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 border border-green-300">
                <Clock className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900">Changer le statut</h3>
                <p className="text-green-700 text-sm mt-1">
                  {newStatus === "draft" 
                    ? "Passer cette émission en brouillon ? Elle ne sera pas comptabilisée dans vos statistiques principales."
                    : "Activer cette émission ? Elle sera incluse dans vos statistiques principales."}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setStatusDialogOpen(false);
                  setSelectedStatusId(null);
                }}
                disabled={isUpdatingStatus}
                className="flex-1 px-4 py-2.5 text-green-700 hover:bg-green-100 rounded-lg font-semibold transition-colors disabled:opacity-50 border border-green-300"
              >
                Annuler
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={isUpdatingStatus}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  newStatus === "draft"
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    {newStatus === "draft" ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {newStatus === "draft" ? "Passer en brouillon" : "Activer"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full animate-in border border-green-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 border border-green-300">
                <AlertCircle className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900">Supprimer l’émission</h3>
                <p className="text-green-700 text-sm mt-1">Êtes-vous sûr de vouloir supprimer cet enregistrement ? Cette action est irréversible.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedDeleteId(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-green-700 hover:bg-green-100 rounded-lg font-semibold transition-colors disabled:opacity-50 border border-green-300"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Emission Modal */}
      <AddEmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAllEmissions}
        type={emissionType}
      />
    </div>
  );
}