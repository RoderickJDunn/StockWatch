import React, { Component } from 'react'
import {
    InputGroup,
    HTMLSelect,
    Button,
    Intent,
    ButtonGroup,
    Icon,
    Tag,
    Divider,
    FormGroup,
    Colors,
    Segmented,
    Menu, 
    MenuItem,
    Position
  } from '@blueprintjs/core';
import { Column, Table, Cell } from "@blueprintjs/table";

import StockWatchTable from "./StockWatchTable";

const cellRenderer = (rowIndex) => <Cell>{`$${(rowIndex * 10).toFixed(2)}`}</Cell>;

export default class StockWatchScreen extends Component {

    watchTableRef = null;



    render() {
        return (
            <div className={"screen"} style={{display: "flex", flex: 1, alignContent: "center", justifyContent: "center"}}>
                <Button icon="refresh" style={{position: "absolute", right: 20, top: 20}} onClick={() => {
                    this.watchTableRef && this.watchTableRef.refreshAllStockPrices();
                }}/>
                <StockWatchTable ref={elm => this.watchTableRef = elm}/>
            </div>
        )
    }
}