import { ipcRenderer } from 'electron';
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
    Position,
    Dialog,
    Classes
  } from '@blueprintjs/core';
import { Column, Table, Cell } from "@blueprintjs/table";

import StockWatchTable from "./StockWatchTable";

export default class StockWatchScreen extends Component {


    constructor() {
        super();
        
        this.watchTableRef = null;

        this.state = {
            infoShowing: false,
            appVersion: "Unknown Version",
        };

        ipcRenderer.once('app-version', (event, args) => {
            this.setState({appVersion: args});
        })
    }



    render() {
        return (
            <div className="screen" style={{display: "flex", flex: 1, alignContent: "center", justifyContent: "center"}}>
                <Button icon="info-sign" minimal style={{position: "absolute", left: 20, top: 20}} onClick={() => {
                    this.setState({infoShowing: true});
                }}/>
                <Button icon="refresh" style={{position: "absolute", right: 20, top: 20}} onClick={() => {
                    this.watchTableRef && this.watchTableRef.refreshAllStockPrices();
                }}/>
                <StockWatchTable ref={elm => this.watchTableRef = elm}/>
                <Dialog isOpen={this.state.infoShowing} title={"Stock Watch"}>
                    <div className={Classes.DIALOG_BODY}>
                        <p>Version: {this.state.appVersion}</p>
                    </div>
                    <div className={Classes.DIALOG_FOOTER}>
                        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                            <Button onClick={() => this.setState({infoShowing: false})}>Close</Button>
                        </div>
                    </div>
                </Dialog>
            </div>
        )
    }
}