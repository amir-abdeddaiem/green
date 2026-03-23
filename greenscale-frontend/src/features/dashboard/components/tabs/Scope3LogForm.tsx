import React, { useState, useEffect } from 'react';
import { Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiUrl } from "@/config/api";

interface EmissionFactor {
  id: number;
  category: string;
  activity_name: string;
  unit: string;
  factor_value: number;
  region: string;
  notes?: string;
}

interface Supplier {
  id: number;
  name: string;
  industry_type: string;
  sustainability_rating: number;
}

interface Scope3LogFormProps {
  onSuccess?: () => void;
}

export function Scope3LogForm({ onSuccess }: Scope3LogFormProps) {
  const businessId = localStorage.getItem("user_id");

  // Form state
  const [category, setCategory] = useState<'Goods' | 'Logistics' | 'Travel' | 'Commute'>('Goods');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<number | null>(null);
  
  // Category-specific inputs
  const [rawQuantity, setRawQuantity] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [unitCount, setUnitCount] = useState<string>('');
  const [materialType, setMaterialType] = useState<string>('');
  const [flightClass, setFlightClass] = useState<'Economy' | 'Premium Economy' | 'Business'>('Economy');
  const [transportMode, setTransportMode] = useState<string>('');
  
  // Cost & metadata
  const [cost, setCost] = useState<string>('');
  const [sourceReference, setSourceReference] = useState<string>('');
  const [dateOfActivity, setDateOfActivity] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Calculation preview
  const [estimatedCo2, setEstimatedCo2] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
    fetchFactors();
  }, []);

  // Calculate CO2 preview when inputs change
  useEffect(() => {
    calculatePreview();
  }, [category, selectedFactor, rawQuantity, weight, unitCount, flightClass]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(apiUrl(`/api/scope3/suppliers?business_id=${businessId}`));
      const data = await response.json();
      setSuppliers(data || []);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const fetchFactors = async () => {
    try {
      const response = await fetch(apiUrl(`/api/scope3/emission-factors?region=Global`));
      const data = await response.json();
      setFactors(data || []);
    } catch (err) {
      console.error('Failed to fetch factors:', err);
    }
  };

  const getClassMultiplier = (): number => {
    if (category === 'Travel') {
      switch (flightClass) {
        case 'Economy': return 1.0;
        case 'Premium Economy': return 1.5;
        case 'Business': return 2.6;
        default: return 1.0;
      }
    }
    return 1.0;
  };

  const calculatePreview = () => {
    if (!selectedFactor || !rawQuantity) {
      setEstimatedCo2(null);
      return;
    }

    const factor = factors.find(f => f.id === selectedFactor);
    if (!factor) return;

    let co2 = 0;

    try {
      const qty = parseFloat(rawQuantity);
      const factorValue = factor.factor_value;

      switch (category) {
        case 'Goods':
          co2 = qty * factorValue;
          break;

        case 'Logistics':
          if (weight) {
            const wt = parseFloat(weight);
            co2 = qty * wt * factorValue;
          }
          break;

        case 'Travel':
          const multiplier = getClassMultiplier();
          co2 = qty * factorValue * multiplier;
          break;

        case 'Commute':
          if (unitCount) {
            const days = parseFloat(unitCount);
            co2 = days * qty * factorValue;
          }
          break;
      }

      setEstimatedCo2(co2);
    } catch (err) {
      setEstimatedCo2(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!selectedFactor || !rawQuantity) {
        throw new Error('Please fill in all required fields');
      }

      if (category === 'Logistics' && !weight) {
        throw new Error('Weight is required for logistics entries');
      }

      if (category === 'Commute' && !unitCount) {
        throw new Error('Days/employees count is required for commute entries');
      }

      // Build query parameters
      const params = new URLSearchParams({
        business_id: businessId || '',
        factor_id: selectedFactor.toString(),
        raw_quantity: rawQuantity,
        date_of_activity: dateOfActivity,
      });

      if (selectedSupplier) params.append('supplier_id', selectedSupplier.toString());
      if (weight) params.append('weight_in_tons', weight);
      if (unitCount) params.append('unit_count', unitCount);
      if (cost) params.append('calculated_cost', cost);
      if (sourceReference) params.append('source_reference', sourceReference);

      // Submit to API
      const response = await fetch(apiUrl(`/api/scope3/logs?${params}`), {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to log activity');
      }

      // Success!
      setSuccess(true);
      
      // Reset form
      setRawQuantity('');
      setWeight('');
      setUnitCount('');
      setCost('');
      setSourceReference('');
      setSelectedSupplier(null);
      setEstimatedCo2(null);

      // Callback
      if (onSuccess) onSuccess();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered factors based on category
  const categoryFactors = factors.filter(f => f.category === category);

  const selectedFactorData = factors.find(f => f.id === selectedFactor);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Truck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Log Scope 3 Activity</h3>
          <p className="text-xs text-slate-500">Track supply chain emissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Activity Category *</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as typeof category);
              setSelectedFactor(null);
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium"
          >
            <option value="Goods">🏭 Purchased Goods</option>
            <option value="Logistics">🚚 Logistics & Freight</option>
            <option value="Travel">✈️ Business Travel</option>
            <option value="Commute">🚗 Employee Commute</option>
          </select>
        </div>

        {/* Category-Specific Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* GOODS */}
          {category === 'Goods' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Material Type *</label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium"
                >
                  <option value="">Select material...</option>
                  <option value="steel">♻️ Steel (Recycled/Virgin)</option>
                  <option value="aluminum">♻️ Aluminum</option>
                  <option value="paper">📄 Paper</option>
                  <option value="plastic">♻️ Plastic</option>
                  <option value="glass">🍾 Glass</option>
                  <option value="concrete">🏗️ Concrete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Quantity (kg) *</label>
                <input
                  type="number"
                  value={rawQuantity}
                  onChange={(e) => setRawQuantity(e.target.value)}
                  placeholder="e.g., 500"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* LOGISTICS */}
          {category === 'Logistics' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Supplier</label>
                <select
                  value={selectedSupplier || ''}
                  onChange={(e) => setSelectedSupplier(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Distance (km) *</label>
                <input
                  type="number"
                  value={rawQuantity}
                  onChange={(e) => setRawQuantity(e.target.value)}
                  placeholder="e.g., 1500"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Weight (tons) *</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 2"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* TRAVEL */}
          {category === 'Travel' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Flight Distance (km) *</label>
                <input
                  type="number"
                  value={rawQuantity}
                  onChange={(e) => setRawQuantity(e.target.value)}
                  placeholder="e.g., 8000"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Flight Class *</label>
                <select
                  value={flightClass}
                  onChange={(e) => setFlightClass(e.target.value as typeof flightClass)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium"
                >
                  <option value="Economy">💺 Economy (1.0x)</option>
                  <option value="Premium Economy">🪑 Premium Economy (1.5x)</option>
                  <option value="Business">✈️ Business Class (2.6x)</option>
                </select>
              </div>
            </>
          )}

          {/* COMMUTE */}
          {category === 'Commute' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Transport Mode *</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium"
                >
                  <option value="">Select mode...</option>
                  <option value="petrol">🚗 Petrol Car</option>
                  <option value="diesel">🚙 Diesel Car</option>
                  <option value="ev">🔋 Electric Vehicle</option>
                  <option value="bus">🚌 Public Bus</option>
                  <option value="train">🚆 Train</option>
                  <option value="motorcycle">🏍️ Motorcycle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Distance per Day (km) *</label>
                <input
                  type="number"
                  value={rawQuantity}
                  onChange={(e) => setRawQuantity(e.target.value)}
                  placeholder="e.g., 50"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Work Days / Employees *</label>
                <input
                  type="number"
                  value={unitCount}
                  onChange={(e) => setUnitCount(e.target.value)}
                  placeholder="e.g., 20 days or 10 employees"
                  step="1"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* EMISSION FACTOR SELECT (all categories) */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-slate-900 mb-2">Select Activity Type *</label>
            <select
              value={selectedFactor || ''}
              onChange={(e) => setSelectedFactor(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium"
            >
              <option value="">Choose from {category} activities...</option>
              {categoryFactors.map(f => (
                <option key={f.id} value={f.id}>
                  {f.activity_name} ({f.unit}) - {f.notes}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cost & Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Cost (optional)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g., 50000"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Invoice / Reference ID</label>
            <input
              type="text"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              placeholder="e.g., INV#12345 or Shipment#ABC"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Date of Activity *</label>
            <input
              type="date"
              value={dateOfActivity}
              onChange={(e) => setDateOfActivity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* CO2 Preview */}
        {estimatedCo2 !== null && selectedFactorData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-semibold">Estimated Carbon Footprint</p>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {estimatedCo2.toFixed(2)} kg CO₂e
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Using: <strong>{selectedFactorData.activity_name}</strong> ({selectedFactorData.unit})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900">Activity logged successfully! ✅</p>
              <p className="text-xs text-green-700 mt-1">Supplier rating has been updated.</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? '⏳ Logging...' : '📝 Log Activity'}
          </button>
        </div>
      </form>
    </div>
  );
}
