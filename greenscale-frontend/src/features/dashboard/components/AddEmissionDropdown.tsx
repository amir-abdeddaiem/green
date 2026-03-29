import { useState } from "react";
import { X } from "lucide-react";

interface AddEmissionModalProps {
  isOpen: boolean;
  emissionType: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddEmissionModal({
  isOpen,
  emissionType,
  onClose,
  onSubmit,
}: AddEmissionModalProps) {
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("kWh");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const unitsByType: { [key: string]: string[] } = {
    Electricity: ["kWh", "MWh"],
    Gas: ["m³", "therms", "cubic feet"],
    Fuel: ["liters", "gallons", "gallons"],
    Waste: ["kg", "tons", "pounds"],
  };

  const emissionIcons: { [key: string]: string } = {
    Electricity: "⚡",
    Gas: "🔥",
    Fuel: "🛢️",
    Waste: "♻️",
  };

  const emissionColors: { [key: string]: string } = {
    Electricity: "bg-yellow-50 border-yellow-200",
    Gas: "bg-orange-50 border-orange-200",
    Fuel: "bg-red-50 border-red-200",
    Waste: "bg-green-50 border-green-200",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      alert("Veuillez saisir une quantité");
      return;
    }

    onSubmit({
      type: emissionType,
      amount: parseFloat(amount),
      unit,
      date,
      notes,
    });

    setAmount("");
    setUnit("kWh");
    setNotes("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 ${emissionColors[emissionType]}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{emissionIcons[emissionType]}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{emissionType}</h2>
                <p className="text-sm text-gray-600">Ajouter une émission de {emissionType.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantité
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Saisir une quantité"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unité
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {unitsByType[emissionType]?.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (facultatif)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des notes supplémentaires..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Ajouter {emissionType}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
