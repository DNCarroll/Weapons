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
    var styleProperties = new Array();
    function ToStyleProperty(name) {
        if (styleProperties.length == 0) {
            for (var prop in document.body.style) {
                styleProperties.Add({ prop: prop, toLower: prop.toLowerCase() });
            }
        }
        var temp = name.toLowerCase();
        var found = styleProperties.First(function (o) { return o.toLower == temp; });
        return found ? found.prop : null;
    }
    Convert.ToStyleProperty = ToStyleProperty;
})(Convert || (Convert = {}));
