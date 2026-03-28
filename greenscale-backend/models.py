"""SQLAlchemy ORM models for Verdustry database."""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Table, Numeric, BigInteger, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

# Absolute import to prevent parent package errors
from database import Base

# Define the association table here to avoid circular imports
user_roles_table = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
)


class User(Base):
    """User model for storing business information."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    # This must be named 'password' to match your login query
    password = Column(String(255), nullable=False)
    is_super_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to link emissions to a user
    emissions = relationship("Emission", back_populates="owner")
    
    # Relationship to roles
    roles = relationship("Role", secondary=user_roles_table, back_populates="users")
    
    # Relationship to tariffs (for financial tracking)
    tariffs = relationship("Tariff", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship to budgets (for budget tracking)
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")

    # Relationship to OCR-scanned documents
    document_scans = relationship(
        "DocumentScan",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Emission(Base):
    """Emission log model for tracking carbon emissions."""
    __tablename__ = "emissions"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(50), nullable=False)  # Electricity, Natural Gas, etc.
    value = Column(Float, nullable=False)      # The raw number
    unit = Column(String(20), nullable=False)  # kWh, m3, Liters
    co2_impact = Column(Float, nullable=False)  # The calculated result
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Back-reference to the user
    owner = relationship("User", back_populates="emissions")


class Tariff(Base):
    """Tariff model for storing utility pricing per business."""
    __tablename__ = "tariffs"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    utility_type = Column(String(50), nullable=False)  # Electricity, Natural Gas, Fuel, Waste, Water
    price_per_unit = Column(Float, nullable=False)  # Price per kWh, m3, Liter, kg, etc.
    currency_code = Column(String(3), default="PKR", nullable=False)  # PKR, USD, EUR, GBP
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Back-reference to user
    user = relationship("User", back_populates="tariffs")


class ExchangeRate(Base):
    """Exchange rate cache model for currency conversion."""
    __tablename__ = "exchange_rates"

    id = Column(Integer, primary_key=True, index=True)
    from_currency = Column(String(3), nullable=False, index=True)  # e.g., "PKR"
    to_currency = Column(String(3), nullable=False, index=True)    # e.g., "USD"
    rate = Column(Float, nullable=False)  # Conversion rate
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Budget(Base):
    """Budget model for storing monthly spending limits."""
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month = Column(Integer, nullable=False)  # Month (1-12)
    year = Column(Integer, nullable=False)   # Year (e.g., 2025)
    monthly_limit = Column(Float, nullable=False)  # Maximum spending limit
    alert_percentage = Column(Float, default=80.0, nullable=False)  # Trigger alert at 80% of limit
    currency_code = Column(String(3), default="PKR", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Back-reference to user
    user = relationship("User", back_populates="budgets")


# ===== SCOPE 3 (SUPPLY CHAIN) MODELS =====

class SupplierIndustryType(str, enum.Enum):
    """Supplier industry classification."""
    MANUFACTURING = "Manufacturing"
    LOGISTICS = "Logistics"
    PROFESSIONAL_SERVICES = "Professional_Services"
    RETAIL = "Retail"
    OTHER = "Other"


class EmissionCategory(str, enum.Enum):
    """Emission factor categories for Scope 3."""
    TRANSPORTATION = "Transportation"
    GOODS = "Goods"
    TRAVEL = "Travel"
    COMMUTE = "Commute"


class Supplier(Base):
    """Supplier model for storing vendor information and sustainability ratings."""
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    industry_type = Column(String(50), default="Other", nullable=False)  # ENUM values
    contact_email = Column(String(100))
    sustainability_rating = Column(Numeric(3, 2), default=3.0, nullable=False)  # 1.0 to 5.0 stars
    carbon_intensity = Column(Numeric(15, 8), default=0, nullable=False)  # kg CO2e per unit
    total_co2 = Column(Numeric(15, 5), default=0, nullable=False)  # Cumulative CO2 (kg)
    total_units = Column(Numeric(15, 5), default=0, nullable=False)  # Cumulative units purchased
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User")
    scope3_logs = relationship("Scope3Log", back_populates="supplier", cascade="all, delete-orphan")


class EmissionFactor(Base):
    """Emission factor library for converting activities into CO2 equivalents (DEFRA-aligned)."""
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)  # Transportation, Goods, Travel, Commute
    activity_name = Column(String(100), nullable=False)  # e.g., "Ocean Freight", "Economy Flight"
    unit = Column(String(20), nullable=False)  # kg, ton-km, km, night, day
    factor_value = Column(Numeric(15, 8), nullable=False)  # kg CO2e per unit (high precision)
    region = Column(String(20), default="Global", nullable=False)  # Global, US, PK, UK
    source = Column(String(100), default="DEFRA", nullable=False)  # Data source (e.g., DEFRA, EPA)
    notes = Column(Text)  # Additional context (e.g., "Short-haul flight <500km")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Scope3Log(Base):
    """Scope 3 (Supply Chain) emission transaction ledger with audit trail."""
    __tablename__ = "scope3_logs"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True)
    factor_id = Column(Integer, ForeignKey("emission_factors.id", ondelete="RESTRICT"), nullable=False)
    
    # Input data
    raw_quantity = Column(Numeric(15, 2), nullable=False)  # e.g., 500 km, 2 tons, 1 flight
    weight_in_tons = Column(Numeric(15, 5), nullable=True)  # For logistics (Tonnage)
    unit_count = Column(Integer, nullable=True)  # For travel/commute (e.g., round trips, employees)
    
    # Calculated results
    calculated_co2 = Column(Numeric(15, 5), nullable=False)  # Final CO2e in kg (normalized)
    calculated_cost = Column(Numeric(15, 5), nullable=True)  # Financial cost (for Green ROI)
    currency_code = Column(String(3), default="PKR", nullable=False)
    
    # Audit trail
    source_reference = Column(String(100), nullable=True)  # Invoice #, Shipment ID, etc.
    date_of_activity = Column(DateTime, nullable=False)  # When the activity occurred
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User")
    supplier = relationship("Supplier", back_populates="scope3_logs")
    emission_factor = relationship("EmissionFactor")


class DocumentScan(Base):
    """OCR-scanned document store (raw text + sustainability-focused extraction)."""

    __tablename__ = "document_scans"

    id = Column(BigInteger, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    filename = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, default="other")
    content_type = Column(String(100), nullable=True)

    ocr_language = Column(String(40), nullable=True)
    detected_language = Column(String(40), nullable=True)

    ocr_text = Column(Text, nullable=True)
    filtered_text = Column(Text, nullable=True)
    extracted_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="document_scans")


class InvoiceLineItem(Base):
    """Extracted invoice line item (Tunisian utility bills, etc.)."""

    __tablename__ = "invoice_line_items"

    id = Column(BigInteger, primary_key=True, index=True)
    document_scan_id = Column(
        BigInteger,
        ForeignKey("document_scans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    libelle = Column(String(255), nullable=False)
    consommation = Column(String(100), nullable=True)
    montant = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document_scan = relationship("DocumentScan", backref="invoice_line_items")


class ExtractedDoc(Base):
    """Persisted extracted document payload for later display/export."""

    __tablename__ = "extracted_Doc"

    id = Column(BigInteger, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_scan_id = Column(
        BigInteger,
        ForeignKey("document_scans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    filename = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, default="other")
    extracted_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")
    document_scan = relationship("DocumentScan")