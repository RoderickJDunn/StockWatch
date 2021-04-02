import React, { Component } from 'react'
import {
  Button,
  Icon,
  Colors,
  Intent,
  Dialog,
  InputGroup,
  Classes,
  TextArea,
  Text
} from '@blueprintjs/core';

import {INDICES_SUFFIX} from "./constants";
import StockRecord from "./StockRecord";

/* 
Cash	 	 	 	$19,775.75	$19,775.75	 	 	 
TSX CHE.UN	900	$7.010	$6.930	-$0.080	$6,308.75	$6,237.00	-$71.75	-1.1%	BuySell
TSX CHR	1,200	$4.680	$4.620	-$0.060	$5,615.50	$5,544.00	-$71.50	-1.3%	BuySell
TSX FOOD	900	$9.332	$8.650	-$0.682	$8,399.25	$7,785.00	-$614.25	-7.3%	BuySell
TSX HARV	1,200	$3.907	$3.780	-$0.127	$4,688.75	$4,536.00	-$152.75	-3.3%	BuySell
TSX LABS	18,000	$0.503	$0.485	-$0.018	$9,062.50	$8,730.00	-$332.50	-3.7%	BuySell
Totals	 	$53,850.50	$52,607.75	-$1,242.75	-2.3%	




TSX CHE.UN	900	$7.010	$6.930	-$0.080	$6,308.75	$6,237.00	-$71.75	-1.1%	BuySell
TSX CHR	1,200	$4.680	$4.620	-$0.060	$5,615.50	$5,544.00	-$71.50	-1.3%	BuySell
TSX FOOD	900	$9.332	$8.650	-$0.682	$8,399.25	$7,785.00	-$614.25	-7.3%	BuySell
TSX HARV	1,200	$3.907	$3.780	-$0.127	$4,688.75	$4,536.00	-$152.75	-3.3%	BuySell
TSX LABS	18,000	$0.503	$0.485	-$0.018	$9,062.50	$8,730.00	-$332.50	-3.7%	BuySell
 */



export default class ImportOverlay extends React.Component {

    constructor() {
        super();
        this.textAreaRef = null;

        this.state = {
            linesWithErrors: []
        }
    }

    validateLine(market, symbol, quantity, averageCost) {
        let errors = [];
        if (!market || !INDICES_SUFFIX[market]) {
            errors.push("market");
        }
        if (!symbol) {
            errors.push("symbol");
        }
        if (quantity) {
            quantity = quantity.replace(",", "");

            if (isNaN(parseFloat(quantity))) {
                errors.push("quantity");
            }
        }
        if (averageCost) {
            if (averageCost.startsWith("$")) {
                averageCost = averageCost.substr(1);
            }
            if (isNaN(parseFloat(averageCost))) {
                errors.push("avgCost");
            }
        }

        return errors;
    }

    onPressAdd = () => {
        let dataStr = this.textAreaRef.value;

        let arrBuf = dataStr.split("\n");

        if (arrBuf.length == 0) {
            this.props.onPressClose();
            return;
        }

        // // handle possible extra lines at top due to copy paste from QTrade portfolio view
        // if (arrBuf[0].startsWith("Symb")) {
        //     arrBuf.splice(0, 1); // remove top line (its the header from portfolio view)
        // }
        // if (arrBuf[0].startsWith("Cash")) {
        //     arrBuf.splice(0, 1); // remove the top line (its the sub-header from portfolio view)
        // }

        let errors = [];

        // console.log("Curr data", dataStr.split("\n"));
        arrBuf.forEach((dataRow, idx) => {

            if (!dataRow || dataRow == "") {
                return;
            }

            let cells = dataRow.split(/\s+/);
            console.log('cells', cells);
            let market = cells[0];
            let symbol = cells[1];
            let quantity = cells[2];
            let averageCost = cells[3];

            let rowErrs = this.validateLine(market, symbol, quantity, averageCost);

            if (rowErrs.length > 0) {
                console.log(rowErrs);
                errors.push(idx+1);
            }
        });

        console.log("Errors found on lines: ", errors);

        if (errors.length == 0) {
            // create stock records, and send them back to main table view
            let newStockRecs = arrBuf.filter(line => (line && line.length > 0)).map((line) => {
                let cells = line.split(/\s+/);
                let market = cells[0];
                let symbol = cells[1];
                let quantity = cells[2];
                let avgCost = cells[3];
                
                quantity = parseInt(quantity.replace(",", ""));
                avgCost = parseFloat(avgCost.replace("$", ""));

                return new StockRecord(market, symbol, quantity, avgCost);
            });

            this.props.onNewStocksAdded(newStockRecs);
        } else {
            // errors found parsing data. Display line numbers containing errors
            this.setState({linesWithErrors: errors});
        }
    }

    render() {
        let {linesWithErrors} = this.state;
        return (
            <Dialog isOpen={this.props.isOpen} title={"Import Multi-Stock Data"} style={{minHeight: 300, minWidth: "60%"}}>
                <div className={Classes.DIALOG_BODY}>
                    <pre>Format: <i>Market Symbol Quantity AverageCost ...</i></pre>
                    
                    <TextArea
                        fill={true}
                        growVertically={true}
                        large={true}
                        style={{minHeight: 200}}
                        inputRef={elm => this.textAreaRef = elm}
                    />
                    {linesWithErrors.length > 0 && (
                        <p style={{color: "red"}}>Invalid format in lines: {linesWithErrors.map((l,idx) => (idx ? ', ': '') + l)}</p>
                    )}
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button onClick={this.props.onPressClose}>Close</Button>
                        <Button onClick={this.onPressAdd}>Add All</Button>
                    </div>
                </div>
            </Dialog>
        )
    }
}
