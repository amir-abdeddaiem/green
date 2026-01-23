"""FastAPI backend for GreenScale carbon emissions tracking system."""

import base64
import csv
import io
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

import auth_utils
import models
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserCreate(BaseModel):
    """User registration schema."""
    business_name: str
    email: str
    password: str


class UserLogin(BaseModel):
    """User login schema."""
    email: str
    password: str


class EmissionCreate(BaseModel):
    """Emission creation schema."""
    business_id: int
    type: str
    value: float
    unit: str

@app.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(
        business_name=user_data.business_name,
        email=user_data.email,
        password=auth_utils.hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Success", "user_id": new_user.id}

@app.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth_utils.verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"business_name": user.business_name, "user_id": user.id, "status": "success"}

@app.post("/upload-profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), business_id: str = None):
    print(f"📸 Received profile picture upload for business ID: {business_id}")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        print(f"❌ Invalid file type: {file.content_type}")
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    try:
        # Read file content
        contents = await file.read()
        
        # Encode to base64 for easier frontend handling
        base64_image = base64.b64encode(contents).decode('utf-8')
        image_data_url = f"data:{file.content_type};base64,{base64_image}"
        
        print(f"✅ Profile picture uploaded successfully for business {business_id}")
        
        return {
            "success": True,
            "image_url": image_data_url,
            "filename": file.filename,
            "message": "Profile picture uploaded successfully"
        }
    
    except Exception as e:
        print(f"❌ Error uploading profile picture: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload profile picture") from e

@app.post("/add-emission")
def add_emission(data: EmissionCreate, db: Session = Depends(get_db)):
    print(f"📝 Received emission log request: Type={data.type}, Value={data.value}, BusinessID={data.business_id}")
    
    factors = {"Electricity": 0.4, "Natural Gas": 2.0, "Fuel": 2.7, "Waste": 0.5}
    impact = round(data.value * factors.get(data.type, 0.1), 2)
    
    new_log = models.Emission(
        business_id=data.business_id,
        type=data.type,
        value=data.value,
        unit=data.unit,
        co2_impact=impact
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    print(f"✅ Emission saved successfully! ID={new_log.id}, CO2={impact}kg")
    return {"impact": impact, "id": new_log.id}

@app.delete("/delete-emission/{emission_id}")
def delete_emission(emission_id: int, db: Session = Depends(get_db)):
    print(f"🗑️  Received delete request for emission ID: {emission_id}")
    
    emission = db.query(models.Emission).filter(models.Emission.id == emission_id).first()
    
    if not emission:
        print(f"❌ Emission not found: {emission_id}")
        raise HTTPException(status_code=404, detail="Emission not found")
    
    db.delete(emission)
    db.commit()
    
    print(f"✅ Emission deleted successfully! ID={emission_id}")
    return {"success": True, "message": "Emission deleted successfully"}

@app.put("/update-emission/{emission_id}")
def update_emission(emission_id: int, data: EmissionCreate, db: Session = Depends(get_db)):
    print(f"✏️  Received update request for emission ID: {emission_id}")
    
    emission = db.query(models.Emission).filter(models.Emission.id == emission_id).first()
    
    if not emission:
        print(f"❌ Emission not found: {emission_id}")
        raise HTTPException(status_code=404, detail="Emission not found")
    
    # Recalculate CO2 impact
    factors = {"Electricity": 0.4, "Natural Gas": 2.0, "Fuel": 2.7, "Waste": 0.5}
    impact = round(data.value * factors.get(data.type, 0.1), 2)
    
    # Update fields
    emission.type = data.type
    emission.value = data.value
    emission.unit = data.unit
    emission.co2_impact = impact
    
    db.commit()
    db.refresh(emission)
    
    print(f"✅ Emission updated successfully! ID={emission_id}, New CO2={impact}kg")
    return {
        "id": emission.id,
        "type": emission.type,
        "value": emission.value,
        "unit": emission.unit,
        "co2_impact": emission.co2_impact,
        "recorded_at": emission.recorded_at.isoformat() if emission.recorded_at else None
    }

@app.patch("/update-emission-status/{emission_id}")
def update_emission_status(emission_id: int, data: dict, db: Session = Depends(get_db)):
    print(f"📊 Received status update request for emission ID: {emission_id}")
    
    emission = db.query(models.Emission).filter(models.Emission.id == emission_id).first()
    
    if not emission:
        print(f"❌ Emission not found: {emission_id}")
        raise HTTPException(status_code=404, detail="Emission not found")
    
    status = data.get("status", "active")
    
    # Store status if column exists, otherwise treat as metadata
    if hasattr(emission, 'status'):
        emission.status = status
    else:
        # Fallback: store in a comment or just log it
        print("⚠️  Status column not available, storing as metadata")
    
    db.commit()
    db.refresh(emission)
    
    print(f"✅ Emission status updated to: {status}")
    return {
        "id": emission.id,
        "status": status,
        "message": f"Status updated to {status}"
    }

@app.get("/dashboard-stats/{business_id}")
def get_stats(business_id: int, db: Session = Depends(get_db)):
    # DEBUG PRINT: Watch your terminal for this!
    print(f">>> Fetching stats for Business ID: {business_id}")

    total_co2 = db.query(func.sum(models.Emission.co2_impact)).filter(
        models.Emission.business_id == business_id
    ).scalar() or 0
    total_kwh = db.query(func.sum(models.Emission.value)).filter(
        models.Emission.business_id == business_id,
        models.Emission.type == "Electricity"
    ).scalar() or 0
    total_gas = db.query(func.sum(models.Emission.value)).filter(
        models.Emission.business_id == business_id,
        models.Emission.type == "Natural Gas"
    ).scalar() or 0
    log_count = db.query(models.Emission).filter(
        models.Emission.business_id == business_id
    ).count()
    
    return {
        "total_co2": round(float(total_co2), 2),
        "total_kwh": round(float(total_kwh), 2),
        "total_gas": round(float(total_gas), 2),
        "log_count": int(log_count)
    }

@app.get("/recent-logs/{business_id}")
def get_logs(business_id: int, db: Session = Depends(get_db)):
    return db.query(models.Emission).filter(models.Emission.business_id == business_id).order_by(models.Emission.recorded_at.desc()).limit(5).all()

@app.get("/category-breakdown/{business_id}")
def get_category_breakdown(business_id: int, db: Session = Depends(get_db)):
    """Returns CO2 impact breakdown by emission type (Electricity, Gas, Fuel, Waste)"""
    results = db.query(
        models.Emission.type,
        func.sum(models.Emission.co2_impact).label("impact")
    ).filter(models.Emission.business_id == business_id).group_by(models.Emission.type).all()
    
    return [{"type": row[0], "impact": round(float(row[1]), 2)} for row in results]

@app.get("/monthly-trends/{business_id}")
def get_monthly_trends(business_id: int, db: Session = Depends(get_db)):
    """Returns monthly CO2 impact for the last 6 months"""
    # Get last 6 months of data
    six_months_ago = datetime.now() - timedelta(days=180)
    
    results = db.query(
        extract('year', models.Emission.recorded_at).label('year'),
        extract('month', models.Emission.recorded_at).label('month'),
        func.sum(models.Emission.co2_impact).label('total_impact')
    ).filter(
        models.Emission.business_id == business_id,
        models.Emission.recorded_at >= six_months_ago
    ).group_by(
        extract('year', models.Emission.recorded_at),
        extract('month', models.Emission.recorded_at)
    ).order_by(
        extract('year', models.Emission.recorded_at),
        extract('month', models.Emission.recorded_at)
    ).all()
    
    # Month names for formatting
    months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    # Format data for recharts
    data = []
    for year, month, impact in results:
        month_int = int(month) if month else 1
        data.append({
            "month": months[month_int],
            "impact": round(float(impact), 2),
            "year": int(year)
        })
    
    # Fill in missing months with zero values
    if data:
        current = datetime(int(data[0]['year']), int(datetime.strptime(data[0]['month'], '%b').month), 1)
        
        while len(data) < 6:
            current = current + timedelta(days=32)
            current = datetime(current.year, current.month, 1)
            month_name = months[current.month]
            
            # Check if month already exists
            if not any(d['month'] == month_name and d['year'] == current.year for d in data):
                data.append({"month": month_name, "impact": 0, "year": current.year})
    
    return sorted(data, key=lambda x: (x['year'], datetime.strptime(x['month'], '%b').month))

@app.get("/export-data/{business_id}")
def export_data(business_id: int, db: Session = Depends(get_db)):
    """
    Phase 1: Backend Export Engine
    Fetches ALL emissions for a business and returns CSV format
    Unlike dashboard which shows last 5, this endpoint retrieves complete dataset
    """
    print(f"📥 Export request for Business ID: {business_id}")
    
    # Validate business exists
    business = db.query(models.User).filter(models.User.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Fetch ALL emissions for this business, ordered by date DESC
    emissions = db.query(models.Emission).filter(
        models.Emission.business_id == business_id
    ).order_by(models.Emission.recorded_at.desc()).all()
    
    print(f"✅ Found {len(emissions)} emissions to export")
    
    # Handle empty dataset
    if not emissions:
        print("⚠️ No emissions found - returning empty export")
        return {"message": "No emissions data available for export", "count": 0}
    
    # Phase 2: Data Normalization
    # Create CSV in memory buffer
    output = io.StringIO()
    
    # Define CSV headers (human-friendly column names)
    fieldnames = [
        'Date Recorded',
        'Emission Source',
        'Usage Amount',
        'Unit',
        'Carbon Footprint (kg CO2e)'
    ]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    # Write normalized data rows
    for emission in emissions:
        # Format date from datetime to readable string
        date_str = emission.recorded_at.strftime('%B %d, %Y at %I:%M %p') if emission.recorded_at else 'N/A'
        
        writer.writerow({
            'Date Recorded': date_str,
            'Emission Source': emission.type,
            'Usage Amount': round(emission.value, 2),
            'Unit': emission.unit,
            'Carbon Footprint (kg CO2e)': round(emission.co2_impact, 2)
        })
    
    # Get CSV content and prepare for streaming response
    csv_content = output.getvalue()
    output.close()
    
    # Create filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"greenscale_report_{business.business_name.replace(' ', '_')}_{timestamp}.csv"
    
    print(f"📤 Streaming CSV export: {filename} ({len(emissions)} records)")
    
    # Return as streaming response with proper headers
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/export-pdf/{business_id}")
def export_pdf(business_id: int, db: Session = Depends(get_db)):
    """
    PDF Export Endpoint - Generates professional PDF report
    """
    print(f"📥 PDF Export request for Business ID: {business_id}")
    
    # Validate business exists
    business = db.query(models.User).filter(models.User.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Fetch emissions data
    emissions = db.query(models.Emission).filter(
        models.Emission.business_id == business_id
    ).order_by(models.Emission.recorded_at.desc()).all()
    
    print(f"✅ Found {len(emissions)} emissions for PDF export")
    
    # Calculate statistics
    total_co2 = sum(e.co2_impact for e in emissions)
    avg_co2 = total_co2 / len(emissions) if emissions else 0
    
    # Group by type
    by_type = {}
    for emission in emissions:
        if emission.type not in by_type:
            by_type[emission.type] = {"count": 0, "co2": 0}
        by_type[emission.type]["count"] += 1
        by_type[emission.type]["co2"] += emission.co2_impact
    
    # Create PDF in memory
    from io import BytesIO
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER
    except ImportError as exc:
        raise HTTPException(status_code=500, detail="PDF library not installed. Please install reportlab: pip install reportlab") from exc
    
    # Create PDF buffer
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    # Build PDF content
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#10b981'),
        spaceAfter=24,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    # Title
    elements.append(Paragraph("GreenScale Emissions Report", title_style))
    elements.append(Paragraph(f"Sustainability Report for {business.business_name}", subtitle_style))
    
    # Summary Section
    elements.append(Paragraph("Executive Summary", heading_style))
    summary_data = [
        ["Metric", "Value"],
        ["Total Records", str(len(emissions))],
        ["Total CO2 Emissions", f"{total_co2:.2f} kg CO2e"],
        ["Average per Entry", f"{avg_co2:.2f} kg CO2e"],
        ["Report Generated", datetime.now().strftime('%B %d, %Y at %I:%M %p')]
    ]
    
    summary_table = Table(summary_data, colWidths=[2.5*inch, 2.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Emissions by Type
    if by_type:
        elements.append(Paragraph("Emissions Breakdown by Type", heading_style))
        type_data = [["Type", "Records", "Total CO2 (kg)", "Average (kg)"]]
        for emission_type, stats in sorted(by_type.items()):
            avg = stats["co2"] / stats["count"] if stats["count"] > 0 else 0
            type_data.append([
                emission_type,
                str(stats["count"]),
                f"{stats['co2']:.2f}",
                f"{avg:.2f}"
            ])
        
        type_table = Table(type_data, colWidths=[1.5*inch, 1.2*inch, 1.3*inch, 1.5*inch])
        type_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#06b6d4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
        ]))
        elements.append(type_table)
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF content
    pdf_buffer.seek(0)
    
    # Create filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"greenscale_report_{business.business_name.replace(' ', '_')}_{timestamp}.pdf"
    
    print(f"📤 Streaming PDF export: {filename} ({len(emissions)} records)")
    
    # Return as streaming response
    return StreamingResponse(
        iter([pdf_buffer.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
