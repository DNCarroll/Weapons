//reviewed and updated NC - 2015-04-02
interface Date {
    format(mask: string, utc?: boolean): string;
    ShortDate(): any;
    SmallDate(): Date;
    Equals(date: Date): boolean;
    AddDays(days: number): Date;
    Add(years?:number, months?:number, days?:number, hours?:number, minutes?: number, seconds?:number): Date;
    DaysInMonth(): number;
    MonthName(): string;
    DaysDiff(subtractDate: Date): number;
    MinuteDiff(subtractDate: Date): number;
    Clone(): Date;
    DayOfWeek(): string;
    Date(): number;
    Month(): number;
    Year(): number;
}
Date.prototype.Year = function (): number {
    return this.getFullYear();
}
Date.prototype.Month = function (): number {
    return this.getMonth() + 1;
}
Date.prototype.Date = function (): number {
    return this.getDate();
}
Date.prototype.DayOfWeek = function (): string {
    var day = this.getDay();
    switch (day) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
        default:
            return "Saturday";
    }
}
Date.prototype.Clone = function (): Date {
    return this.AddDays(0);
};
Date.prototype.format = function (mask: string, utc?: boolean) {
    return Formatters.DateTime.Format(this, mask, utc);
};
Date.prototype.ShortDate = function () {
    return this.format("mm/dd/yyyy");
};
Date.prototype.SmallDate = function (): Date {
    var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0, 0);
    return now;
};
Date.prototype.Equals = function (date) {
    var ret = this.getMonth() == date.getMonth() && this.getFullYear() == date.getFullYear() && this.getDate() == date.getDate();
    return ret;
};
Date.prototype.AddDays = function (days) {
    return this.Add(0, 0, days);
};
Date.prototype.Add = function (years?: number, months?: number, days?: number, hours?: number, minutes?: number, seconds?: number): Date {

    years = years ? years : 0;
    months = months ? months : 0;
    days = days ? days : 0;
    hours = hours ? hours : 0;
    minutes = minutes ? minutes : 0;
    seconds = seconds ? seconds : 0;
    var y = this.getFullYear() + years;
    var m = this.getMonth() + months;
    var d = this.getDate() + days;
    var h = this.getHours() + hours;
    var mm = this.getMinutes() + minutes;
    var s = this.getSeconds() + seconds;
    var ms = this.getMilliseconds();

    return new Date(y, m, d, h, mm, s, ms);
};
Date.prototype.DaysInMonth = function () {
    return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
};
Date.prototype.MonthName = function () {
    switch (this.getMonth()) {
        case 0:
            return "January";
        case 1:
            return "February";
        case 2:
            return "March";
        case 3:
            return "April";
        case 4:
            return "May";
        case 5:
            return "June";
        case 6:
            return "July";
        case 7:
            return "August";
        case 8:
            return "September";
        case 9:
            return "October";
        case 10:
            return "November";
        case 11:
            return "December";
        default:
            return "Unknown";
    }
};
Date.prototype.DaysDiff = function (subtractDate) {
    var diff = Math.abs(<any>this - <any>subtractDate);
    return diff / 1000 / 60 / 60 / 24;
};
Date.prototype.MinuteDiff = function (subtractDate) {
    var diff = Math.abs(<any>this - <any>subtractDate);
    return diff / 1000 / 60 / 60;
};