exports.getActualDate = () => {
    var today = new Date();
    
    var minutes = today.getMinutes()
    if (minutes.length === 1) {
        minutes = '0' + minutes
    }
    var hours = today.getHours()
    if (hours.length === 1) {
        hours = '0' + hours
    }
    var seconds = today.getSeconds()
    if (seconds.length === 1) {
        seconds = '0' + seconds
    }

    var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    var time = hours + ":" + minutes + ":" + seconds;
    var dateTime = date + ' ' + time;

    return dateTime
}