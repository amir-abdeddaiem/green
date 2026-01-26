import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  baseCurrency: string;
  displayCurrency: string;
  supportedCurrencies: string[];
  setBaseCurrency: (currency: string) => void;
  setDisplayCurrency: (currency: string) => void;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
  getCurrencySymbol: (currency: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [baseCurrency, setBaseCurrency] = useState<string>('PKR');
  const [displayCurrency, setDisplayCurrency] = useState<string>('PKR');
  const [_exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  const supportedCurrencies = ['PKR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AED'];

  // Fetch exchange rates from backend
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // In a real app, this would call an endpoint like /api/exchange-rates
        // For now, we'll use localStorage or fetch from backend
        const response = await fetch(`http://localhost:8000/api/exchange-rates?base=${baseCurrency}`);
        if (response.ok) {
          const data = await response.json();
          setExchangeRates(data.rates || {});
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch exchange rates:', error);
        // Use cached rates from localStorage as fallback
        const cachedRates = localStorage.getItem(`rates_${baseCurrency}`);
        if (cachedRates) {
          setExchangeRates(JSON.parse(cachedRates));
        }
      }
    };

    fetchRates();
  }, [baseCurrency]);

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;

    // This would normally query the database for rates
    // For now, returning the amount as-is (backend handles conversion)
    // The actual conversion happens in the API endpoint
    return amount;
  };

  const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
      PKR: '₨',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      AED: 'د.إ',
    };
    return symbols[currency] || currency;
  };

  const value: CurrencyContextType = {
    baseCurrency,
    displayCurrency,
    supportedCurrencies,
    setBaseCurrency,
    setDisplayCurrency,
    convertAmount,
    getCurrencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
