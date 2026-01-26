"""
Initialize Scope 3 Emission Factors Library with DEFRA-aligned data.
Run this once to populate the emission_factors table with real-world conversion factors.
"""

from database import SessionLocal
from models import EmissionFactor
from decimal import Decimal

# DEFRA-aligned emission factors for Scope 3
EMISSION_FACTORS = [
    # ===== TRANSPORTATION (Logistics) =====
    {
        "category": "Transportation",
        "activity_name": "Ocean Freight",
        "unit": "ton-km",
        "factor_value": Decimal("0.00011200"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Container ship, includes loading/unloading"
    },
    {
        "category": "Transportation",
        "activity_name": "HGV (Heavy Goods Vehicle)",
        "unit": "km",
        "factor_value": Decimal("0.00098000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Articulated lorry (33 tons), 65% capacity utilization"
    },
    {
        "category": "Transportation",
        "activity_name": "Van",
        "unit": "km",
        "factor_value": Decimal("0.00034000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Small van, 50% capacity utilization"
    },
    {
        "category": "Transportation",
        "activity_name": "Air Cargo",
        "unit": "km",
        "factor_value": Decimal("0.00523000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "International air freight, 65% capacity"
    },
    {
        "category": "Transportation",
        "activity_name": "Rail Freight",
        "unit": "ton-km",
        "factor_value": Decimal("0.00004100"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Freight train, average loading"
    },
    
    # ===== PURCHASED GOODS (Materials) =====
    {
        "category": "Goods",
        "activity_name": "Recycled Steel",
        "unit": "kg",
        "factor_value": Decimal("1.20000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Recycled content material, lower embodied carbon"
    },
    {
        "category": "Goods",
        "activity_name": "Virgin Steel",
        "unit": "kg",
        "factor_value": Decimal("2.10000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Primary steel production from ore"
    },
    {
        "category": "Goods",
        "activity_name": "Aluminum",
        "unit": "kg",
        "factor_value": Decimal("11.50000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Primary aluminum smelting"
    },
    {
        "category": "Goods",
        "activity_name": "Recycled Aluminum",
        "unit": "kg",
        "factor_value": Decimal("0.85000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Recycled aluminum, ~95% lower than virgin"
    },
    {
        "category": "Goods",
        "activity_name": "Paper",
        "unit": "kg",
        "factor_value": Decimal("0.60000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Average paper (mix of virgin and recycled)"
    },
    {
        "category": "Goods",
        "activity_name": "Plastic",
        "unit": "kg",
        "factor_value": Decimal("3.50000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Virgin plastic production"
    },
    {
        "category": "Goods",
        "activity_name": "Recycled Plastic",
        "unit": "kg",
        "factor_value": Decimal("1.80000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Recycled plastic (~50% lower)"
    },
    {
        "category": "Goods",
        "activity_name": "Glass",
        "unit": "kg",
        "factor_value": Decimal("0.85000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Container glass production"
    },
    {
        "category": "Goods",
        "activity_name": "Concrete",
        "unit": "ton",
        "factor_value": Decimal("0.12000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Ready-mix concrete"
    },
    
    # ===== BUSINESS TRAVEL (Flights) =====
    {
        "category": "Travel",
        "activity_name": "Short-haul Flight Economy",
        "unit": "km",
        "factor_value": Decimal("0.25000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Distance <500km, economy class"
    },
    {
        "category": "Travel",
        "activity_name": "Long-haul Flight Economy",
        "unit": "km",
        "factor_value": Decimal("0.15000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Distance >500km, economy class (better per-km efficiency)"
    },
    {
        "category": "Travel",
        "activity_name": "Business Class Multiplier",
        "unit": "multiplier",
        "factor_value": Decimal("2.60000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Apply 2.6x to economy class for business/first"
    },
    {
        "category": "Travel",
        "activity_name": "Premium Economy Multiplier",
        "unit": "multiplier",
        "factor_value": Decimal("1.50000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Apply 1.5x to economy class for premium economy"
    },
    {
        "category": "Travel",
        "activity_name": "Rail Travel",
        "unit": "km",
        "factor_value": Decimal("0.00004100"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Passenger train travel (very low emissions)"
    },
    {
        "category": "Travel",
        "activity_name": "Hotel Stay",
        "unit": "night",
        "factor_value": Decimal("25.00000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Average hotel night (4-star equivalent)"
    },
    
    # ===== EMPLOYEE COMMUTE =====
    {
        "category": "Commute",
        "activity_name": "Petrol Car",
        "unit": "km",
        "factor_value": Decimal("0.19200000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Average petrol car, 1 occupant"
    },
    {
        "category": "Commute",
        "activity_name": "Diesel Car",
        "unit": "km",
        "factor_value": Decimal("0.16700000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Average diesel car, 1 occupant"
    },
    {
        "category": "Commute",
        "activity_name": "Electric Vehicle",
        "unit": "km",
        "factor_value": Decimal("0.05000000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "EV with UK grid mix electricity"
    },
    {
        "category": "Commute",
        "activity_name": "Public Transport (Bus)",
        "unit": "km",
        "factor_value": Decimal("0.10200000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Per-passenger basis, typical occupancy"
    },
    {
        "category": "Commute",
        "activity_name": "Public Transport (Train)",
        "unit": "km",
        "factor_value": Decimal("0.04100000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Per-passenger basis, typical occupancy"
    },
    {
        "category": "Commute",
        "activity_name": "Motorcycle",
        "unit": "km",
        "factor_value": Decimal("0.09200000"),
        "region": "Global",
        "source": "DEFRA",
        "notes": "Average motorcycle (125-650cc)"
    },
]


def init_emission_factors():
    """Initialize emission factors table with DEFRA-aligned defaults."""
    db = SessionLocal()
    
    try:
        # Check if already populated
        existing_count = db.query(EmissionFactor).count()
        if existing_count > 0:
            print(f"✅ Emission factors already initialized ({existing_count} entries). Skipping...")
            return
        
        # Bulk insert all factors
        factors_to_insert = [EmissionFactor(**factor) for factor in EMISSION_FACTORS]
        db.bulk_save_objects(factors_to_insert)
        db.commit()
        
        print(f"✅ Successfully initialized {len(EMISSION_FACTORS)} emission factors!")
        print("   - Transportation: 5 factors (Ocean, HGV, Van, Air, Rail)")
        print("   - Goods: 9 factors (Steel, Aluminum, Paper, Plastic, Glass, Concrete, etc.)")
        print("   - Travel: 6 factors (Flights, Rail, Hotel, Class multipliers)")
        print("   - Commute: 6 factors (Car, EV, Public Transport, Motorcycle)")
        
    except Exception as e:
        print(f"❌ Error initializing emission factors: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_emission_factors()
