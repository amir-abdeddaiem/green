"""Initialize financial module tables (Tariffs, ExchangeRates, Budgets)."""

from database import engine
import models

def init_financial_tables():
    """Create the financial module tables in the database."""
    try:
        # Create all tables defined in models
        models.Base.metadata.create_all(bind=engine)
        print("✅ Financial module tables created successfully!")
        print("   - tariffs table")
        print("   - exchange_rates table")
        print("   - budgets table")
    except Exception as e:
        print(f"❌ Error creating financial tables: {e}")
        raise

if __name__ == "__main__":
    init_financial_tables()
