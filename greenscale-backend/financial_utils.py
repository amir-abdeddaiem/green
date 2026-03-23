"""Currency conversion and financial utilities for Verdustry."""

import logging
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from sqlalchemy import and_
import models

logger = logging.getLogger(__name__)

# Standard precision for currency calculations
CURRENCY_PRECISION = 2


class CurrencyConverter:
    """Handles currency conversion with proper precision and error handling."""

    @staticmethod
    def get_exchange_rate(
        db: Session,
        from_currency: str,
        to_currency: str
    ) -> float:
        """
        Get exchange rate from database cache.
        
        Args:
            db: Database session
            from_currency: Source currency code (e.g., "PKR")
            to_currency: Target currency code (e.g., "USD")
            
        Returns:
            Exchange rate as float
            
        Raises:
            ValueError: If exchange rate not found
        """
        if from_currency == to_currency:
            return 1.0

        # Query the exchange rate
        rate_value = db.query(models.ExchangeRate.rate).filter(
            and_(
                models.ExchangeRate.from_currency == from_currency,
                models.ExchangeRate.to_currency == to_currency
            )
        ).scalar()

        if not rate_value:
            logger.warning("Exchange rate not found: %s -> %s", from_currency, to_currency)
            raise ValueError(
                f"Exchange rate from {from_currency} to {to_currency} not available. "
                "Please wait for the rate cache to be updated."
            )

        return float(rate_value)

    @staticmethod
    def convert(
        amount: float,
        from_currency: str,
        to_currency: str,
        rate: float
    ) -> float:
        """
        Convert amount from one currency to another using precise decimal math.
        
        Args:
            amount: Amount to convert
            from_currency: Source currency
            to_currency: Target currency
            rate: Exchange rate
            
        Returns:
            Converted amount rounded to 2 decimal places
        """
        if from_currency == to_currency:
            return round(amount, CURRENCY_PRECISION)

        # Use Decimal for precise currency math
        amount_decimal = Decimal(str(amount))
        rate_decimal = Decimal(str(rate))
        result = amount_decimal * rate_decimal

        # Round to 2 decimal places
        result = result.quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP
        )

        return float(result)

    @staticmethod
    def convert_with_lookup(
        db: Session,
        amount: float,
        from_currency: str,
        to_currency: str
    ) -> float:
        """
        Convert amount using cached exchange rates from database.
        
        Args:
            db: Database session
            amount: Amount to convert
            from_currency: Source currency
            to_currency: Target currency
            
        Returns:
            Converted amount
        """
        rate = CurrencyConverter.get_exchange_rate(db, from_currency, to_currency)
        return CurrencyConverter.convert(amount, from_currency, to_currency, rate)


class TariffCalculator:
    """Calculates costs based on tariffs and emission data."""

    @staticmethod
    def get_tariff_for_business(
        db: Session,
        business_id: int,
        utility_type: str
    ) -> models.Tariff:
        """
        Get tariff rate for a specific utility type for a business.
        
        Args:
            db: Database session
            business_id: ID of the business
            utility_type: Type of utility (e.g., "Electricity")
            
        Returns:
            Tariff object
            
        Raises:
            ValueError: If tariff not found
        """
        tariff = db.query(models.Tariff).filter(
            and_(
                models.Tariff.business_id == business_id,
                models.Tariff.utility_type == utility_type
            )
        ).first()

        if not tariff:
            raise ValueError(
                f"No tariff configured for {utility_type}. "
                "Please set up tariff rates in Settings > Billing & Tariffs."
            )

        return tariff

    @staticmethod
    def calculate_emission_cost(
        db: Session,
        business_id: int,
        emission_type: str,
        emission_value: float
    ) -> dict:
        """
        Calculate cost of an emission in the business's base currency.
        
        Args:
            db: Database session
            business_id: ID of the business
            emission_type: Type of emission (e.g., "Electricity")
            emission_value: Quantity of emission
            
        Returns:
            Dictionary with 'cost', 'currency', and 'tariff_info'
        """
        try:
            tariff = TariffCalculator.get_tariff_for_business(
                db, business_id, emission_type
            )

            # Calculate cost: value × price_per_unit (convert to float for calculation)
            price_per_unit_val = float(tariff.price_per_unit)  # type: ignore
            cost = emission_value * price_per_unit_val

            return {
                "cost": round(cost, CURRENCY_PRECISION),
                "currency": tariff.currency_code,
                "tariff_info": {
                    "utility_type": tariff.utility_type,
                    "price_per_unit": price_per_unit_val,
                    "currency_code": tariff.currency_code
                }
            }
        except ValueError as e:
            logger.error("Cost calculation failed: %s", e)
            raise


class BudgetChecker:
    """Checks if spending exceeds budget thresholds."""

    @staticmethod
    def get_current_month_budget(
        db: Session,
        business_id: int,
        month: int,
        year: int
    ) -> models.Budget:
        """
        Get budget for a specific month.
        
        Args:
            db: Database session
            business_id: ID of the business
            month: Month (1-12)
            year: Year (e.g., 2025)
            
        Returns:
            Budget object
            
        Raises:
            ValueError: If no budget found for month/year
        """
        budget = db.query(models.Budget).filter(
            and_(
                models.Budget.business_id == business_id,
                models.Budget.month == month,
                models.Budget.year == year
            )
        ).first()

        if not budget:
            raise ValueError(
                f"No budget configured for {month}/{year}. "
                "Please set a monthly budget in Settings."
            )

        return budget

    @staticmethod
    def check_budget_status(
        db: Session,
        business_id: int,
        current_spending: float,
        month: int,
        year: int
    ) -> dict:
        """
        Check if current spending is within budget and calculate alert status.
        
        Args:
            db: Database session
            business_id: ID of the business
            current_spending: Current month's total spending
            month: Month (1-12)
            year: Year
            
        Returns:
            Dictionary with alert_level, percentage_used, and remaining
        """
        try:
            budget = BudgetChecker.get_current_month_budget(
                db, business_id, month, year
            )

            # Ensure values are floats for calculation
            monthly_limit_val = float(budget.monthly_limit)  # type: ignore
            percentage_used = (current_spending / monthly_limit_val) * 100
            remaining = monthly_limit_val - current_spending

            # Determine alert level
            if percentage_used >= 100:
                alert_level = "EXCEEDED"
            elif percentage_used >= budget.alert_percentage:
                alert_level = "WARNING"
            elif percentage_used >= (budget.alert_percentage * 0.5):
                alert_level = "CAUTION"
            else:
                alert_level = "OK"

            return {
                "alert_level": alert_level,
                "percentage_used": round(percentage_used, 2),
                "remaining": round(remaining, CURRENCY_PRECISION),
                "limit": monthly_limit_val,
                "currency": budget.currency_code
            }
        except ValueError as e:
            logger.warning("Budget check failed: %s", e)
            return {
                "alert_level": "NO_BUDGET",
                "message": str(e)
            }
