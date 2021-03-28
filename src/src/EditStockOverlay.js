import React, { Component } from 'react';
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Colors,
  Intent,
  Overlay,
  InputGroup,
  Divider,
  FormGroup,
} from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { Suggest } from '@blueprintjs/select';
import { debounce } from 'lodash';

import styles from './EditStockOverlay.scss';
import * as API from './api';
import StockRecord from './StockRecord';

const FormSectionContainer = (props) => {
  return (
    <div
      className={styles.formSectionContainer}
      style={{
        marginTop: 20,
        marginBottom: 20,
      }}
    >
      {props.label && <h3 style={{ marginBottom: 9 }}>{props.label}</h3>}
      <div
        style={{
          background: 'rgb(221 233 241)',
          padding: 20,
          borderRadius: 8,
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default class EditStockOverlay extends Component {
  constructor(props) {
    super(props);

    const {stock = {}} = props;
    console.log('got stock prop: ', stock);

    let query = stock.symbol || "";
    if (stock.symbol && stock.market) {
        query += ` (${stock.market})`;
    }

    this.state = {
      items: [],
      currStock: {symbol: stock.symbol, exchange: stock.market},
      quantity: stock.quantity,
      avgCost: stock.avgCost,
      purchaseDate: stock.purchaseDate,
      query: query
    };

    this.handleQueryChangeDebounced = debounce(this.handleQueryChange, 500);

  }

  renderInputValue = (stockInfo) => {
    console.log('stockInfo', stockInfo);
    return stockInfo.symbol + ` (${stockInfo.exchange})`;
  };

  handleQueryChange = async (query) => {
    console.log('handleQueryChange', query);

    if (query == '') {
      this.setState({ items: [] });
      return;
    }

    API.searchSymbol(query)
      .then((resp) => {
        console.log('resp', resp.data);
        this.setState({ items: resp.data.data });
      })
      .catch((e) => {
        console.log('SearchSymbol failed: ', e.message);
      });
    // let results = await API.searchSymbol(query);
  };

  render() {
    // console.log('render', this.state.items);

    let { currStock, quantity, avgCost, purchaseDate, query } = this.state;
    // console.log('currStock, quantity, avgCost, purchaseDate', currStock, quantity, avgCost, purchaseDate);

    return (
      <Overlay
        isOpen={this.props.isOpen}
        onClose={this.props.onEditingCancelled}
        canEscapeKeyClose={true}
        className={styles.overlayContainer}
        portalClassName={styles.overlayBackdrop}
      >
          <div className={styles.editStockDialogue}>
            <h2>Edit Stock</h2>
            <Divider />
            <FormSectionContainer label={'Find a stock to track'}>
              <FormGroup
                label={<span style={{ fontWeight: 200 }}>Stock *</span>}
                inline={true}
                style={{ margin: 0, fontSize: 12 }}
                contentClassName={styles.formItemContent}
              >
                <Suggest
                  //  createNewItemFromQuery={maybeCreateNewItemFromQuery}
                  //  createNewItemRenderer={maybeCreateNewItemRenderer}
                  inputProps={{ placeholder: 'Apple...' }}
                  inputValueRenderer={this.renderInputValue}
                  itemRenderer={(item, { handleClick, modifiers, query }) => (
                    <MenuItem
                      active={modifiers.active}
                      disabled={modifiers.disabled}
                      label={item.exchange}
                      key={item.symbol + item.exchange}
                      onClick={handleClick}
                      text={item.symbol + ` ${item.instrument_name}`}
                    />
                  )}
                  itemPredicate={() => true}
                  itemsEqual={(a, b) => a == b}
                  // we may customize the default filmSelectProps.items by
                  // adding newly created items to the list, so pass our own.
                  items={this.state.items}
                  noResults={<MenuItem disabled={true} text="No results." />}
                  onQueryChange={this.handleQueryChangeDebounced}
                  onItemSelect={(item) => this.setState({ currStock: item })}
                  popoverProps={{ minimal: true }}
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                  fill={true}
                  query={query}
                />
              </FormGroup>
            </FormSectionContainer>
            <FormSectionContainer label={'Purchase Info (optional)'}>
              <FormGroup
                label={'Quantity'}
                inline={true}
                labelFor="text-input"
                className={styles.formInputPurchaseInfo}
                style={{ fontSize: 12 }}
                contentClassName={styles.formItemContent}
              >
                <InputGroup
                  value={quantity}
                  onChange={(event) => this.setState({ quantity: event.target.value })}
                />
              </FormGroup>
              <FormGroup
                label={'Average Cost'}
                inline={true}
                labelFor="text-input"
                className={styles.formInputPurchaseInfo}
                style={{ fontSize: 12 }}
                contentClassName={styles.formItemContent}
              >
                <InputGroup
                  value={avgCost}
                  onChange={(event) => this.setState({ avgCost: event.target.value })}
                />
              </FormGroup>
              <FormGroup
                label={'Purchase Date'}
                inline={true}
                labelFor="text-input"
                className={styles.formInputPurchaseInfo}
                style={{ marginBottom: 0, fontSize: 12 }}
                contentClassName={styles.formItemContent}
              >
                <DateInput
                  fill={true}
                  formatDate={(date) => date.toDateString()}
                  onChange={(date) => this.setState({ purchaseDate: date })}
                  parseDate={(str) => new Date(str)}
                  placeholder={'M/D/YYYY'}
                  value={purchaseDate}
                  showActionsBar={true}
                  timePrecision={'minute'}
                />
              </FormGroup>
            </FormSectionContainer>
            {/* <Divider /> */}
            <div
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-between',
                  height: 20,
                }}
              >
                <Button
                  intent={Intent.DANGER}
                  large={true}
                  text="Delete"
                  onClick={() => this.props.onDeleted(this.props.rowIdx)}
                />
                <Button
                  intent={Intent.PRIMARY}
                  large={true}
                  text="Done"
                  onClick={() => {
                    let {
                      currStock,
                      quantity,
                      avgCost,
                      purchaseDate,
                    } = this.state;

                    let editedStock = new StockRecord(
                      currStock.exchange,
                      currStock.symbol,
                      quantity,
                      avgCost
                    );
                    editedStock.purchaseDate = purchaseDate;

                    this.props.onEditingComplete(
                      this.props.rowIdx,
                      editedStock
                    );
                  }}
                />
              </div>
            </div>
          </div>
      </Overlay>
    );
  }
}
