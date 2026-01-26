"""
Scope 3 Service: Smart category-based calculation engine for supply chain emissions.
Handles different calculation logic for Transportation, Goods, Travel, and Commute.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Optional
from database import SessionLocal
from models import EmissionFactor, Supplier, Scope3Log


class Scope3Calculator:
    """
    Multi-category calculation engine for Scope 3 emissions.
    Each category uses different mathematical logic based on activity type.
    """
    
    def __init__(self, db=None):
        """Initialize calculator with optional database session."""
        self.db = db or SessionLocal()
        self.precision = Decimal("0.00001")  # 5 decimal places for CO2e results
    
    def calculate_logistics(self, distance_km: float, weight_tons: float, factor_value: Decimal) -> Decimal:
        """
        Calculate Scope 3 logistics emissions.
        Formula: Distance (km) × Weight (tons) × Factor (kg CO2e / ton-km) = CO2e (kg)
        
        Example:
            - 1500 km shipment, 2 tons, factor 0.00011 = 1500 × 2 × 0.00011 = 0.33 kg CO2e
        """
        try:
            distance = Decimal(str(distance_km))
            weight = Decimal(str(weight_tons))
            
            # Validate inputs
            if distance <= 0:
                raise ValueError(f"Distance must be positive, got {distance}")
            if weight <= 0:
                raise ValueError(f"Weight must be positive, got {weight}")
            
            # Tonne-km calculation
            co2e = distance * weight * factor_value
            
            # Normalize to metric tons CO2e (kg → kg, no conversion needed)
            result = co2e.quantize(self.precision, rounding=ROUND_HALF_UP)
            
            return result
        
        except Exception as e:
            raise ValueError(f"Logistics calculation error: {e}") from e
    
    def calculate_goods(self, quantity_kg: float, factor_value: Decimal) -> Decimal:
        """
        Calculate Scope 3 purchased goods emissions.
        Formula: Quantity (kg/ton) × Factor (kg CO2e / kg material) = CO2e (kg)
        
        Example:
            - 500 kg recycled aluminum, factor 0.85 = 500 × 0.85 = 425 kg CO2e
        """
        try:
            quantity = Decimal(str(quantity_kg))
            
            # Validate input
            if quantity <= 0:
                raise ValueError(f"Quantity must be positive, got {quantity}")
            
            # Simple multiplication
            co2e = quantity * factor_value
            
            # Normalize to metric tons CO2e (kg → kg)
            result = co2e.quantize(self.precision, rounding=ROUND_HALF_UP)
            
            return result
        
        except Exception as e:
            raise ValueError(f"Goods calculation error: {e}") from e
    
    def calculate_travel(self, distance_km: float, factor_value: Decimal, 
                        class_multiplier: Decimal = Decimal("1.0")) -> Decimal:
        """
        Calculate Scope 3 business travel emissions.
        Formula: Distance (km) × Factor (kg CO2e / km) × Class Multiplier = CO2e (kg)
        
        Examples:
            - 8000 km long-haul economy, factor 0.15, multiplier 1.0 = 8000 × 0.15 = 1200 kg CO2e
            - Same flight but business class, multiplier 2.6 = 8000 × 0.15 × 2.6 = 3120 kg CO2e
        """
        try:
            distance = Decimal(str(distance_km))
            multiplier = Decimal(str(class_multiplier))
            
            # Validate inputs
            if distance <= 0:
                raise ValueError(f"Distance must be positive, got {distance}")
            if multiplier <= 0:
                raise ValueError(f"Class multiplier must be positive, got {multiplier}")
            
            # Distance × factor × class multiplier
            co2e = distance * factor_value * multiplier
            
            # Normalize to metric tons CO2e (kg → kg)
            result = co2e.quantize(self.precision, rounding=ROUND_HALF_UP)
            
            return result
        
        except Exception as e:
            raise ValueError(f"Travel calculation error: {e}") from e
    
    def calculate_commute(self, days: int, km_per_day: float, factor_value: Decimal) -> Decimal:
        """
        Calculate Scope 3 employee commute emissions.
        Formula: Days × km/day × Factor (kg CO2e / km) = CO2e (kg)
        
        Examples:
            - 20 work days, 50 km/day car, factor 0.192 = 20 × 50 × 0.192 = 192 kg CO2e
            - 20 days, 50 km/day EV, factor 0.05 = 20 × 50 × 0.05 = 50 kg CO2e
        """
        try:
            days_d = Decimal(str(days))
            km_per_day_d = Decimal(str(km_per_day))
            
            # Validate inputs
            if days <= 0:
                raise ValueError(f"Days must be positive, got {days}")
            if km_per_day_d < 0:
                raise ValueError(f"km/day cannot be negative, got {km_per_day_d}")
            
            # Days × km/day × factor
            co2e = days_d * km_per_day_d * factor_value
            
            # Normalize to metric tons CO2e (kg → kg)
            result = co2e.quantize(self.precision, rounding=ROUND_HALF_UP)
            
            return result
        
        except Exception as e:
            raise ValueError(f"Commute calculation error: {e}") from e
    
    def calculate_emission(self, category: str, factor: EmissionFactor, 
                         raw_quantity: float, weight_tons: Optional[float] = None,
                         unit_count: Optional[int] = None) -> Decimal:
        """
        Master calculation dispatcher. Routes to appropriate calculation based on category.
        
        Args:
            category: "Transportation", "Goods", "Travel", or "Commute"
            factor: EmissionFactor object with category, unit, factor_value
            raw_quantity: Primary quantity (km for transport/travel, kg for goods, etc.)
            weight_tons: Optional tonnage (used in logistics)
            unit_count: Optional count (used in travel/commute)
        
        Returns:
            Decimal: Final CO2e in kg (normalized)
        """
        try:
            if category == "Transportation":
                if weight_tons is None:
                    raise ValueError("Transportation requires weight_tons parameter")
                factor_val = Decimal(str(factor.factor_value))  # type: ignore
                return self.calculate_logistics(raw_quantity, weight_tons, factor_val)
            
            elif category == "Goods":
                factor_val = Decimal(str(factor.factor_value))  # type: ignore
                return self.calculate_goods(raw_quantity, factor_val)
            
            elif category == "Travel":
                # For travel, raw_quantity is distance, unit_count is multiplier factor
                multiplier = Decimal(str(unit_count)) if unit_count else Decimal("1.0")
                factor_val = Decimal(str(factor.factor_value))  # type: ignore
                return self.calculate_travel(raw_quantity, factor_val, multiplier)
            
            elif category == "Commute":
                # For commute, raw_quantity is km/day, unit_count is days
                if unit_count is None:
                    raise ValueError("Commute requires unit_count (days) parameter")
                factor_val = Decimal(str(factor.factor_value))  # type: ignore
                return self.calculate_commute(unit_count, raw_quantity, factor_val)
            
            else:
                raise ValueError(f"Unknown category: {category}")
        
        except Exception as e:
            raise ValueError(f"Emission calculation failed: {e}") from e


class SupplierScoringEngine:
    """
    Automated sustainability scoring engine.
    Updates supplier ratings based on carbon intensity.
    """
    
    def __init__(self, db=None):
        """Initialize scoring engine."""
        self.db = db or SessionLocal()
    
    def calculate_carbon_intensity(self, total_co2_kg: float, total_units: float) -> Decimal:
        """
        Calculate carbon intensity: kg CO2e per unit.
        
        Example:
            - 1000 kg CO2e / 2000 kg material = 0.5 kg CO2e/kg material
        """
        if total_units <= 0:
            return Decimal("0")
        
        intensity = Decimal(str(total_co2_kg)) / Decimal(str(total_units))
        return intensity.quantize(Decimal("0.00000001"), rounding=ROUND_HALF_UP)
    
    def calculate_sustainability_rating(self, carbon_intensity: Decimal, 
                                      industry_avg_intensity: Decimal) -> Decimal:
        """
        Calculate 1-5 star sustainability rating based on carbon intensity.
        
        Logic:
            - 5 stars: 0-20% of industry average (excellent)
            - 4 stars: 20-60% of average (good)
            - 3 stars: 60-100% of average (average)
            - 2 stars: 100-150% of average (below average)
            - 1 star: 150%+ of average (poor)
        """
        if industry_avg_intensity <= 0:
            return Decimal("3.0")  # Default to average if no comparison available
        
        ratio = carbon_intensity / industry_avg_intensity
        
        if ratio <= Decimal("0.2"):
            rating = Decimal("5.0")
        elif ratio <= Decimal("0.6"):
            rating = Decimal("4.0")
        elif ratio <= Decimal("1.0"):
            rating = Decimal("3.0")
        elif ratio <= Decimal("1.5"):
            rating = Decimal("2.0")
        else:
            rating = Decimal("1.0")
        
        return rating
    
    def update_supplier_rating(self, supplier_id: int):
        """
        Update supplier's sustainability rating after new scope3_log is recorded.
        Called as callback after each insert.
        """
        try:
            supplier = self.db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if not supplier:
                raise ValueError(f"Supplier {supplier_id} not found")
            
            # Recalculate totals from scope3_logs
            logs = self.db.query(Scope3Log).filter(Scope3Log.supplier_id == supplier_id).all()
            
            total_co2 = sum(float(log.calculated_co2) for log in logs) if logs else 0  # type: ignore
            total_units = sum(float(log.raw_quantity) for log in logs) if logs else 0  # type: ignore
            
            # Update supplier totals using update() pattern
            self.db.query(Supplier).filter(Supplier.id == supplier_id).update({
                Supplier.total_co2: Decimal(str(total_co2)),
                Supplier.total_units: Decimal(str(total_units))
            })
            
            # Refresh to get updated values
            self.db.flush()
            supplier = self.db.query(Supplier).filter(Supplier.id == supplier_id).first()
            
            # Calculate carbon intensity
            intensity = self.calculate_carbon_intensity(total_co2, total_units)
            
            # Calculate industry average for this category
            same_industry = self.db.query(Supplier).filter(
                Supplier.industry_type == supplier.industry_type
            ).all()
            
            if same_industry:
                avg_intensity = sum(float(s.carbon_intensity) for s in same_industry) / len(same_industry) if same_industry else 0  # type: ignore
                avg_intensity = Decimal(str(avg_intensity))
            else:
                avg_intensity = intensity  # Use own intensity as reference if first
            
            # Calculate new rating
            new_rating = self.calculate_sustainability_rating(intensity, avg_intensity)
            
            # Update supplier with new rating and intensity using update() pattern
            self.db.query(Supplier).filter(Supplier.id == supplier_id).update({
                Supplier.carbon_intensity: intensity,
                Supplier.sustainability_rating: new_rating
            })
            
            # Persist changes
            self.db.commit()
            
            print(f"✅ Updated supplier {supplier.name}: Rating={float(new_rating):.1f}⭐, Intensity={float(intensity):.8f} kg CO2e/unit")
            
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Supplier rating update failed: {e}") from e
