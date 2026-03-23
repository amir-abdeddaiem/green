"""
Scope 3 (Supply Chain) API Routes for Verdustry.
Handles supplier management, emission factor library, scope3 logging, and financial integration.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func  # type: ignore
from decimal import Decimal
from datetime import datetime
from typing import Optional

from database import get_db
from models import Supplier, EmissionFactor, Scope3Log, User
from scope3_service import Scope3Calculator, SupplierScoringEngine

router = APIRouter()


# ===== SUPPLIER MANAGEMENT =====

@router.post("/api/scope3/suppliers")
def create_supplier(
    business_id: int = Query(...),
    name: str = Query(...),
    industry_type: str = Query(...),
    contact_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Create a new supplier for supply chain tracking.
    """
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == business_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Business not found")
        
        # Check if supplier already exists
        existing = db.query(Supplier).filter(
            Supplier.user_id == business_id,
            Supplier.name == name
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Supplier already exists")
        
        # Create supplier
        supplier = Supplier(
            user_id=business_id,
            name=name,
            industry_type=industry_type,
            contact_email=contact_email,
            sustainability_rating=Decimal("3.0")  # Default average rating
        )
        
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        
        return {
            "id": supplier.id,
            "name": supplier.name,
            "industry_type": supplier.industry_type,
            "contact_email": supplier.contact_email,
            "sustainability_rating": float(supplier.sustainability_rating),  # type: ignore
            "created_at": supplier.created_at.isoformat()
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create supplier: {str(e)}") from e


@router.get("/api/scope3/suppliers")
def get_suppliers(business_id: int = Query(...), db: Session = Depends(get_db)):
    """Get all suppliers for a business."""
    try:
        suppliers = db.query(Supplier).filter(Supplier.user_id == business_id).all()
        
        return [
            {
                "id": s.id,
                "name": s.name,
                "industry_type": s.industry_type,
                "contact_email": s.contact_email,
                "sustainability_rating": float(s.sustainability_rating),  # type: ignore
                "carbon_intensity": float(s.carbon_intensity),  # type: ignore
                "total_co2": float(s.total_co2),  # type: ignore
                "total_units": float(s.total_units),  # type: ignore
                "created_at": s.created_at.isoformat()
            }
            for s in suppliers
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch suppliers: {str(e)}") from e


@router.delete("/api/scope3/suppliers/{supplier_id}")
def delete_supplier(
    supplier_id: int,
    business_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Delete a supplier and associated scope3 logs."""
    try:
        supplier = db.query(Supplier).filter(
            Supplier.id == supplier_id,
            Supplier.user_id == business_id
        ).first()
        
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        db.delete(supplier)
        db.commit()
        
        return {"message": "Supplier deleted successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete supplier: {str(e)}") from e


# ===== EMISSION FACTORS LIBRARY =====

@router.get("/api/scope3/emission-factors")
def get_emission_factors(
    category: Optional[str] = Query(None),
    region: Optional[str] = Query("Global"),
    db: Session = Depends(get_db)
):
    """
    Browse the emission factors library.
    Can filter by category (Transportation, Goods, Travel, Commute) and region.
    """
    try:
        query = db.query(EmissionFactor)
        
        if category:
            query = query.filter(EmissionFactor.category == category)
        
        if region:
            query = query.filter(EmissionFactor.region == region)
        
        factors = query.all()
        
        return [
            {
                "id": f.id,
                "category": f.category,
                "activity_name": f.activity_name,
                "unit": f.unit,
                "factor_value": float(f.factor_value),  # type: ignore
                "region": f.region,
                "source": f.source,
                "notes": f.notes
            }
            for f in factors
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch emission factors: {str(e)}") from e


# ===== SCOPE 3 LOGGING WITH AUTO-SCORING =====

@router.post("/api/scope3/logs")
def create_scope3_log(
    business_id: int = Query(...),
    supplier_id: Optional[int] = Query(None),
    factor_id: int = Query(...),
    raw_quantity: float = Query(...),
    weight_in_tons: Optional[float] = Query(None),
    unit_count: Optional[int] = Query(None),
    calculated_cost: Optional[float] = Query(None),
    currency_code: str = Query("PKR"),
    source_reference: Optional[str] = Query(None),
    date_of_activity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Log a Scope 3 emission activity.
    Automatically calculates CO2 based on category and updates supplier rating.
    
    Parameters:
        business_id: User's business ID
        supplier_id: Optional supplier for supply chain tracking
        factor_id: Emission factor ID from library
        raw_quantity: Primary quantity (km for transport, kg for goods, etc.)
        weight_in_tons: Optional weight for logistics
        unit_count: Optional count for travel/commute
        calculated_cost: Optional cost for Green ROI tracking
        currency_code: Currency code for cost
        source_reference: Audit trail (Invoice #, Shipment ID, etc.)
        date_of_activity: Date when activity occurred
    """
    try:
        # Verify user
        user = db.query(User).filter(User.id == business_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Business not found")
        
        # Verify supplier if provided
        if supplier_id:
            supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if not supplier:
                raise HTTPException(status_code=404, detail="Supplier not found")
        
        # Fetch emission factor
        factor = db.query(EmissionFactor).filter(EmissionFactor.id == factor_id).first()
        if not factor:
            raise HTTPException(status_code=404, detail="Emission factor not found")
        
        # Calculate CO2 based on category
        calculator = Scope3Calculator(db)
        calculated_co2 = calculator.calculate_emission(
            category=str(factor.category),  # type: ignore
            factor=factor,
            raw_quantity=raw_quantity,
            weight_tons=weight_in_tons,
            unit_count=unit_count
        )
        
        # Parse date
        activity_date = datetime.fromisoformat(date_of_activity) if date_of_activity else datetime.utcnow()
        
        # Create scope3 log
        log = Scope3Log(
            user_id=business_id,
            supplier_id=supplier_id,
            factor_id=factor_id,
            raw_quantity=Decimal(str(raw_quantity)),
            weight_in_tons=Decimal(str(weight_in_tons)) if weight_in_tons else None,
            unit_count=unit_count,
            calculated_co2=calculated_co2,
            calculated_cost=Decimal(str(calculated_cost)) if calculated_cost else None,
            currency_code=currency_code,
            source_reference=source_reference,
            date_of_activity=activity_date
        )
        
        db.add(log)
        db.flush()  # Get the log ID
        
        # AUTO-SCORING: Update supplier rating if supplier provided
        if supplier_id:
            scoring_engine = SupplierScoringEngine(db)
            scoring_engine.update_supplier_rating(supplier_id)
        
        db.commit()
        db.refresh(log)
        
        return {
            "id": log.id,
            "user_id": log.user_id,
            "supplier_id": log.supplier_id,
            "factor_id": log.factor_id,
            "calculated_co2": float(log.calculated_co2),  # type: ignore
            "calculated_cost": float(log.calculated_cost) if log.calculated_cost else None,  # type: ignore
            "currency_code": log.currency_code,
            "source_reference": log.source_reference,
            "date_of_activity": log.date_of_activity.isoformat(),
            "created_at": log.created_at.isoformat()
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to log scope3 emission: {str(e)}") from e


# ===== SUPPLIER LEADERBOARD =====

@router.get("/api/scope3/leaderboard")
def get_supplier_leaderboard(
    business_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get supplier leaderboard ranked by total CO2 emissions and sustainability rating.
    Includes warning flag for high-carbon suppliers.
    """
    try:
        suppliers = db.query(Supplier).filter(Supplier.user_id == business_id).all()
        
        if not suppliers:
            return []
        
        # Calculate industry average carbon intensity
        avg_intensity = sum(float(s.carbon_intensity) for s in suppliers) / len(suppliers) if suppliers else 0  # type: ignore
        
        leaderboard = []
        for s in suppliers:
            warning = float(s.carbon_intensity) > (avg_intensity * 1.2)  # 20% above average  # type: ignore
            
            leaderboard.append({
                "id": s.id,
                "name": s.name,
                "industry_type": s.industry_type,
                "total_co2": float(s.total_co2),  # type: ignore
                "carbon_intensity": float(s.carbon_intensity),  # type: ignore
                "sustainability_rating": float(s.sustainability_rating),  # type: ignore
                "has_warning": warning,
                "created_at": s.created_at.isoformat()
            })
        
        # Sort by total CO2 (descending)
        leaderboard.sort(key=lambda x: x["total_co2"], reverse=True)
        
        return leaderboard
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard: {str(e)}") from e


# ===== SCOPE 3 STATISTICS =====

@router.get("/api/scope3/stats")
def get_scope3_stats(business_id: int = Query(...), db: Session = Depends(get_db)):
    """
    Get overview statistics for Scope 3 emissions.
    """
    try:
        # Total Scope 3 CO2
        total_co2 = db.query(func.sum(Scope3Log.calculated_co2)).filter(
            Scope3Log.user_id == business_id
        ).scalar() or Decimal("0")
        
        # Supplier count
        supplier_count = db.query(Supplier).filter(
            Supplier.user_id == business_id
        ).count()
        
        # Activity count
        activity_count = db.query(Scope3Log).filter(
            Scope3Log.user_id == business_id
        ).count()
        
        # Average carbon intensity
        suppliers = db.query(Supplier).filter(Supplier.user_id == business_id).all()
        avg_intensity = (sum(float(s.carbon_intensity) for s in suppliers) / len(suppliers)) if suppliers else 0  # type: ignore
        
        return {
            "total_scope3_co2_kg": float(total_co2),
            "supplier_count": supplier_count,
            "activity_count": activity_count,
            "avg_carbon_intensity": avg_intensity
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}") from e


# ===== FINANCIAL INTEGRATION (Green ROI) =====

@router.get("/api/scope3/financial-impact")
def get_financial_impact(
    business_id: int = Query(...),
    supplier_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Financial impact analysis for Green ROI calculations.
    Shows CO2 intensity vs. cost to identify premium-priced but low-carbon suppliers.
    """
    try:
        query = db.query(Scope3Log).filter(Scope3Log.user_id == business_id)
        
        if supplier_id:
            query = query.filter(Scope3Log.supplier_id == supplier_id)
        
        logs = query.all()
        
        if not logs:
            return {
                "total_co2": 0,
                "total_cost": 0,
                "co2_per_unit_cost": 0,
                "currency_code": "PKR"
            }
        
        total_co2 = sum(float(log.calculated_co2) for log in logs) if logs else 0  # type: ignore
        total_cost = sum(float(log.calculated_cost) for log in logs if log.calculated_cost) if logs else 0  # type: ignore
        
        # kg CO2e per unit cost
        co2_per_unit_cost = total_co2 / total_cost if total_cost > 0 else 0
        
        # Get supplier info if filtered
        supplier_info = None
        if supplier_id:
            supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if supplier:
                supplier_info = {
                    "name": supplier.name,
                    "rating": float(supplier.sustainability_rating),  # type: ignore
                    "carbon_intensity": float(supplier.carbon_intensity)  # type: ignore
                }
        
        return {
            "total_co2_kg": total_co2,
            "total_cost": total_cost,
            "co2_per_unit_cost": co2_per_unit_cost,
            "currency_code": logs[0].currency_code if logs else "PKR",
            "supplier": supplier_info,
            "interpretation": "Higher co2_per_unit_cost = More expensive per kg of emissions (potentially better quality/lower-emission alternatives)"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate financial impact: {str(e)}") from e
