import { DateTime } from "luxon";

var isDate = function (date) {
    return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
};

const formatDate = (dateString) => {
    if (dateString && isDate(dateString)) {
        return DateTime.fromJSDate(new Date(dateString)).toLocaleString(
            DateTime.DATETIME_SHORT_WITH_SECONDS
        );
    }
    return "Unknown";
};

export default formatDate;
