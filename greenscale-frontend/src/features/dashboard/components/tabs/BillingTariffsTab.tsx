import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { apiUrl } from "@/config/api";

interface Tariff {
  id: number;
  utility_type: string;
  price_per_unit: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

interface Budget {
  id: number;
  month: number;
  year: number;
  monthly_limit: number;
  alert_percentage: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export const BillingTariffsTab: React.FC = () => {
  const { getCurrencySymbol, supportedCurrencies } = useCurrency();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tariffs' | 'budgets'>('tariffs');

  const UTILITY_LABELS: Record<string, string> = {
    Electricity: "Électricité",
    "Natural Gas": "Gaz naturel",
    Fuel: "Carburant",
    Waste: "Déchets",
    Water: "Eau",
  };

  // Form states
  const [newTariff, setNewTariff] = useState({
    utility_type: 'Electricity',
    price_per_unit: 0,
    currency_code: 'PKR',
  });

  const [newBudget, setNewBudget] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthly_limit: 0,
    alert_percentage: 80,
    currency_code: 'PKR',
  });

  const businessId = localStorage.getItem('user_id');

  // Fetch tariffs and budgets
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const [tariffsRes, budgetsRes] = await Promise.all([
        fetch(apiUrl(`/api/tariffs?business_id=${businessId}`)),
        fetch(apiUrl(`/api/budgets?business_id=${businessId}`)),
      ]);

      if (tariffsRes.ok) {
        const data = await tariffsRes.json();
        setTariffs(data);
      }

      if (budgetsRes.ok) {
        const data = await budgetsRes.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add/Update Tariff
  const handleSaveTariff = async () => {
    if (!businessId || newTariff.price_per_unit <= 0) return;

    try {
      const response = await fetch(
        apiUrl(`/api/tariffs?business_id=${businessId}`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTariff),
        }
      );

      if (response.ok) {
        await fetchData();
        setNewTariff({
          utility_type: 'Electricity',
          price_per_unit: 0,
          currency_code: 'PKR',
        });
      }
    } catch (error) {
      console.error('❌ Error saving tariff:', error);
    }
  };

  // Delete Tariff
  const handleDeleteTariff = async (tariffId: number) => {
    if (!businessId) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return;

    try {
      const response = await fetch(
        apiUrl(`/api/tariffs/${tariffId}?business_id=${businessId}`),
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('❌ Error deleting tariff:', error);
    }
  };

  // Add/Update Budget
  const handleSaveBudget = async () => {
    if (!businessId || newBudget.monthly_limit <= 0) return;

    try {
      const response = await fetch(
        apiUrl(`/api/budgets?business_id=${businessId}`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBudget),
        }
      );

      if (response.ok) {
        await fetchData();
        setNewBudget({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          monthly_limit: 0,
          alert_percentage: 80,
          currency_code: 'PKR',
        });
      }
    } catch (error) {
      console.error('❌ Error saving budget:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tariffs')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'tariffs'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💰 Tarifs
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'budgets'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Objectifs de budget
        </button>
      </div>

      {/* TARIFFS TAB */}
      {activeTab === 'tariffs' && (
        <div className="space-y-6">
          {/* Add New Tariff Form */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un tarif</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d’énergie
                </label>
                <select
                  value={newTariff.utility_type}
                  onChange={(e) =>
                    setNewTariff({ ...newTariff, utility_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Electricity">Électricité</option>
                  <option value="Natural Gas">Gaz naturel</option>
                  <option value="Fuel">Carburant</option>
                  <option value="Waste">Déchets</option>
                  <option value="Water">Eau</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par unité
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newTariff.price_per_unit}
                  onChange={(e) =>
                    setNewTariff({ ...newTariff, price_per_unit: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  value={newTariff.currency_code}
                  onChange={(e) =>
                    setNewTariff({ ...newTariff, currency_code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {supportedCurrencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSaveTariff}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Tariffs List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tarifs actuels</h3>
            </div>
            {tariffs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucun tarif configuré. Ajoutez-en un ci-dessus pour commencer.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Prix par unité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Devise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Dernière mise à jour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tariffs.map((tariff, idx) => (
                      <tr key={tariff.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {UTILITY_LABELS[tariff.utility_type] || tariff.utility_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {tariff.price_per_unit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {tariff.currency_code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(tariff.updated_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => handleDeleteTariff(tariff.id)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Supprimer le tarif"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BUDGETS TAB */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          {/* Add New Budget Form */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Définir un budget mensuel</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
                <select
                  value={newBudget.month}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, month: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2025, m - 1).toLocaleString('fr-FR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                <select
                  value={newBudget.year}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, year: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plafond du budget
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newBudget.monthly_limit}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, monthly_limit: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alerte à %
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={newBudget.alert_percentage}
                  onChange={(e) =>
                    setNewBudget({
                      ...newBudget,
                      alert_percentage: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSaveBudget}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>

          {/* Budgets List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Budgets mensuels</h3>
            </div>
            {budgets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucun budget défini. Créez-en un ci-dessus pour suivre vos objectifs de dépenses.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Mois
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Plafond
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Alerte %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Devise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Créé le
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((budget, idx) => (
                      <tr key={budget.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {new Date(2025, budget.month - 1).toLocaleString('fr-FR', {
                            month: 'long',
                          })}{' '}
                          {budget.year}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {getCurrencySymbol(budget.currency_code)}{' '}
                          {budget.monthly_limit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{budget.alert_percentage}%</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{budget.currency_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(budget.created_at).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingTariffsTab;
