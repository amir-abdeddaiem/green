"""Financial module API routes for tariffs, budgets, and financial stats."""

import logging
from datetime import datetime
from sqlalchemy import and_, extract
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

import models
from database import get_db
from financial_utils import CurrencyConverter, TariffCalculator, BudgetChecker

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic schemas for request/response validation
class TariffCreate(BaseModel):
    """Schema for creating/updating a tariff."""
    utility_type: str = Field(..., min_length=1, max_length=50, description="Electricity, Gas, Fuel, etc.")
    price_per_unit: float = Field(..., gt=0, description="Price per unit")
    currency_code: str = Field(default="PKR", max_length=3, description="Currency code")

    class Config:
        json_schema_extra = {
            "example": {
                "utility_type": "Electricity",
                "price_per_unit": 55.0,
                "currency_code": "PKR"
            }
        }


class TariffResponse(TariffCreate):
    """Response schema for tariff."""
    id: int
    business_id: int
    created_at: datetime
    updated_at: datetime


class BudgetCreate(BaseModel):
    """Schema for creating/updating a budget."""
    month: int = Field(..., ge=1, le=12, description="Month 1-12")
    year: int = Field(..., gt=2000, description="Year")
    monthly_limit: float = Field(..., gt=0, description="Maximum spending limit")
    alert_percentage: float = Field(default=80.0, ge=10, le=100, description="Alert at X% of limit")
    currency_code: str = Field(default="PKR", max_length=3)

    class Config:
        json_schema_extra = {
            "example": {
                "month": 1,
                "year": 2025,
                "monthly_limit": 100000,
                "alert_percentage": 80.0,
                "currency_code": "PKR"
            }
        }


class BudgetResponse(BudgetCreate):
    """Response schema for budget."""
    id: int
    business_id: int
    created_at: datetime
    updated_at: datetime


class FinancialStatsResponse(BaseModel):
    """Response schema for financial statistics."""
    month: int
    year: int
    total_emissions_kg: float
    total_cost: float
    currency: str
    budget_status: dict
    tariff_count: int
    emissions_by_type: dict


# TARIFF ENDPOINTS
@router.post("/api/tariffs", response_model=TariffResponse, tags=["financial"])
def create_tariff(
    tariff_data: TariffCreate,
    business_id: int,
    db: Session = Depends(get_db)
):
    """Create or update a tariff rate for a business."""
    try:
        # Check if tariff already exists for this utility_type
        existing_tariff = db.query(models.Tariff).filter(
            and_(
                models.Tariff.business_id == business_id,
                models.Tariff.utility_type == tariff_data.utility_type
            )
        ).first()

        if existing_tariff:
            # Update existing tariff
            db.query(models.Tariff).filter(models.Tariff.id == existing_tariff.id).update({
                models.Tariff.price_per_unit: tariff_data.price_per_unit,
                models.Tariff.currency_code: tariff_data.currency_code,
                models.Tariff.updated_at: datetime.utcnow()
            })
            logger.info("Updated tariff for %s: %s", business_id, tariff_data.utility_type)
        else:
            # Create new tariff
            new_tariff = models.Tariff(
                business_id=business_id,
                utility_type=tariff_data.utility_type,
                price_per_unit=tariff_data.price_per_unit,
                currency_code=tariff_data.currency_code
            )
            db.add(new_tariff)
            logger.info("Created new tariff for %s: %s", business_id, tariff_data.utility_type)

        db.commit()
        tariff = db.query(models.Tariff).filter(
            and_(
                models.Tariff.business_id == business_id,
                models.Tariff.utility_type == tariff_data.utility_type
            )
        ).first()
        return tariff

    except (ValueError, IOError) as e:
        logger.error("Error creating tariff: %s", e)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create tariff: {str(e)}"
        ) from e


@router.get("/api/tariffs", response_model=list[TariffResponse], tags=["financial"])
def get_tariffs(business_id: int, db: Session = Depends(get_db)):
    """Get all tariffs for a business."""
    try:
        tariffs = db.query(models.Tariff).filter(
            models.Tariff.business_id == business_id
        ).all()

        if not tariffs:
            logger.warning("No tariffs found for business %d", business_id)
            return []

        return tariffs

    except (ValueError, IOError) as e:
        logger.error("Error fetching tariffs: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tariffs"
        ) from e


@router.delete("/api/tariffs/{tariff_id}", tags=["financial"])
def delete_tariff(tariff_id: int, business_id: int, db: Session = Depends(get_db)):
    """Delete a tariff."""
    try:
        tariff = db.query(models.Tariff).filter(
            and_(
                models.Tariff.id == tariff_id,
                models.Tariff.business_id == business_id
            )
        ).first()

        if not tariff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tariff not found"
            )

        db.delete(tariff)
        db.commit()
        logger.info("Deleted tariff %d", tariff_id)
        return {"message": "Tariff deleted successfully"}

    except (ValueError, IOError) as e:
        logger.error("Error deleting tariff: %s", e)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete tariff"
        ) from e


# BUDGET ENDPOINTS
@router.post("/api/budgets", response_model=BudgetResponse, tags=["financial"])
def create_budget(
    budget_data: BudgetCreate,
    business_id: int,
    db: Session = Depends(get_db)
):
    """Create or update a monthly budget."""
    try:
        # Check if budget already exists for this month/year
        existing_budget = db.query(models.Budget).filter(
            and_(
                models.Budget.business_id == business_id,
                models.Budget.month == budget_data.month,
                models.Budget.year == budget_data.year
            )
        ).first()

        if existing_budget:
            # Update existing budget
            db.query(models.Budget).filter(models.Budget.id == existing_budget.id).update({
                models.Budget.monthly_limit: budget_data.monthly_limit,
                models.Budget.alert_percentage: budget_data.alert_percentage,
                models.Budget.currency_code: budget_data.currency_code,
                models.Budget.updated_at: datetime.utcnow()
            })
            logger.info("Updated budget for %d: %d/%d", business_id, budget_data.month, budget_data.year)
        else:
            # Create new budget
            new_budget = models.Budget(
                business_id=business_id,
                month=budget_data.month,
                year=budget_data.year,
                monthly_limit=budget_data.monthly_limit,
                alert_percentage=budget_data.alert_percentage,
                currency_code=budget_data.currency_code
            )
            db.add(new_budget)
            logger.info("Created new budget for %d: %d/%d", business_id, budget_data.month, budget_data.year)

        db.commit()
        budget = db.query(models.Budget).filter(
            and_(
                models.Budget.business_id == business_id,
                models.Budget.month == budget_data.month,
                models.Budget.year == budget_data.year
            )
        ).first()
        return budget

    except (ValueError, IOError) as e:
        logger.error("Error creating budget: %s", e)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create budget: {str(e)}"
        ) from e


@router.get("/api/budgets", response_model=list[BudgetResponse], tags=["financial"])
def get_budgets(business_id: int, db: Session = Depends(get_db)):
    """Get all budgets for a business."""
    try:
        budgets = db.query(models.Budget).filter(
            models.Budget.business_id == business_id
        ).all()

        return budgets

    except (ValueError, IOError) as e:
        logger.error("Error fetching budgets: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch budgets"
        ) from e


# FINANCIAL STATS ENDPOINT
@router.get("/api/financial-stats", response_model=FinancialStatsResponse, tags=["financial"])
def get_financial_stats(
    business_id: int,
    month: int,
    year: int,
    currency: str = "PKR",
    db: Session = Depends(get_db)
):
    """
    Get comprehensive financial statistics for a month.
    
    Returns total emissions, total cost, and budget status.
    """
    try:
        # Get all emissions for the month
        emissions = db.query(models.Emission).filter(
            and_(
                models.Emission.business_id == business_id,
                extract('month', models.Emission.recorded_at) == month,
                extract('year', models.Emission.recorded_at) == year
            )
        ).all()

        # Calculate total emissions (ensure it's a float)
        total_emissions_kg = float(sum(float(e.co2_impact) for e in emissions) if emissions else 0)  # type: ignore

        # Calculate total cost by emission type
        total_cost_base_currency = 0.0
        emissions_by_type = {}

        for emission in emissions:
            try:
                # Ensure values are native Python types
                emission_type_str = str(emission.type)
                emission_value_float = float(emission.value)  # type: ignore
                
                cost_info = TariffCalculator.calculate_emission_cost(
                    db, business_id, emission_type_str, emission_value_float
                )
                cost = cost_info["cost"]
                base_currency = cost_info["currency"]

                # Convert to display currency if needed
                if base_currency != currency:
                    try:
                        cost = CurrencyConverter.convert_with_lookup(
                            db, cost, base_currency, currency
                        )
                    except ValueError:
                        logger.warning(
                            "Could not convert %s to %s", base_currency, currency
                        )

                total_cost_base_currency += cost

                # Track emissions by type
                if emission.type not in emissions_by_type:
                    emissions_by_type[emission.type] = {"kg": 0, "cost": 0}

                emissions_by_type[emission.type]["kg"] += emission.co2_impact
                emissions_by_type[emission.type]["cost"] += cost

            except ValueError as e:
                logger.warning("Skipping emission cost calculation: %s", e)
                continue

        # Get budget status
        budget_status = BudgetChecker.check_budget_status(
            db, business_id, total_cost_base_currency, month, year
        )

        # Count configured tariffs
        tariff_count = db.query(models.Tariff).filter(
            models.Tariff.business_id == business_id
        ).count()

        return {
            "month": month,
            "year": year,
            "total_emissions_kg": round(total_emissions_kg, 2),
            "total_cost": round(total_cost_base_currency, 2),
            "currency": currency,
            "budget_status": budget_status,
            "tariff_count": tariff_count,
            "emissions_by_type": emissions_by_type
        }

    except (ValueError, IOError) as e:
        logger.error("Error calculating financial stats: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate financial stats: {str(e)}"
        ) from e
