"""Initialize default exchange rates."""

import sys
sys.path.insert(0, '.')

# Import in correct order to avoid circular imports
from database import engine
import models
from exchange_rate_sync import initialize_default_exchange_rates

# Ensure all tables are created
models.Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    initialize_default_exchange_rates()
