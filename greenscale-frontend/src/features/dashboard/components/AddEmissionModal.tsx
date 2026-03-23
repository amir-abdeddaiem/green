import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Zap, Flame, Droplets, TrendingUp } from "lucide-react";
import { apiUrl } from "@/config/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  type: 'Electricity' | 'Natural Gas' | 'Fuel' | 'Waste';
}

export function AddEmissionModal({ isOpen, onClose, onSuccess, type }: Props) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const businessId = localStorage.getItem("user_id");
    const unit = type === 'Electricity' ? 'kWh' : type === 'Fuel' ? 'Liters' : 'm³';

    try {
      const response = await fetch(apiUrl("/add-emission"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: parseInt(businessId || "0"),
          type: type,
          value: parseFloat(value),
          unit: unit
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save log");
      }

      const result = await response.json();
      console.log("✅ Emission logged successfully:", result);
      
      setValue("");
      alert(`✅ Success! Impact Calculated: ${result.impact} kg CO2e`);
      
      // Wait a moment for database to commit, then call success callback
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
      
    } catch (error: any) {
      console.error("Error saving emission:", error);
      alert("❌ Error saving data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClasses = () => {
    switch(type) {
      case 'Electricity': return { bg: 'bg-green-700', icon: Zap, label: 'bg-green-100 text-green-900 border border-green-400' };
      case 'Natural Gas': return { bg: 'bg-green-600', icon: Flame, label: 'bg-green-100 text-green-900 border border-green-400' };
      case 'Fuel': return { bg: 'bg-green-600', icon: Droplets, label: 'bg-green-100 text-green-900 border border-green-400' };
      default: return { bg: 'bg-green-700', icon: Droplets, label: 'bg-green-100 text-green-900 border border-green-400' };
    }
  };

  const colors = getColorClasses();
  const IconComponent = colors.icon;
  const estimatedCO2 = value ? (parseFloat(value) * (type === 'Electricity' ? 0.4 : type === 'Natural Gas' ? 2.0 : 2.7)).toFixed(2) : '0';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-lg border border-green-300 shadow-2xl p-0 overflow-hidden bg-white">
        {/* Header */}
        <div className={`relative h-32 md:h-40 ${colors.bg} overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative h-full flex items-end p-6 md:p-8">
            <div className={`w-12 h-12 md:w-14 md:h-14 ${colors.label} rounded-lg flex items-center justify-center`}>
              <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <DialogTitle className="text-2xl md:text-3xl font-black text-green-900">Log {type}</DialogTitle>
            <DialogDescription className="text-green-700 font-medium mt-2 text-sm md:text-base">
              Track your {type.toLowerCase()} consumption and calculate environmental impact
            </DialogDescription>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Section */}
            <div className="space-y-3">
              <Label className="text-sm md:text-base font-black uppercase tracking-widest text-green-700 block">
                Quantity ({type === 'Electricity' ? 'kWh' : type === 'Fuel' ? 'Liters' : 'm³'})
              </Label>
              <Input
                type="number"
                placeholder="Enter amount..."
                className="h-12 md:h-14 rounded-lg border-2 border-green-400 bg-green-50 focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-300 transition-all text-lg md:text-xl font-bold text-green-900 placeholder:text-green-400"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                step="0.01"
              />
            </div>

            {/* CO2 Estimation Card */}
            {value && (
              <div className="p-4 md:p-6 bg-green-50 rounded-lg border-2 border-green-300 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-700 w-5 h-5 md:w-6 md:h-6" />
                  <p className="text-sm font-bold text-green-600">CO2 Impact Estimate</p>
                </div>
                <p className="text-2xl md:text-3xl font-black text-green-900">{estimatedCO2} kg CO2e</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 md:h-14 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm md:text-base transition-all border border-green-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !value}
                className={`flex-1 h-12 md:h-14 rounded-lg ${colors.bg} hover:bg-green-800 text-white font-bold text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-400`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm md:text-base">Calculating...</span>
                  </span>
                ) : "Log Emission Data"}
              </Button>
            </div>
          </form>

          {/* Info Footer */}
          <div className="pt-4 border-t border-green-300">
            <p className="text-xs md:text-sm text-green-600 text-center font-medium">
              💡 Your data helps track carbon footprint and identify reduction opportunities
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}