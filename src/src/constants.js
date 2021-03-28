// API endpoints
export const SYMBOL_SEARCH = 'https://api.twelvedata.com/symbol_search';

export const INDICES_SUFFIX = {
  NYSE: '',
  NASDAQ: '',
  NSE: 'NS',
  BSE: 'BO',
  ASX: 'AX',
  Euronext: {
    Belgium: 'BR',
    France: 'PA',
    Netherlands: 'AS',
  },
  Bovespa: 'SA',
  CNQ: 'CN',
  NEO: 'NE',
  TSX: 'TO',
  TSXV: 'V',
  OMXC: 'CO',
  OMXH: 'HE',
  FSX: 'F',
  XHAM: 'HM',
  XETR: 'DE',
  Munich: 'MU',
  XSTU: 'SG',
  XDUS: 'DU',
  HKEX: 'HK',
  OSE: 'OL',
  MOEX: 'ME',
  BME: 'MC',
  OMX: 'ST',
  BIST: 'IS',
  LSE: 'L',
};

export const DAYS_OF_WEEK = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
}