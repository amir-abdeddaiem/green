"""Carbon calculation utilities.

This module centralizes emission factors so OCR extraction, manual logging,
and reports remain consistent.

Notes:
- Factors below are placeholders for Tunisia and should be validated against
  the official source you choose (e.g., STEG national grid factor for a year).
- Units are important: factors are expressed as kg CO2e per unit.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional


ActivityType = Literal[
    "electricity_kwh",
    "natural_gas_m3",
    "water_m3",
    "diesel_l",
    "petrol_l",
    "transport_km",
    "waste_kg",
]


@dataclass(frozen=True)
class EmissionFactor:
    activity_type: ActivityType
    unit: str
    kg_co2e_per_unit: float
    region: str
    source: str


# ---- Tunisia factors (PLACEHOLDERS to be validated) ----
# Electricity: national grid factor (kg CO2e / kWh)
TN_ELECTRICITY_KG_PER_KWH = 0.45

# Natural gas: combustion (kg CO2e / m3). This varies by gas composition.
TN_NATURAL_GAS_KG_PER_M3 = 2.05

# Water: supply + treatment (kg CO2e / m3). Often depends on utility + energy mix.
TN_WATER_KG_PER_M3 = 0.34

# Fuels: tailpipe (kg CO2e / liter). Typical defaults.
TN_DIESEL_KG_PER_L = 2.68
TN_PETROL_KG_PER_L = 2.31

# Transport: if only km is known, you need an assumption (vehicle type).
TN_TRANSPORT_KG_PER_KM = 0.192

# Waste: highly dependent on treatment route; keep placeholder.
TN_WASTE_KG_PER_KG = 0.50


TN_FACTORS: dict[ActivityType, EmissionFactor] = {
    "electricity_kwh": EmissionFactor(
        activity_type="electricity_kwh",
        unit="kWh",
        kg_co2e_per_unit=TN_ELECTRICITY_KG_PER_KWH,
        region="Tunisia",
        source="placeholder",
    ),
    "natural_gas_m3": EmissionFactor(
        activity_type="natural_gas_m3",
        unit="m3",
        kg_co2e_per_unit=TN_NATURAL_GAS_KG_PER_M3,
        region="Tunisia",
        source="placeholder",
    ),
    "water_m3": EmissionFactor(
        activity_type="water_m3",
        unit="m3",
        kg_co2e_per_unit=TN_WATER_KG_PER_M3,
        region="Tunisia",
        source="placeholder",
    ),
    "diesel_l": EmissionFactor(
        activity_type="diesel_l",
        unit="L",
        kg_co2e_per_unit=TN_DIESEL_KG_PER_L,
        region="Tunisia",
        source="placeholder",
    ),
    "petrol_l": EmissionFactor(
        activity_type="petrol_l",
        unit="L",
        kg_co2e_per_unit=TN_PETROL_KG_PER_L,
        region="Tunisia",
        source="placeholder",
    ),
    "transport_km": EmissionFactor(
        activity_type="transport_km",
        unit="km",
        kg_co2e_per_unit=TN_TRANSPORT_KG_PER_KM,
        region="Tunisia",
        source="placeholder",
    ),
    "waste_kg": EmissionFactor(
        activity_type="waste_kg",
        unit="kg",
        kg_co2e_per_unit=TN_WASTE_KG_PER_KG,
        region="Tunisia",
        source="placeholder",
    ),
}


# Backward-compatible mapping used by older endpoints.
FACTORS = {
    "Electricity": TN_ELECTRICITY_KG_PER_KWH,
    "Natural Gas": TN_NATURAL_GAS_KG_PER_M3,
    "Water": TN_WATER_KG_PER_M3,
    "Fuel": TN_DIESEL_KG_PER_L,
    "Waste": TN_WASTE_KG_PER_KG,
}


def calculate_co2(type: str, value: float) -> float:
    factor = FACTORS.get(type, 0.0)
    return round(float(value) * float(factor), 2)


def calculate_co2_from_activity(
    activity_type: ActivityType,
    value: float,
) -> Optional[float]:
    factor = TN_FACTORS.get(activity_type)
    if not factor:
        return None
    return round(float(value) * float(factor.kg_co2e_per_unit), 3)