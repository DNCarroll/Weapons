module KeyPress {
    export var ADCONTROL_ZERO: number = 48;
    export var ADCONTROL_ONE: number = 49;
    export var ADCONTROL_TWO: number = 50;
    export var ADCONTROL_THREE: number = 51;
    export var ADCONTROL_FOUR: number = 52;
    export var ADCONTROL_FIVE: number = 53;
    export var ADCONTROL_SIX: number = 54;
    export var ADCONTROL_SEVEN: number = 55;
    export var ADCONTROL_EIGHT: number = 56;
    export var ADCONTROL_NINE: number = 57;

    export function GetZeroLengthString(value: number): string {
        switch (value) {
            case 1:
            case 0:
                return String(value);
            default:
                return "0" + String(value) + "/";
        }
    }

    export function GetOneLengthString(value: number, currentValue: number): string {
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

    export function GetThreeLengthString(value: number, currentValue: number): string {
        if (value > 3) {
            return currentValue + "0" + String(value) + "/";
        }
        else {
            return currentValue + String(value);
        }
    }

    export function GetFourLengthString(value: number, currentValue: number, previousValue: number): string {
        if (previousValue == 3 &&
                value > 1) {
            return String(currentValue).substring(0, String(currentValue).length - 1) + "03/" + String(value);
        }
        else {
            return currentValue + value + "/";
        }
    }

    export function NoBlanks(e: any, canSpecialCharacter?: boolean): boolean {
        var ret = true;
        var KeyID = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            KeyID = window.event.keyCode;
            sender = window.event.srcElement;
            shiftKey = window.event.shiftKey;
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

    export function ShortDate(e: any): boolean {
        var KeyID = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            KeyID = window.event.keyCode;
            sender = window.event.srcElement;
            shiftKey = window.event.shiftKey;
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
                    sender.value = KeyPress.GetZeroLengthString(value); break;
                case 1:
                    ret = false;
                    sender.value = KeyPress.GetOneLengthString(value, sender.value); break;
                case 3:
                    ret = false;
                    sender.value = KeyPress.GetThreeLengthString(value, sender.value); break;
                case 4:
                    ret = false;
                    sender.value = KeyPress.GetFourLengthString(value, sender.value, sender.PreviousValue); break;
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
                    var element = <HTMLInputElement>elements[i];
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

    export function Number(e: any, allowDecimals?: boolean, useTabForward?: boolean): boolean {
        var key = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            key = window.event.keyCode;
            sender = window.event.srcElement;
            shiftKey = window.event.shiftKey;
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
                    var element = <HTMLInputElement>elements[i];
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
                else if (document.getSelection) // FireFox
                {
                    txt = document.getSelection().toString();
                }
                else if (document.selection)  // IE 6/7
                {
                    txt = document.selection.createRange().text;
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
                ret = false
            }
        }
        if (event) {
            event.returnValue = ret;
        }
        return ret;
    }
}