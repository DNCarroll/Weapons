var Convert;
(function (Convert) {
    function EmToFloat(value) {
        if (value && value.substring && value.indexOf("em")) {
            value = value.replace("em", "");
            value = parseFloat(value);
        }
        ;
        return value;
    }
    Convert.EmToFloat = EmToFloat;
    function EmValueToPixelValue(value) {
        if (value) {
            value = EmToFloat(value) * 16;
            return value;
        }
        return 0;
    }
    Convert.EmValueToPixelValue = EmValueToPixelValue;
})(Convert || (Convert = {}));
