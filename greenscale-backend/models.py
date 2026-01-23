"""SQLAlchemy ORM models for GreenScale database."""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, text
from sqlalchemy.orm import relationship

# Absolute import to prevent parent package errors
from database import Base


class User(Base):
    """User model for storing business information."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    # This must be named 'password' to match your login query
    password = Column(String(255), nullable=False)

    # Relationship to link emissions to a user
    emissions = relationship("Emission", back_populates="owner")


class Emission(Base):
    """Emission log model for tracking carbon emissions."""
    __tablename__ = "emissions"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(50), nullable=False)  # Electricity, Natural Gas, etc.
    value = Column(Float, nullable=False)      # The raw number
    unit = Column(String(20), nullable=False)  # kWh, m3, Liters
    co2_impact = Column(Float, nullable=False)  # The calculated result
    recorded_at = Column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")
    )

    # Back-reference to the user
    owner = relationship("User", back_populates="emissions")