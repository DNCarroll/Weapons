var Calendar;
(function (Calendar) {
    function DateCell(date, calendar) {
        var div = "div".CreateElement(this.Format.Cell);
        div.Date = date;
        div.title = date.format("mmmm dd, yyyy");
        if (date != null) {
            var a = "a".CreateElement({ innerHTML: date.getDate(), href: "javascript:" });
            a.onclick = function () {
                if (calendar.SelectedDate.getMonth() == div.Date.getMonth() || !calendar.MonthChangeEvent) {
                    var previousDate = calendar.SelectedDateControl;
                    calendar.Set(div.Date);
                    if (calendar.SelectedDateControl && calendar.FormatCellMethod) {
                        var format = calendar.FormatCellMethod(div.Date);
                        div.className = format;
                    }
                    if (previousDate && calendar.FormatCellMethod) {
                        var format = calendar.FormatCellMethod(previousDate.Date);
                        previousDate.className = format;
                    }
                    calendar.SelectedDateControl = div;
                }
                else {
                    calendar.RequestedDate = div.Date;
                    calendar.MonthChanged = true;
                    calendar.MonthChangeEvent(div.Date, calendar.MonthChangedCallBack);
                }
            };
            div.appendChild(a);
            if (date.Equals(calendar.SelectedDate)) {
                calendar.SelectedDateControl = div;
            }
            if (calendar.FormatCellMethod) {
                var format = calendar.FormatCellMethod(div.Date);
                if (format) {
                    div.className = format;
                }
            }
        }
        return div;
    }
    Calendar.DateCell = DateCell;
    function HeaderCell(elementArrayOrString, cellProps) {
        var div = "div".CreateElement(this.Format.Cell);
        Thing.Merge(cellProps, div);
        if (elementArrayOrString && elementArrayOrString.substring) {
            div.innerHTML = elementArrayOrString;
        }
        else if (Is.Array(elementArrayOrString)) {
            for (var i = 0; i < elementArrayOrString.length; i++) {
                var sub = elementArrayOrString[i];
                if (Is.String(sub)) {
                    div.appendChild("span".CreateElement({ innerHTML: sub }));
                }
                else if (Is.Element(sub)) {
                    div.appendChild(sub);
                }
            }
        }
        else if (Is.Element(elementArrayOrString)) {
            div.appendChild(elementArrayOrString);
        }
        return div;
    }
    Calendar.HeaderCell = HeaderCell;
    Calendar.Format = {
        Table: {
            display: "table",
            borderCollapse: "collapse",
            listStyleType: "none",
            margin: "0px 0px",
            padding: "0px 0px",
            width: "100%"
        },
        Row: {
            display: "table-row",
            listStyle: "none"
        },
        Cell: {
            display: "table-cell",
            textAlign: "center"
        }
    };
    function MonthItem(monthName, index, onclickEvent) {
        var li = "li".CreateElement();
        var div = "div".CreateElement();
        li.appendChild(div);
        var a = "a".CreateElement({ innerHTML: monthName, href: "javascript:" });
        div.appendChild(a);
        a.onclick = function () {
            onclickEvent(index);
        };
        return li;
    }
    Calendar.MonthItem = MonthItem;
    function YearItem(year, onclickEvent) {
        var li = "li".CreateElement();
        var div = "div".CreateElement();
        li.appendChild(div);
        var a = "a".CreateElement({ innerHTML: year, href: "javascript:" });
        div.appendChild(a);
        a.onclick = function () {
            onclickEvent(year);
        };
        return li;
    }
    Calendar.YearItem = YearItem;
    function Create(element, selectedDateChanged, formatCellMethod, monthChangeEvent, headerClass, rowsClass, dayOfWeekClass, dateRowClass, monthClass, yearClass, navigateClass, defaultDateClass, monthPopupClass, yearPopupClass, calendarBuiltEvent) {
        if (!element.SelectedDate) {
            element.SelectedDate = new Date().SmallDate();
        }
        element.MonthClass = monthClass;
        element.YearClass = yearClass;
        element.NavigateClass = navigateClass;
        element.DefaultDateClass = defaultDateClass;
        element.MonthChangeEvent = monthChangeEvent;
        element.HeaderClass = headerClass;
        element.DateRowClass = dateRowClass;
        element.RowsClass = rowsClass;
        element.DayOfWeekClass = dayOfWeekClass;
        element.RequestedDate = new Date();
        element.SelectedDateChanged = selectedDateChanged;
        element.FormatCellMethod = formatCellMethod;
        element.MonthPopupClass = monthPopupClass;
        element.YearPopupClass = yearPopupClass;
        element.SelectedDateControl = null;
        element.PreviousDateControl = null;
        element.CalendarBuiltEvent = calendarBuiltEvent;
        element.MonthChanged = false;
        element.MonthChangedCallBack = function (allow) {
            if (allow) {
                //need to reset formatting?
                element.Set(element.RequestedDate);
                element.MonthChanged = false;
            }
        };
        element.Set = function (selectedDate) {
            var rebuild = selectedDate.getMonth() != element.SelectedDate.getMonth() ||
                selectedDate.getFullYear() != element.SelectedDate.getFullYear();
            element.SelectedDate = selectedDate;
            if (rebuild) {
                element.Build();
            }
            else {
                var selectedDateControl = element.First(function (obj) {
                    return obj.tagName.toLowerCase() == "div" && obj.Date && obj.Date.Equals(selectedDate);
                });
                if (selectedDateControl) {
                    element.SelectedDateControl = selectedDateControl;
                }
            }
            if (element.SelectedDateChanged) {
                element.SelectedDateChanged(element.SelectedDate);
            }
        };
        element.MonthNameClicked = function (month) {
            if (month != element.SelectedDate.getMonth()) {
                var requestmonth = month;
                var requestyear = element.SelectedDate.getFullYear();
                var testDate = new Date(requestyear, requestmonth, 1);
                element.RequestedDate = new Date(requestyear, requestmonth, element.SelectedDate.getDate());
                while (element.RequestedDate.getMonth() > testDate) {
                    element.RequestedDate = element.RequestedDate.AddDays(-1);
                }
                if (element.MonthChangeEvent) {
                    element.MonthChanged = true;
                    element.MonthChangeEvent(element.RequestedDate, element.MonthChangedCallBack);
                }
                else {
                    element.Set(element.RequestedDate);
                }
            }
            Dialog.Hide("workoutMonthpopup".Element());
        };
        element.YearNameClicked = function (year) {
            if (year != element.SelectedDate.getFullYear()) {
                var requestyear = year;
                var requestmonth = element.SelectedDate.getMonth();
                element.RequestedDate = new Date(requestyear, requestmonth, element.SelectedDate.getDate());
                while (element.RequestedDate.getMonth() > element.SelectedDate.getMonth()) {
                    element.RequestedDate = element.RequestedDate.AddDays(-1);
                }
                if (element.MonthChangeEvent) {
                    element.MonthChanged = true;
                    element.MonthChangeEvent(element.RequestedDate, element.MonthChangedCallBack);
                }
                else {
                    element.Set(element.RequestedDate);
                }
            }
            Dialog.Hide("workoutYearpopup".Element());
        };
        element.Build = function () {
            element.Clear();
            var header = "ul".CreateElement(Calendar.Format.Table);
            if (element.HeaderClass) {
                header.className = element.HeaderClass;
            }
            var left = "a".CreateElement({ innerHTML: "&lt;", href: "javascript:" });
            left.onclick = function () {
                var requestmonth = element.SelectedDate.getMonth();
                var requestyear = element.SelectedDate.getFullYear();
                if (requestmonth == 0) {
                    requestyear--;
                    requestmonth = 11;
                }
                else {
                    requestmonth--;
                }
                element.RequestedDate = new Date(requestyear, requestmonth, element.SelectedDate.getDate());
                while (element.RequestedDate.getMonth() == element.SelectedDate.getMonth()) {
                    element.RequestedDate = element.RequestedDate.AddDays(-1);
                }
                if (element.MonthChangeEvent) {
                    element.MonthChanged = true;
                    element.MonthChangeEvent(element.RequestedDate, element.MonthChangedCallBack);
                }
                else {
                    element.Set(element.RequestedDate);
                }
            };
            var right = "a".CreateElement({ innerHTML: "&gt;", href: "javascript:" });
            right.onclick = function () {
                var requestmonth = element.SelectedDate.getMonth();
                var requestyear = element.SelectedDate.getFullYear();
                if (requestmonth == 11) {
                    requestmonth = 0;
                    requestyear++;
                }
                else {
                    requestmonth++;
                }
                element.RequestedDate = new Date(requestyear, requestmonth, element.SelectedDate.getDate());
                while (element.RequestedDate.getMonth() > element.SelectedDate.getMonth() + 1) {
                    element.RequestedDate = element.RequestedDate.AddDays(-1);
                }
                if (element.MonthChangeEvent) {
                    element.MonthChanged = true;
                    element.MonthChangeEvent(element.RequestedDate, element.MonthChangedCallBack);
                }
                else {
                    element.Set(element.RequestedDate);
                }
            };
            if (element.NavigateClass) {
                left.className = element.NavigateClass;
                right.className = element.NavigateClass;
            }
            var month = "a".CreateElement({ innerHTML: element.SelectedDate.MonthName(), marginRight: ".25em", href: "javascript:" });
            month.onclick = function () {
                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var ulMonths = "ul".CreateElement({ id: "workoutMonthpopup", Target: month });
                if (element.MonthPopupClass) {
                    ulMonths.className = element.MonthPopupClass;
                }
                else {
                    ulMonths.Set(Calendar.Format.Table);
                }
                for (var i = 0; i < months.length; i++) {
                    ulMonths.appendChild(Calendar.MonthItem(months[i], i, element.MonthNameClicked));
                }
                Dialog.Popup(ulMonths);
            };
            var year = "a".CreateElement({ innerHTML: element.SelectedDate.getFullYear(), marginLeft: ".25em", href: "javascript:" });
            year.onclick = function () {
                //dont move beyond current year
                //this needs to be dynamic
                //if now == current year do one thing else do something else
                var years = new Array();
                var currentyear = (new Date()).getFullYear();
                var selectedYear = element.SelectedDate.getFullYear();
                if (selectedYear >= currentyear) {
                    years.push(currentyear - 4);
                    years.push(currentyear - 3);
                    years.push(currentyear - 2);
                    years.push(currentyear - 1);
                    years.push(currentyear - 0);
                }
                else {
                    var diff = currentyear - selectedYear;
                    if (diff > 1) {
                        years.push(selectedYear - 2);
                        years.push(selectedYear - 1);
                        years.push(selectedYear);
                        years.push(selectedYear + 1);
                        years.push(selectedYear + 2);
                    }
                    else {
                        years.push(selectedYear - 3);
                        years.push(selectedYear - 2);
                        years.push(selectedYear - 1);
                        years.push(selectedYear);
                        years.push(selectedYear + 1);
                    }
                }
                var ulYears = "ul".CreateElement({ id: "workoutYearpopup", Target: year });
                if (element.YearPopupClass) {
                    ulYears.className = element.YearPopupClass;
                }
                else {
                    ulYears.Set(Calendar.Format.Table);
                }
                years.forEach(function (y) { return ulYears.appendChild(Calendar.YearItem(y, element.YearNameClicked)); });
                Dialog.Popup(ulYears);
            };
            if (element.MonthClass) {
                month.className = element.MonthClass;
            }
            if (element.YearClass) {
                year.className = element.YearClass;
            }
            var headerRow = "li".CreateElement(Calendar.Format.Row);
            header.appendChild(headerRow);
            headerRow.AddRange(Calendar.HeaderCell(left), Calendar.HeaderCell([month, year]), Calendar.HeaderCell(right));
            element.appendChild(header);
            var daysContainer = "ul".CreateElement(Calendar.Format.Table);
            if (element.RowsClass) {
                daysContainer.className = element.RowsClass;
            }
            element.appendChild(daysContainer);
            var pos = 0;
            var daysInMonth = element.SelectedDate.DaysInMonth();
            var startDate = new Date(element.SelectedDate.getFullYear(), element.SelectedDate.getMonth(), 1);
            var week = "li".CreateElement(Calendar.Format.Row);
            daysContainer.appendChild(week);
            if (element.DayOfWeekClass) {
                week.className = element.DayOfWeekClass;
            }
            week.AddRange(Calendar.HeaderCell("Su"), Calendar.HeaderCell("M"), Calendar.HeaderCell("T"), Calendar.HeaderCell("W"), Calendar.HeaderCell("Th"), Calendar.HeaderCell("F"), Calendar.HeaderCell("Sa"));
            week = "li".CreateElement(Calendar.Format.Row);
            var dow = startDate.getDay();
            if (dow != 0) {
                startDate = startDate.AddDays(dow * -1);
            }
            var breakCalendar = false;
            while (!breakCalendar) {
                if (pos == 0) {
                    if (element.DateRowClass) {
                        week.className = element.DateRowClass;
                    }
                    daysContainer.appendChild(week);
                }
                var dow = startDate.getDay();
                if (dow == 6 && ((startDate.getMonth() > element.SelectedDate.getMonth() || startDate.getFullYear() > element.SelectedDate.getFullYear()) || startDate.getDate() == daysInMonth)) {
                    breakCalendar = true;
                }
                if (pos == dow) {
                    week.appendChild(Calendar.DateCell(startDate, element));
                    startDate = startDate.AddDays(1);
                }
                pos++;
                if (pos == 7) {
                    week = "li".CreateElement(Calendar.Format.Row);
                    pos = 0;
                }
            }
            if (element.CalendarBuiltEvent) {
                element.CalendarBuiltEvent();
            }
        };
        element.Build();
        if (element.SelectedDateChanged) {
            element.SelectedDateChanged(element.SelectedDate);
        }
    }
    Calendar.Create = Create;
})(Calendar || (Calendar = {}));
//# sourceMappingURL=Calendar.js.map