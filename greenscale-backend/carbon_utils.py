# Conversion factors (Approximate kg CO2e per unit)
FACTORS = {
    "Electricity": 0.4,    # 0.4 kg per kWh
    "Natural Gas": 2.0,    # 2.0 kg per m3
    "Fuel": 2.7,           # 2.7 kg per Liter (Diesel/Petrol avg)
    "Waste": 0.5           # 0.5 kg per kg of waste
}

def calculate_co2(type: str, value: float) -> float:
    factor = FACTORS.get(type, 0)
    # Result in kg of CO2
    return round(value * factor, 2)