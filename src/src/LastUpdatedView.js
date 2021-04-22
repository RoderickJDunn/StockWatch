import { Colors } from '@blueprintjs/core';
import moment from 'moment';
var momentDurationFormatSetup = require("moment-duration-format");

import React, { PureComponent, Component } from 'react'

export class LastUpdatedView extends PureComponent {

    constructor() {
        super();

        // let fakeStartDate = moment();
        // fakeStartDate.subtract(3, "hours");

        this.state = {
            // lastUpdatedTs: fakeStartDate,
            lastUpdatedTs: moment(),
            timeAgoString: "Just now",
        };
    }

    componentDidMount() {
        this.updatedTsTimer = setInterval(this.updateLastRefreshedText, 60000);
    }

    updateLastRefreshedText = () => {
        let {lastUpdatedTs} = this.state;
        let lastUpdatedCpy = moment(lastUpdatedTs);

        let timeAgo = moment().subtract(lastUpdatedCpy);

        this.setState({timeAgoString: moment.duration(timeAgo).format("d [days] h [hrs] m [min] s [seconds]", {
            largest: 1
        }) + " ago"});
    }

    render() {
        let {lastUpdatedTs, timeAgoString} = this.state;
        console.log('lastUpdatedTs', lastUpdatedTs);
        return (
            <div style={{position: "absolute", left: 0, right: 0, marginTop: 5}}>
                <div style={{display: "flex", justifyContent: "flex-end"}}>
                    <span style={{color: Colors.GRAY3, fontFamily: "Roboto Mono"}}>{`Updated ${lastUpdatedTs.format("h:mm:ss A")}  (${timeAgoString})`}</span>
                </div>
            </div>
        )
    }
}

export default LastUpdatedView;
