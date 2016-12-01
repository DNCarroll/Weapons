var KeyPress;
(function (KeyPress) {
    KeyPress.ADCONTROL_ZERO = 48;
    KeyPress.ADCONTROL_ONE = 49;
    KeyPress.ADCONTROL_TWO = 50;
    KeyPress.ADCONTROL_THREE = 51;
    KeyPress.ADCONTROL_FOUR = 52;
    KeyPress.ADCONTROL_FIVE = 53;
    KeyPress.ADCONTROL_SIX = 54;
    KeyPress.ADCONTROL_SEVEN = 55;
    KeyPress.ADCONTROL_EIGHT = 56;
    KeyPress.ADCONTROL_NINE = 57;
    function GetZeroLengthString(value) {
        switch (value) {
            case 1:
            case 0:
                return String(value);
            default:
                return "0" + String(value) + "/";
        }
    }
    KeyPress.GetZeroLengthString = GetZeroLengthString;
    function GetOneLengthString(value, currentValue) {
        if (currentValue == 0) {
            return "0" + String(value) + "/";
        }
        else {
            if (value > 3) {
                return "01/0" + String(value) + "/";
            }
            else if (value == 3) {
                return "01/3";
            }
            else {
                return "1" + String(value) + "/";
            }
        }
    }
    KeyPress.GetOneLengthString = GetOneLengthString;
    function GetThreeLengthString(value, currentValue) {
        if (value > 3) {
            return currentValue + "0" + String(value) + "/";
        }
        else {
            return currentValue + String(value);
        }
    }
    KeyPress.GetThreeLengthString = GetThreeLengthString;
    function GetFourLengthString(value, currentValue, previousValue) {
        if (previousValue == 3 &&
            value > 1) {
            return String(currentValue).substring(0, String(currentValue).length - 1) + "03/" + String(value);
        }
        else {
            return currentValue + value + "/";
        }
    }
    KeyPress.GetFourLengthString = GetFourLengthString;
    function NoBlanks(e, canSpecialCharacter) {
        var ret = true;
        var KeyID = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            KeyID = e.keyCode;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
            e = window.event;
        }
        else if (e) {
            KeyID = e.which;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        var keyChar = String.fromCharCode(KeyID);
        if (!canSpecialCharacter) {
            var regex = /[a-z0-9]/gi;
            var test = regex.test(keyChar);
            if (!test) {
                ret = false;
                e.cancel = true;
            }
        }
        else if (keyChar == " ") {
            ret = false;
            e.cancel = true;
        }
        if (window.event) {
            e.returnValue = ret;
        }
        return ret;
    }
    KeyPress.NoBlanks = NoBlanks;
    function ShortDate(e) {
        var KeyID = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            KeyID = e.keyCode;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        else if (e) {
            KeyID = e.which;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        //hook up events to it
        if (!sender.onclick) {
            sender.onclick = function (e) {
                sender.focus();
                sender.select();
            };
        }
        if (!sender.onfocus) {
            sender.onfocus = function () {
                sender.select();
            };
        }
        if (!sender.onblur) {
            sender.onblur = function () {
                if (sender.value.length == 0)
                    return;
                if (sender.value.length == 8) {
                    var lastTwo = sender.value.substring(6, 8);
                    if (lastTwo.indexOf("9") == 0) {
                        sender.value = sender.value.substring(0, 6) + "19" + lastTwo;
                    }
                    else {
                        sender.value = sender.value.substring(0, 6) + "20" + lastTwo;
                    }
                }
                if (!Is.ValidDate(sender.value)) {
                    alert("Please enter a valid date.");
                    sender.focus();
                }
            };
        }
        var keyChar = String.fromCharCode(KeyID);
        var ret = true;
        var length = sender.value.length;
        if (KeyID >= KeyPress.ADCONTROL_ZERO && KeyID <= KeyPress.ADCONTROL_NINE) {
            if (sender.value.length == 10) {
                sender.value = "";
            }
            var value = parseInt(keyChar);
            switch (length) {
                case 0:
                    ret = false;
                    sender.value = KeyPress.GetZeroLengthString(value);
                    break;
                case 1:
                    ret = false;
                    sender.value = KeyPress.GetOneLengthString(value, sender.value);
                    break;
                case 3:
                    ret = false;
                    sender.value = KeyPress.GetThreeLengthString(value, sender.value);
                    break;
                case 4:
                    ret = false;
                    sender.value = KeyPress.GetFourLengthString(value, sender.value, sender.PreviousValue);
                    break;
                default:
                    break;
            }
            sender.PreviousValue = value;
            if (event) {
                event.returnValue = ret;
            }
            return ret;
        }
        else if (KeyID == 13) {
            if (sender.tabIndex) {
                var ti = parseInt(sender.tabIndex) + 1;
                var elements = document.getElementsByTagName('*');
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element.tabIndex == ti) {
                        element.focus();
                        if (element.type && element.type == "text") {
                            element.select();
                        }
                        break;
                    }
                }
            }
        }
        else {
            return false;
        }
    }
    KeyPress.ShortDate = ShortDate;
    function Number(e, allowDecimals, useTabForward) {
        var key = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            key = e.keyCode;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        else if (e) {
            key = e.which;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        var keyChar = String.fromCharCode(key);
        var ret = true;
        var length = sender.value.length;
        var containsDecimal = sender.value.indexOf(".") > -1;
        if (key == 13) {
            if (sender.tabIndex && useTabForward) {
                var ti = parseInt(sender.tabIndex) + 1;
                var elements = document.getElementsByTagName('*');
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element.tabIndex == ti) {
                        element.focus();
                        if (element.type && element.type == "text") {
                            element.select();
                        }
                        break;
                    }
                }
            }
        }
        else if (key >= 48 && key <= 57) {
            ret = true;
        }
        else if (keyChar == "." && allowDecimals) {
            if (sender.value.indexOf(".") > -1) {
                var txt = '';
                if (window.getSelection) {
                    txt = window.getSelection().toString();
                }
                else if (document.getSelection) {
                    txt = document.getSelection().toString();
                }
                if (txt.length != sender.value.length) {
                    ret = false;
                }
            }
        }
        else if (keyChar == "." && !allowDecimals) {
            ret = false;
        }
        else {
            if (keyChar == "-") {
                if (sender.value != "") {
                    ret = false;
                }
            }
            else {
                ret = false;
            }
        }
        if (event) {
            event.returnValue = ret;
        }
        return ret;
    }
    KeyPress.Number = Number;
})(KeyPress || (KeyPress = {}));
//# sourceMappingURL=KeyPress.js.map