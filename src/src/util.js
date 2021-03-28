import moment from "moment";
import {DAYS_OF_WEEK} from "./constants";

const format = 'hh:mm';
var prefix = moment().format('YYYY-MM-DD') + ' ';

let MARKET_CLOSED = moment(prefix + "18:00");
let MARKET_OPEN = moment(prefix + "08:00");

export const FormatDollarAmount = (dollarValue) => {
    if (dollarValue == null) return "";

    try {
        // format with at least 2 decimal places, and up to 4 if necessary
        let itmtStr = dollarValue.toFixed(4);
        let finalFmt = itmtStr.replace(/0{1,2}$/, '');
        return `$${finalFmt}`;
    } catch(e) {
        return dollarValue;
    }
}

export const FormatPercentAmount = (percentValue) => {
    if (percentValue == null) return "";

    return `${percentValue.toFixed(2)}%`;
}

export const IsMarketDefinitelyClosed = () => {

    let now = moment();
    let currHour = now.hours()
    let dayOfWeek = now.day()

    if (currHour > 18 || currHour < 8) {
        return true; // market is closed (we're between hours 6pm and 8am)
    } else if (dayOfWeek == DAYS_OF_WEEK.SATURDAY || dayOfWeek == DAYS_OF_WEEK.SUNDAY) {
        return true; // market is closed on weekend
    }

    return false;
}