import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Colors,
  Intent,
} from '@blueprintjs/core';
import {
  Column,
  Table,
  Cell,
  EditableCell,
  ColumnHeaderCell,
  RegionCardinality,
  RenderMode,
  RowHeaderCell,
} from '@blueprintjs/table';
import { Popover2, Popover2InteractionKind } from '@blueprintjs/popover2';
import { DateInput } from '@blueprintjs/datetime';
import moment from 'moment';
import $$$ from 'jquery';

const Store = require('electron-store');

const store = new Store();

import {
  FormatDollarAmount,
  FormatPercentAmount,
  IsMarketDefinitelyClosed,
} from './util';
import { fetchQuote, searchSymbol } from './api';
import styles from './StockTable.scss';
import EditStockOverlay from './EditStockOverlay';
import StockRecord from './StockRecord';
import { INDICES_SUFFIX } from './constants';
import ImportOverlay from './ImportOverlay';
import LastUpdatedView from "./LastUpdatedView";

// let TEST_stock_data = [
//   new StockRecord('TO', 'CHE.UN', 900, 7.01),
//   new StockRecord('TO', 'CHR', 1200, 4.68),
//   new StockRecord('TO', 'FOOD', 600, 9.829),
//   new StockRecord('CN', 'HARV', 1200, 3.907),
//   new StockRecord('TO', 'LABS', 9000, 0.551),
//   new StockRecord('TO', 'MEG'),
//   new StockRecord('TO', 'AC'),
//   new StockRecord('TO', 'VLNS'),
//   new StockRecord('TO', 'CHE.UN', 900, 7.01),
//   new StockRecord('TO', 'CHR', 1200, 4.68),
//   new StockRecord('TO', 'FOOD', 600, 9.829),
//   new StockRecord('CN', 'HARV', 1200, 3.907),
//   new StockRecord('TO', 'LABS', 9000, 0.551),
//   new StockRecord('TO', 'MEG'),
//   new StockRecord('TO', 'AC'),
//   new StockRecord('TO', 'VLNS'),
// ];

// store.set("data", JSON.stringify(TEST_stock_data));

function loadStocksData() {
  let rawData = store.get('stocksData');
  //   console.log('rawData', rawData);
  let stockRecords;

  console.log('loading stocks data');
  try {
    stockRecords = JSON.parse(rawData);
    stockRecords.forEach((sr) => {
      console.log('date: ', sr.purchaseDate);

      if (sr.purchaseDate == null || sr.purchaseDate == 'null') {
        sr.purchaseDate = null;
      } else {
        sr.purchaseDate = moment(sr.purchaseDate).toDate();
      }
      console.log('   => ', sr.purchaseDate);
    });
  } catch (e) {
    stockRecords = [];
  }

  return stockRecords;
}

function saveAppData(data) {
  store.set('stocksData', JSON.stringify(data));
}

let loadedStockData = loadStocksData();
// saveAppData(TEST_stock_data);
// let TEST_stock_data = [];

const getCellBackground = (rowIndex) => {
  if (rowIndex % 2 === 1) {
    return 'rgb(234, 246, 255)';
  } else {
    return 'white';
  }
};

const renderStockNameCell = (getCellData, actions, rowIndex) => {
  let { onClick, onHover, onMouseLeave } = actions;
  let data = getCellData(rowIndex, 'symbol');
  let error = getCellData(rowIndex, 'symbolError');
  const cellStyleBg = { backgroundColor: 'lightgray' };
  let intent = Intent.NONE;

  //   console.log('Render name cell');

  if (error != null) {
    console.log('found error!');
    intent = Intent.DANGER;
  }

  return (
    <Cell
      className={`${styles.stockTableCell} ${styles.stockNameCell}`}
      style={{
        background:
          intent == Intent.NONE ? getCellBackground(rowIndex) : undefined,
        textAlign: 'center',
      }}
      // inputProps={{style: {textAlign: "center"}}}
      value={data}
      intent={intent}
    >
      <Button
        minimal={true}
        text={data}
        onClick={onClick.bind(this, data, rowIndex)}
        onMouseEnter={() => onHover(rowIndex)}
        onMouseLeave={() => onMouseLeave()}
        fill={true}
      />
    </Cell>
  );
};

const renderQuantityCell = (getCellData, onChanged, rowIndex) => {
  let data = getCellData(rowIndex, 'quantity');
  let error = getCellData(rowIndex, 'quantityError');
  let intent = Intent.NONE;

  if (error != null) {
    console.log('found error!');
    intent = Intent.DANGER;
  }

  return (
    <EditableCell
      className={styles.stockTableCell}
      style={
        intent == Intent.NONE ? { background: getCellBackground(rowIndex) } : {}
      }
      onConfirm={onChanged.bind(this, rowIndex)}
      value={data}
      intent={intent}
    ></EditableCell>
  );
};

const renderAvgCostCell = (getCellData, onChanged, rowIndex) => {
  let data = getCellData(rowIndex, 'avgCost');
  let error = getCellData(rowIndex, 'avgCostError');
  let intent = Intent.NONE;

  if (error != null) {
    console.log('found error!');
    intent = Intent.DANGER;
  }

  return (
    <EditableCell
      className={styles.stockTableCell}
      style={
        intent == Intent.NONE ? { background: getCellBackground(rowIndex) } : {}
      }
      onConfirm={onChanged.bind(this, rowIndex)}
      value={FormatDollarAmount(data)}
      intent={intent}
    ></EditableCell>
  );
};

const renderInvestedCell = (getCellData, onChangeIgnore, rowIndex) => {
  let avgCost = getCellData(rowIndex, 'avgCost');
  let quantity = getCellData(rowIndex, 'quantity');

  let intent = Intent.NONE;

  let invested = '';

  if (avgCost != null && quantity != null) {
    invested = avgCost * quantity;
  }

  return (
    <Cell
      className={styles.stockTableCell}
      style={{ background: getCellBackground(rowIndex) }}
    >
      {FormatDollarAmount(invested)}
    </Cell>
  );
};

const renderCurrPriceCell = (getCellData, onChangeIgnore, rowIndex) => {
  let data = getCellData(rowIndex, 'currPrice');
  let textColor = Colors.DARK_GRAY5;
  let lastUpdated = getCellData(rowIndex, 'lastUpdated');

  if (lastUpdated) {
    // const threeMinutesAgo = moment().subtract(10, 'seconds'); DEV:
    const threeMinutesAgo = moment().subtract(2, 'minutes');
    if (moment(lastUpdated).isBefore(threeMinutesAgo)) {
      textColor = Colors.GRAY5;
    }
  }

  return (
    <Cell
      className={styles.stockTableCell}
      style={{ background: getCellBackground(rowIndex), color: textColor }}
    >
      {FormatDollarAmount(data)}
    </Cell>
  );
};

const renderGainLossCell = (getCellData, onChangeIgnore, rowIndex) => {
  let avgCost = getCellData(rowIndex, 'avgCost');
  let quantity = getCellData(rowIndex, 'quantity');
  let currPrice = getCellData(rowIndex, 'currPrice');
  let gainLoss = null;
  let gainLossPercent = null;
  let gainLossStr = null;
  let isNegative = false;
  let intent = Intent.NONE;

  if (avgCost != null && quantity != null && currPrice != null) {
    gainLoss = currPrice * quantity - avgCost * quantity;
    gainLossPercent = -(1.0 - currPrice / avgCost) * 100;

    if (isNaN(gainLoss) || isNaN(gainLossPercent)) {
      gainLossStr = 'Error';
      intent = Intent.DANGER;
    } else {
      if (gainLoss < 0) isNegative = true;

      gainLoss = Math.abs(gainLoss); // convert to positive value for proper negative val formatting with $ sign.
      gainLoss = FormatDollarAmount(gainLoss);

      gainLossPercent = FormatPercentAmount(gainLossPercent);

      gainLossStr = `${isNegative ? '-' : ''}${gainLoss} (${gainLossPercent})`;
    }
  }

  return (
    <Cell
      className={styles.stockTableCell}
      style={{
        color: isNegative ? 'red' : 'green',
        background: getCellBackground(rowIndex),
      }}
      intent={intent}
    >
      {gainLossStr}
    </Cell>
  );
};

const renderDatePurchasedCell = (getCellData, onChanged, rowIndex) => {
  let purchaseDate = getCellData(rowIndex, 'purchaseDate');
  return (
    <Cell
      className={styles.stockTableCell}
      style={{ background: getCellBackground(rowIndex), width: 100 }}
      interactive={true}
    >
      <DateInput
        formatDate={(date) => date.toDateString()}
        onChange={onChanged.bind(this, rowIndex)}
        parseDate={(str) => new Date(str)}
        placeholder={'M/D/YYYY'}
        value={purchaseDate}
        showActionsBar={true}
        inputProps={{
          style: {
            padding: 0,
            background: 'transparent',
            boxShadow: 'none',
            textAlign: 'center',
          },
        }}
        timePrecision={'minute'}
      />
    </Cell>
  );
};

const RefreshButtonColumn = (props) => {
  let rows = new Array(props.count).fill(0);

  return (
    <div className={styles.refreshColumnContainer}>
      <div style={{ height: 45 }} />
      {rows.map((i, idx) => (
        <div style={{ width: 80 }} key={idx + ''}>
          <Button
            icon={'refresh'}
            minimal={true}
            onClick={() => props.onClickRefreshStock(idx)}
            style={{
              height: 35,
              visibility: props.visibleIdx == idx && 'visible',
              background: 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
};

const ColumnMenu = (props) => {
  return (
    <Menu>
      <MenuItem icon="sort-asc" onClick={props.sortAsc} text="Sort Asc" />
      <MenuItem icon="sort-desc" onClick={props.sortDesc} text="Sort Desc" />
    </Menu>
  );
};

export default class StockWatchTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          name: 'Stock',
          cellRenderer: renderStockNameCell,
          keyProps: ['symbol', 'symbolError'],
          action: {
            onClick: this.onClickStockName,
            onHover: this.onHoverStockName,
            onMouseLeave: this.onMouseLeaveStockNames,
          },
          key: 'symbol',
        },
        {
          name: 'Quantity',
          cellRenderer: renderQuantityCell,
          keyProps: ['quantity'],
          action: this.onQuantitySet,
          key: 'quantity',
        },
        {
          name: 'Average Cost',
          cellRenderer: renderAvgCostCell,
          keyProps: ['avgCost'],
          action: this.onAvgCostSet,
          key: 'avgCost',
        },
        {
          name: 'Current Price',
          cellRenderer: renderCurrPriceCell,
          keyProps: ['currPrice'],
          key: 'currPrice',
        },
        {
          name: 'Invested',
          cellRenderer: renderInvestedCell,
          keyProps: ['avgCost', 'quantity'],
          key: 'invested',
        },
        {
          name: 'Gain/Loss',
          cellRenderer: renderGainLossCell,
          keyProps: ['gainLoss'],
          key: 'gainLoss',
        },
        {
          name: 'Purchase Date',
          cellRenderer: renderDatePurchasedCell,
          action: this.onPurchaseDateSet,
          keyProps: ['purchaseDate'],
          key: 'purchaseDate',
        },
      ],
      data: loadedStockData,
      editingStockIdx: null,
      importIsShowing: false,
      refreshBtnIdx: null,
      isReorderEnabled: false,
      tableKey: 1, // when changed, entire table is forced to re-render (should only be done after sorting)
      lastUpdatedTs: null // used as key for LastUpdatedView. Its set whenever we refresh all stocks, triggering a new instance of the LastUpdatedView to be created.
    };

    this.autoRefreshTimer = null;
  }

  // TODO:
  // "Suggest" component to search stocks seems to be buggy when multiple searches are sent
  // GAIN/LOSS Column sorting

  componentDidMount() {
    this.refreshAllStockPrices();
    this.autoRefreshTimer = setInterval(this.onAutoRefreshTmoExpired, 120000);
  }

  onAutoRefreshTmoExpired = () => {
    // if we're well-outside of market hours skip auto-refresh
    if (IsMarketDefinitelyClosed()) {
      console.log('Market is closed. Skipping auto-refresh');
      return;
    }

    this.refreshAllStockPrices();
  };

  refreshAllStockPrices = async () => {
    let { data, lastUpdatedTs } = this.state;

    // if we successfully received latest price for ANY stocks in watchlist, set this flag
    let anyPricesReceived = false;

    for (let i = 0; i < data.length; i++) {
      const stock = data[i];
      if (stock.symbol != null && stock.symbol != '') {
        try {
          let resp = await fetchQuote(
            stock.symbol + '.' + INDICES_SUFFIX[stock.market]
          );
          // let resp = await fetchQuote("CHE.UN.TO");
          // let resp = await fetchQuote("HARV" + ".CN");

          data[i].symbolError = null;
          data[i].priceError = null;

          console.log('got resp for ', stock.symbol, resp.price);
          if (resp && resp.price) {
            data[i].currPrice = resp.price.regularMarketPrice;
            data[i].lastUpdated = new Date();
            anyPricesReceived = true;
          }
        } catch (e) {
          console.log(e.message);
          if (data[i].currPrice == null) {
            // no previous price. Probably a symbol error
            data[i].symbolError = e.message;
          } else {
            data[i].priceError = e.message;
          }

          data[i].currPrice = '-';
        }

        this.setState({ data });
      }
    }

    if (anyPricesReceived == true) {
        // at least one price was successfully recv'd, update lastUpdated timestamp, so that LastUpdatedView is re-constructed with new key
        lastUpdatedTs = moment().toISOString();
    }

    this.setState({lastUpdatedTs: lastUpdatedTs});
  };

  getCellData = (rowIdx, columnKey) => {
    return this.state.data[rowIdx][columnKey];
  };

  sortAsc = (key) => {
    console.log('sortAsc', key);
    let { data, tableKey } = this.state;
    let sortedData = this.state;

    // gainLoss is a calculated column, so needs special handling
    if (key == 'gainLoss') {
      data.sort((a, b) => {
        // console.log(a[key], "vs.", b[key], " ===> ", a[key] - b[key]);
        let {
          currPrice: currPriceA,
          quantity: quantityA,
          avgCost: avgCostA,
        } = a;
        let {
          currPrice: currPriceB,
          quantity: quantityB,
          avgCost: avgCostB,
        } = b;

        if (
          [currPriceA, quantityA, avgCostA].includes(null) &&
          ![currPriceB, quantityB, avgCostB].includes(null)
        )
          return 1;
        else if (
          [currPriceB, quantityB, avgCostB].includes(null) &&
          ![currPriceA, quantityA, avgCostA].includes(null)
        )
          return -1;
        else if (
          [currPriceA, quantityA, avgCostA].includes(null) &&
          [currPriceB, quantityB, avgCostB].includes(null)
        ) {
          return 0;
        }

        let gainLossA = currPriceA * quantityA - avgCostA * quantityA;
        let gainLossB = currPriceB * quantityB - avgCostB * quantityB;

        return gainLossA - gainLossB;
      });
    } else if (key == 'invested') {
      data.sort((a, b) => {
        let { quantity: quantityA, avgCost: avgCostA } = a;
        let { quantity: quantityB, avgCost: avgCostB } = b;
        let investedA, investedB;

        if (
          [quantityA, avgCostA].includes(null) &&
          ![quantityB, avgCostB].includes(null)
        )
          return 1;
        else if (
          [quantityB, avgCostB].includes(null) &&
          ![quantityA, avgCostA].includes(null)
        )
          return -1;
        else if (
          [quantityA, avgCostA].includes(null) &&
          [quantityB, avgCostB].includes(null)
        ) {
          return 0;
        }

        investedA = avgCostA * quantityA;
        investedB = avgCostB * quantityB;

        return investedA - investedB;
      });
    } else if (key == 'symbol') {
      data.sort((a, b) => {
        if (!a[key] && b[key]) return 1;
        else if (!b[key] && a[key]) return -1;
        else if (!a[key] && !b[key]) {
          return 0;
        }

        if (a[key] == b[key]) return 0;
        else if (a[key] >= b[key]) return 1;
        else return -1;
      });
    } else {
      data.sort((a, b) => {
        console.log('a: ', a);
        if (a[key] == null && b[key] != null) return 1;
        else if (b[key] == null && a[key] != null) return -1;
        else if (a[key] == null && b[key] == null) {
          return 0;
        }

        return a[key] - b[key];
      });
    }

    this.persistAndSetState(data, { tableKey: tableKey + 1 });
  };

  sortDesc = (key) => {
    console.log('sortDesc', key);
    let { data, tableKey } = this.state;
    let sortedData = this.state;

    // gainLoss is a calculated column, so needs special handling
    if (key == 'gainLoss') {
      data.sort((a, b) => {
        // console.log(a[key], "vs.", b[key], " ===> ", a[key] - b[key]);
        let {
          currPrice: currPriceA,
          quantity: quantityA,
          avgCost: avgCostA,
        } = a;
        let {
          currPrice: currPriceB,
          quantity: quantityB,
          avgCost: avgCostB,
        } = b;

        let gainLossA = currPriceA * quantityA - avgCostA * quantityA;
        let gainLossB = currPriceB * quantityB - avgCostB * quantityB;

        if (
          [currPriceA, quantityA, avgCostA].includes(null) &&
          ![currPriceB, quantityB, avgCostB].includes(null)
        )
          return 1;
        else if (
          [currPriceB, quantityB, avgCostB].includes(null) &&
          ![currPriceA, quantityA, avgCostA].includes(null)
        )
          return -1;
        else if (
          [currPriceA, quantityA, avgCostA].includes(null) &&
          [currPriceB, quantityB, avgCostB].includes(null)
        ) {
          return 0;
        }

        return gainLossB - gainLossA;
      });
    } else if (key == 'invested') {
      data.sort((a, b) => {
        let { quantity: quantityA, avgCost: avgCostA } = a;
        let { quantity: quantityB, avgCost: avgCostB } = b;
        let investedA, investedB;

        if (
          [quantityA, avgCostA].includes(null) &&
          ![quantityB, avgCostB].includes(null)
        )
          return 1;
        else if (
          [quantityB, avgCostB].includes(null) &&
          ![quantityA, avgCostA].includes(null)
        )
          return -1;
        else if (
          [quantityA, avgCostA].includes(null) &&
          [quantityB, avgCostB].includes(null)
        ) {
          return 0;
        }

        investedA = avgCostA * quantityA;
        investedB = avgCostB * quantityB;

        return investedB - investedA;
      });
    } else if (key == 'symbol') {
      data.sort((a, b) => {
        console.log(a[key], 'vs.', b[key]);
        console.log('    == ', a[key] == b[key]);
        console.log('    >= ', a[key] >= b[key]);
        console.log('    <= ', a[key] <= b[key]);

        if (!a[key] && b[key]) return 1;
        else if (!b[key] && a[key]) return -1;
        else if (!a[key] && !b[key]) {
          return 0;
        }

        if (a[key] == b[key]) return 0;
        else if (a[key] >= b[key]) return -1;
        else return 1;
      });
    } else {
      data.sort((a, b) => {
        if (a[key] == null && b[key] != null) return 1;
        else if (b[key] == null && a[key] != null) return -1;
        else if (a[key] == null && b[key] == null) {
          return 0;
        }

        return b[key] - a[key];
      });
    }

    this.persistAndSetState(data, { tableKey: tableKey + 1 });
  };

  renderColumnHeader = (columnInfo) => {
    return (
      <ColumnHeaderCell
        nameRenderer={() => (
          <span
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'none',
            }}
          >
            {columnInfo.name}
          </span>
        )}
        className={styles.stockHeaderCell}
        menuRenderer={() => (
          <ColumnMenu
            sortAsc={() => this.sortAsc(columnInfo.key)}
            sortDesc={() => this.sortDesc(columnInfo.key)}
          />
        )}
        style={{
          height: 45,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          lineHeight: '45px',
        }}
      />
    );
  };

  renderColumn = (columnInfo) => {
    return (
      <Column
        key={columnInfo.key}
        columnHeaderCellRenderer={() => this.renderColumnHeader(columnInfo)}
        cellRenderer={columnInfo.cellRenderer.bind(
          this,
          this.getCellData,
          columnInfo.action
        )}
      />
    );
  };

  persistAndSetState = (stockData, extraStateInfo = {}) => {
    saveAppData(stockData);

    let {
      editingStockIdx = null,
      tableKey = this.state.tableKey,
    } = extraStateInfo;

    this.setState({
      data: stockData,
      editingStockIdx: editingStockIdx,
      tableKey: tableKey,
    });
  };

  onAddClicked = () => {
    //   let {data} = this.state;
    // data.push(StockRecord.emptyRecord());

    // purposefully not updating state with new data yet.
    this.setState({ editingStockIdx: this.state.data.length });
  };

  onClickRefreshStock = (rowIdx) => {
    console.log('onClickRefreshStock', rowIdx);
    if (rowIdx >= this.state.data.length) return;

    this.refreshStock(this.state.data[rowIdx], rowIdx);
  };

  onClickStockName = (currName, rowIdx) => {
    this.setState({ editingStockIdx: rowIdx });
  };

  onHoverStockName = (rowIdx) => {
    this.setState({ refreshBtnIdx: rowIdx });
  };

  onMouseLeaveStockNames = () => {
    this.setState({ refreshBtnIdx: null });
  };

  refreshStock = async (stock, rowIdx) => {
    console.log('refreshStock', rowIdx, stock);

    // return early if no symbol present (shouldn't happen anymore)
    if (stock == null || !stock.symbol || rowIdx == null) return;

    // search for stock symbol, and if found, update data for it
    console.log('Getting stock: ', stock.symbol);

    try {
      let resp = await fetchQuote(
        stock.symbol + '.' + INDICES_SUFFIX[stock.market]
      );
      console.log(resp);

      if (resp) {
        stock.currPrice = resp.price.regularMarketPrice;
        stock.lastUpdated = new Date();
      }
    } catch (e) {
      console.log(e.message);
      if (stock.currPrice == null) {
        // no previous price. Probably a symbol error
        stock.symbolError = e.message;
      } else {
        stock.priceError = e.message;
      }
    }

    // clone stocks data
    let updated = this.state.data.map((a) =>
      Object.assign(StockRecord.emptyRecord(), a)
    );
    updated[rowIdx] = stock;

    // console.log(updated[rowIdx]);

    this.persistAndSetState(updated);
  };

  onQuantitySet = (rowIdx, quantity) => {
    let { data } = this.state;
    let record = { ...data[rowIdx] };

    let quantityVal = parseInt(quantity);

    record.quantity = quantity;

    if (quantity == '') {
      record.quantity = null;
    } else if (isNaN(quantityVal)) {
      // handle with error state
      record.quantityError = 'Invalid quantity';
    } else {
      record.quantityError = null;
    }

    data[rowIdx] = record;

    this.persistAndSetState(data);
  };

  onAvgCostSet = (rowIdx, avgCost) => {
    let { data } = this.state;
    let record = data[rowIdx];

    if (avgCost && avgCost.indexOf('$') == 0) {
      // sanitize string
      avgCost = avgCost.substr(1);
    }

    let avgCostVal = parseFloat(avgCost);

    if (avgCost == '') {
      record.avgCost = null;
    } else if (isNaN(avgCostVal)) {
      // handle with error state
      record.avgCostError = 'Invalid avg cost';
      record.avgCost = avgCost;
    } else {
      record.avgCostError = null;
      record.avgCost = avgCostVal;
    }

    this.persistAndSetState(data);
  };

  onPurchaseDateSet = (rowIdx, purchaseDate) => {
    console.log('onPurchaseDateSet', purchaseDate);
    let { data } = this.state;
    let record = { ...data[rowIdx] };

    record.purchaseDate = purchaseDate;

    data[rowIdx] = record;

    this.persistAndSetState(data);
  };

  onDeleted = (rowIdx) => {
    let { data } = this.state;

    // copy array
    let updated = data.map((a) => Object.assign(StockRecord.emptyRecord(), a));

    updated.splice(rowIdx, 1);

    this.persistAndSetState(updated);
  };

  onEditingComplete = (rowIdx, editedStock) => {
    let { data } = this.state;

    // clone stocks data
    let updated = data.map((a) => Object.assign(StockRecord.emptyRecord(), a));

    if (rowIdx == data.length) {
      // a new stock was just added. push it to the array
      updated.push(editedStock);
    } else {
      // existing stock was edited
      updated[rowIdx] = editedStock;
    }

    this.persistAndSetState(updated);

    this.refreshStock(editedStock, rowIdx);
  };

  onEditingCancelled = () => {
    this.setState({ editingStockIdx: null });
  };

  calcNetGainLoss = (data) => {
    let content = '';
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      const stkRec = data[i];

      if (stkRec.quantity == null || stkRec.avgCost == null) continue;

      let gainLoss =
        stkRec.currPrice * stkRec.quantity - stkRec.avgCost * stkRec.quantity;

      total += gainLoss;
    }

    return total;
  };

  calcTotalInvested = (data) => {
    let content = '';
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      const stkRec = data[i];

      if (stkRec.quantity == null || stkRec.avgCost == null) continue;

      let investedInStock = stkRec.avgCost * stkRec.quantity;

      total += investedInStock;
    }

    return total;
  };

  onRowsReordered = (oldIndex, newIndex, length) => {
    let { data, tableKey } = this.state;

    // clone stocks data
    let updated = data.map((a) => Object.assign(StockRecord.emptyRecord(), a));

    updated.splice(newIndex, 0, updated.splice(oldIndex, 1)[0]);

    this.persistAndSetState(updated, { tableKey: tableKey + 1 });
  };

  renderRowHeaderCell = (rowIdx) => {
    return (
      <RowHeaderCell
        style={{
          background: getCellBackground(rowIdx),
          width: 40,
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon icon="drag-handle-horizontal"/>
      </RowHeaderCell>
    );
  };

  renderFooterCell = (width, idx) => {
    // console.log('renderFooterCell', width, idx);
    let content = ' ';
    let textColor;
    let { data } = this.state;
    let total;

    if (idx == 5) {
      let isNegative = false;

      total = this.calcNetGainLoss(data);

      if (isNaN(total)) {
        content = ``;
      } else {
        if (total < 0) {
          textColor = 'red';
          isNegative = true;
        } else {
          textColor = 'green';
        }

        total = Math.abs(total); // convert to positive value for proper negative val formatting with $ sign.

        total = FormatDollarAmount(total);

        content = `${isNegative ? '-' : ''}${total}`;
      }
    } else if (idx == 4) {
      total = this.calcTotalInvested(data);

      if (isNaN(total)) {
        content = ``;
      } else {
        content = FormatDollarAmount(total);
      }
    }

    return (
      <span
        key={idx + ''}
        className={styles.tableFooterCell}
        style={{ minWidth: width, color: textColor }}
      >
        {content}
      </span>
    );
  };

  renderTableFooter = (columnWidths) => {
    return (
      <div className={styles.tableFooterWrap}>
        {columnWidths.map((width, idx) => {
          return this.renderFooterCell(width, idx);
        })}
      </div>
    );
  };

  render() {
    // console.log(this.state);
    // this.state.data.forEach((d) => console.log(d));

    let {
      editingStockIdx,
      refreshBtnIdx,
      tableKey,
      isReorderEnabled,
      importIsShowing,
      lastUpdatedTs,
    } = this.state;
    let columnWidths = [135, 135, 145, 145, 145, 175, 175];
    return (
      <div style={{ alignSelf: 'center' }}>
        {this.state.data.length > 0 && (
          <>
              <div style={{display: "flex",  justifyContent: "flex-end"}}>
                <Button icon="refresh" onClick={() => {
                    this.refreshAllStockPrices();
                }}/>
                <Button 
                    style={{ marginLeft: 20 }}
                    icon={"move"}
                    intent={isReorderEnabled ? Intent.PRIMARY : Intent.NONE}
                    onClick={() => this.setState({ isReorderEnabled: !isReorderEnabled })}
                />
                <Button
                    style={{ marginLeft: 20 }}
                    icon="import"
                    onClick={() => this.setState({ importIsShowing: true })}
                />
                <Button 
                    style={{ marginLeft: 20 }}
                    text={'Add New Stock'} icon="add" onClick={this.onAddClicked} />
              </div>
              <br />
              <div style={{ position: 'relative' }}>
                <RefreshButtonColumn
                  count={this.state.data.length}
                  visibleIdx={refreshBtnIdx}
                  onClickRefreshStock={this.onClickRefreshStock}
                />
                <div style={{ borderRadius: 15, overflow: 'hidden' }}>
                  <Table
                    numRows={this.state.data.length}
                    style={{
                      boxShadow: 'none',
                      background: 'white',
                    }}
                    defaultRowHeight={35}
                    renderMode={RenderMode.NONE}
                    columnWidths={columnWidths}
                    key={tableKey + ''}
                    enableRowHeader={isReorderEnabled}
                    enableRowReordering={isReorderEnabled}
                    selectionModes={isReorderEnabled ? [RegionCardinality.FULL_ROWS] : []}
                    onRowsReordered={this.onRowsReordered}
                    rowHeaderCellRenderer={this.renderRowHeaderCell}
                  >
                    {this.state.columns.map((col) => this.renderColumn(col))}
                  </Table>
                  {this.renderTableFooter(columnWidths)}
                </div>
                {lastUpdatedTs && <LastUpdatedView key={lastUpdatedTs}/>}
              </div>
          </>
        )}
        <EditStockOverlay
          key={editingStockIdx + ''} // pass key to create new comp instance when key changes
          stock={
            editingStockIdx != null
              ? this.state.data[editingStockIdx]
              : undefined
          }
          isOpen={editingStockIdx != null}
          onEditingCancelled={this.onEditingCancelled}
          rowIdx={editingStockIdx}
          onEditingComplete={this.onEditingComplete}
          onDeleted={this.onDeleted}
        />
        <ImportOverlay
          isOpen={importIsShowing}
          onPressClose={() => this.setState({importIsShowing: false})}
          onNewStocksAdded={(newStocks) => {
            let { data } = this.state;

            // clone stocks data
            let updated = data.map((a) =>
              Object.assign(StockRecord.emptyRecord(), a)
            );

            updated.push(...newStocks);

            this.setState({ data: updated, importIsShowing: false}, () => {
                this.refreshAllStockPrices();
            });
          }}
        />
      </div>
    );
  }
}
