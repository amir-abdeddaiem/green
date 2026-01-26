"""Exchange rate sync service for financial module."""

import logging
import asyncio
from datetime import datetime
import httpx
from database import get_db
import models

logger = logging.getLogger(__name__)

# Exchange rate API endpoint (no API key required)
EXCHANGE_RATE_API = "https://api.exchangerate.host/latest"

# Currencies to sync
SUPPORTED_CURRENCIES = ["PKR", "USD", "EUR", "GBP", "JPY", "CNY", "AED"]


class ExchangeRateSync:
    """Service for syncing and caching exchange rates."""

    @staticmethod
    async def fetch_latest_rates(base_currency: str = "PKR") -> dict:
        """
        Fetch latest exchange rates from API.
        
        Args:
            base_currency: Base currency (default: PKR)
            
        Returns:
            Dictionary of exchange rates
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "base": base_currency,
                    "symbols": ",".join(SUPPORTED_CURRENCIES)
                }
                
                logger.info("🔄 Fetching exchange rates from %s...", base_currency)
                response = await client.get(EXCHANGE_RATE_API, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                if data.get("success") is False:
                    raise ValueError(f"API Error: {data.get('error')}")
                
                logger.info("✅ Successfully fetched rates for %s", base_currency)
                return data.get("rates", {})
                
        except Exception as e:
            logger.error("❌ Error fetching exchange rates: %s", e)
            raise

    @staticmethod
    def update_rates_in_db(rates: dict, base_currency: str = "PKR"):
        """
        Update exchange rates in the database.
        
        Args:
            rates: Dictionary of rates {currency: rate}
            base_currency: Base currency
        """
        db = next(get_db())
        
        try:
            for target_currency, rate in rates.items():
                # Skip if same currency
                if target_currency == base_currency:
                    continue
                
                # Check if rate exists
                existing_rate = db.query(models.ExchangeRate).filter(
                    models.ExchangeRate.from_currency == base_currency,
                    models.ExchangeRate.to_currency == target_currency
                ).first()
                
                if existing_rate:
                    # Update existing rate using query update
                    db.query(models.ExchangeRate).filter(
                        models.ExchangeRate.id == existing_rate.id
                    ).update({
                        models.ExchangeRate.rate: float(rate),
                        models.ExchangeRate.last_updated: datetime.utcnow()
                    })
                    logger.debug("Updated: %s → %s = %s", base_currency, target_currency, rate)
                else:
                    # Create new rate entry
                    new_rate = models.ExchangeRate(
                        from_currency=base_currency,
                        to_currency=target_currency,
                        rate=float(rate),
                        last_updated=datetime.utcnow()
                    )
                    db.add(new_rate)
                    logger.debug("Created: %s → %s = %s", base_currency, target_currency, rate)
            
            db.commit()
            logger.info("✅ Successfully updated %s exchange rates in database", len(rates))
            
        except Exception as e:
            logger.error("❌ Error updating rates in database: %s", e)
            db.rollback()
            raise
        finally:
            db.close()

    @staticmethod
    async def sync_all_currencies():
        """
        Sync exchange rates for all supported base currencies.
        
        This creates a comprehensive rate cache:
        - PKR → USD, EUR, GBP, etc.
        - USD → PKR, EUR, GBP, etc.
        """
        try:
            logger.info("🔄 Starting comprehensive exchange rate sync...")
            
            for base_currency in SUPPORTED_CURRENCIES:
                try:
                    rates = await ExchangeRateSync.fetch_latest_rates(base_currency)
                    ExchangeRateSync.update_rates_in_db(rates, base_currency)
                    # Stagger API calls to avoid rate limiting
                    await asyncio.sleep(1)
                except (ValueError, RuntimeError) as e:
                    logger.error("Error syncing %s: %s", base_currency, e)
                    continue
            
            logger.info("Exchange rate sync completed successfully!")
            
        except (ValueError, RuntimeError) as e:
            logger.error("Comprehensive sync failed: %s", e)
            raise

    @staticmethod
    def sync_all_currencies_sync():
        """Synchronous wrapper for sync_all_currencies (for FastAPI startup)."""
        try:
            asyncio.run(ExchangeRateSync.sync_all_currencies())
        except (ValueError, RuntimeError) as e:
            logger.error("Failed to sync exchange rates during startup: %s", e)
            logger.info("Continuing without exchange rates. Manual sync may be needed.")


def initialize_default_exchange_rates():
    """Initialize default exchange rates if none exist."""
    db = next(get_db())
    
    try:
        # Check if any rates exist
        existing_rates = db.query(models.ExchangeRate).first()
        
        if not existing_rates:
            logger.info("📊 Initializing default exchange rates...")
            
            # Default rates (as of Jan 2025) - will be updated by sync
            default_rates = [
                ("PKR", "USD", 0.0036),
                ("PKR", "EUR", 0.0034),
                ("PKR", "GBP", 0.0028),
                ("USD", "PKR", 278.0),
                ("EUR", "PKR", 290.0),
                ("GBP", "PKR", 350.0),
            ]
            
            for from_curr, to_curr, rate in default_rates:
                rate_entry = models.ExchangeRate(
                    from_currency=from_curr,
                    to_currency=to_curr,
                    rate=rate,
                    last_updated=datetime.utcnow()
                )
                db.add(rate_entry)
            
            db.commit()
            logger.info("Initialized %d default exchange rates", len(default_rates))
        else:
            logger.info("Exchange rates already exist (%d entries)", existing_rates.id)
            
    except (ValueError, IOError) as e:
        logger.error("Error initializing default rates: %s", e)
        db.rollback()
    finally:
        db.close()


async def background_rate_sync():
    """
    Background task to sync exchange rates every 24 hours.
    Call this from FastAPI's lifespan or background tasks.
    """
    logger.info("Exchange rate background sync task started")
    
    while True:
        try:
            logger.info("Running scheduled exchange rate sync...")
            await ExchangeRateSync.sync_all_currencies()
            
            # Wait 24 hours before next sync
            await asyncio.sleep(86400)
            
        except (ValueError, RuntimeError) as e:
            logger.error("Background sync error: %s", e)
            # Retry after 1 hour on error
            await asyncio.sleep(3600)
