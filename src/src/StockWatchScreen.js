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
    Classes,
    Toast
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
            // toastText: 
        };

        ipcRenderer.once('app-version', (event, args) => {
            console.log("Got app version event: ", event, args);
            this.setState({appVersion: args});
        })

        ipcRenderer.on('message', (event, args) => {
            console.log("Got message: ", event, args);
            // this.setState({appVersion: args});
        })
    }



    render() {
        return (
            <div className="screen" style={{display: "flex", flex: 1, alignContent: "center", justifyContent: "center"}}>
                <Button icon="info-sign" minimal style={{position: "absolute", left: 20, top: 20}} onClick={() => {
                    this.setState({infoShowing: true});
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