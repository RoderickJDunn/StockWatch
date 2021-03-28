
export default class StockRecord {
    constructor(market, symbol, quantity, avgCost, currPrice) {
      this.market = market;
      this.symbol = symbol;
      this.quantity = quantity;
      this.avgCost = avgCost;
      this.currPrice = currPrice;
      this.purchaseDate = null;
      this.lastUpdated = null;
  
      this.symbolError = null;
      this.priceError = null;
      this.quantityError = null;
      this.avgCostError = null;
    }
  
    static emptyRecord() {
      return new StockRecord();
    }
  }