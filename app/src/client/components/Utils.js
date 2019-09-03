function __getTime(string)
{
    let ret = string.split(' ');
    let date = ret[0].split('-')
    let time = ret[1].split(':');
    ret = {
        year: date[2],
        month: date[1],
        day: date[0],
        hour: time[0],
        minute: time[1]
    }

    return ret;
}

function __timeDifference(started, ends)
{
    let difference = {
        years: ends.year - started.year,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0
    }

    difference.months = ends.month - started.month;
    if (difference.months < 0)
    {
        difference.months += 12;
        difference.years -= 1;
    }
    difference.days = ends.day - started.day;
    if (difference.days < 0)
    {
        difference.days += 30;
        difference.months -= 1;
    }
    difference.days = ends.day - started.day;
    if (difference.days < 0)
    {
        difference.days += 30;
        difference.months -= 1;
    }
    difference.hours = ends.hour - started.hour;
    if (difference.hours < 0)
    {
        difference.hours += 24
        difference.days -= 1;
    }
    difference.minutes = ends.minute - started.minute;
    if (difference.hours < 0)
    {
        difference.minutes += 60
        difference.hours -= 1;
    }

    difference.string = difference.years === 0 ? "" : `${difference.years} years, `;
    difference.string += difference.months === 0 ? "" : `${difference.months} months, `;
    difference.string += difference.days === 0 ? "" : `${difference.days} days, `;
    difference.string += difference.hours === 0 ? "" : `${difference.hours} hours, `;
    difference.string += `${difference.minutes} minutes`;

    return difference;
}

export { __getTime, __timeDifference};