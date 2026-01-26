import React, { useState } from 'react';
import { Plus, X, AlertCircle, CheckCircle2, Loader, MapPin, Phone, Globe } from 'lucide-react';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type IndustryType = 'manufacturing' | 'logistics' | 'professional_services' | 'retail' | 'other';

interface FormErrors {
  supplierName?: string;
  contact?: string;
  website?: string;
}

export function AddSupplierModal({ isOpen, onClose, onSuccess }: AddSupplierModalProps) {
  const [supplierName, setSupplierName] = useState('');
  const [industryType, setIndustryType] = useState<IndustryType>('manufacturing');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const businessId = localStorage.getItem('user_id');

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!supplierName.trim()) {
      errors.supplierName = 'Supplier name is required';
    } else if (supplierName.length < 2) {
      errors.supplierName = 'Supplier name must be at least 2 characters';
    } else if (supplierName.length > 100) {
      errors.supplierName = 'Supplier name must be less than 100 characters';
    }

    if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      errors.contact = 'Invalid email format';
    }

    if (website && !/^https?:\/\/.+/.test(website) && website.length > 0) {
      errors.website = 'Website must start with http:// or https://';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError(null);
    setSuccess(false);

    if (!businessId) {
      setError('Business ID not found');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        business_id: businessId || '',
        name: supplierName.trim(),
        industry_type: industryType,
      });
      
      if (contact) params.append('contact_email', contact);
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/scope3/suppliers?${params.toString()}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Failed to create supplier';
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err: any) => err.msg || err).join(', ');
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setSupplierName('');
      setIndustryType('manufacturing');
      setContact('');
      setAddress('');
      setWebsite('');
      setFormErrors({});

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSupplierName('');
    setIndustryType('manufacturing');
    setContact('');
    setAddress('');
    setWebsite('');
    setFormErrors({});
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Add New Supplier</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">Supplier Created!</p>
              <p className="text-slate-600 text-center">
                <span className="font-semibold">{supplierName}</span> has been added to your supply chain.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Supplier Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Supplier Name *</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => {
                    setSupplierName(e.target.value);
                    if (formErrors.supplierName) setFormErrors({ ...formErrors, supplierName: undefined });
                  }}
                  placeholder="e.g., ABC Manufacturing Ltd"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                    formErrors.supplierName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  maxLength={100}
                />
                {formErrors.supplierName && <p className="text-xs text-red-600 mt-1">{formErrors.supplierName}</p>}
                <p className="text-xs text-slate-500 mt-1">{supplierName.length}/100</p>
              </div>

              {/* Industry Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Industry Type *</label>
                <select
                  value={industryType}
                  onChange={(e) => setIndustryType(e.target.value as IndustryType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  disabled={loading}
                >
                  <option value="manufacturing">🏭 Manufacturing</option>
                  <option value="logistics">🚚 Logistics & Transportation</option>
                  <option value="professional_services">💼 Professional Services</option>
                  <option value="retail">🛒 Retail & Distribution</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (formErrors.contact) setFormErrors({ ...formErrors, contact: undefined });
                  }}
                  placeholder="supplier@company.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                    formErrors.contact ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.contact && <p className="text-xs text-red-600 mt-1">{formErrors.contact}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />Address (Optional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  disabled={loading}
                  maxLength={200}
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />Website (Optional)
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    if (formErrors.website) setFormErrors({ ...formErrors, website: undefined });
                  }}
                  placeholder="https://company.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                    formErrors.website ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {formErrors.website && <p className="text-xs text-red-600 mt-1">{formErrors.website}</p>}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">💡 Tip:</span> Track supplier emissions, monitor sustainability ratings, and compare carbon intensity against industry benchmarks.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-slate-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading || !supplierName.trim()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-slate-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Supplier
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
