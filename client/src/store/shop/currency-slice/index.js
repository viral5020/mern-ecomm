import { createSlice } from '@reduxjs/toolkit';

// Define initial state for currency and exchange rates
const initialState = {
  currency: 'USD',  // default currency
  exchangeRates: {
    USD: 1,
    EUR: 0.94, // USD to EUR
    GBP: 0.81, // USD to GBP
    CAD: 1.35, // USD to CAD
    AUD: 1.50, // USD to AUD
    JPY: 136.75, // USD to JPY
    INR: 83.01, // USD to INR
    CHF: 0.92, // USD to CHF
    NZD: 1.65, // USD to NZD
  },
};

// Create slice
const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload;  // Set the selected currency
    },
    setExchangeRates: (state, action) => {
      state.exchangeRates = action.payload; // Set exchange rates if needed
    },
  },
});

// Export actions
export const { setCurrency, setExchangeRates } = currencySlice.actions;

// Selectors
export const selectCurrency = (state) => state.currency.currency;
export const selectExchangeRates = (state) => state.currency.exchangeRates;

export default currencySlice.reducer;
