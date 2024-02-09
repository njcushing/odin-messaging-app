const convertTimeMillisecondsToHours = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes - hours * 60;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds - minutes * 60 - hours * (60 * 60);
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    milliseconds =
        milliseconds -
        seconds * 1000 -
        minutes * (1000 * 60) -
        hours * (1000 * 60 * 60);
    milliseconds =
        milliseconds < 100
            ? milliseconds < 10
                ? `00${milliseconds}`
                : `0${milliseconds}`
            : milliseconds;

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        milliseconds: milliseconds,
    };
};

export default convertTimeMillisecondsToHours;
