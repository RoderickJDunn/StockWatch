import { SYMBOL_SEARCH } from './constants';
const yahooFinance = require('yahoo-finance');
const axios = require('axios');

export const searchSymbol = async (value) => {
  return await axios.get(SYMBOL_SEARCH, { params: { symbol: value } });
};

export const fetchQuote = async (symbol) => {
    console.log('symbol', symbol);

    if (symbol.split(".").length == 3) {
        console.log('2 dots found');
        // there are 2 dots. replace the first with a dash
        symbol = symbol.replace(/\./, "-");
    }

    return await yahooFinance.quote({
        // symbol: symbol,
        symbol: symbol.split('.')[1] === '' ? symbol.split('.')[0] : symbol,
        modules: ['price'],
      });
};

