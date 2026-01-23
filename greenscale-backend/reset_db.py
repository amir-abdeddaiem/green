"""Database reset script - drops and recreates all tables with correct schema."""

from database import engine, Base
import models  # pylint: disable=unused-import

# Drop all existing tables
print("[INFO] Dropping all existing tables...")
Base.metadata.drop_all(bind=engine)
print("[INFO] Tables dropped successfully")

# Create all tables with the correct schema
print("[INFO] Creating new tables with correct schema...")
Base.metadata.create_all(bind=engine)
print("[INFO] Tables created successfully!")

print("\n✅ Database has been reset. Tables created:")
print("   - users (with id, business_name, email, password)")
print("   - emissions (with id, business_id, type, value, unit, co2_impact, recorded_at)")