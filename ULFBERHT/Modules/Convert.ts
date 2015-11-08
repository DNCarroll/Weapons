module Convert {
    export function EmToFloat(value) {
        if (value && value.substring && value.indexOf("em")) {
            value = value.replace("em", "");
            value = parseFloat(value);
        };
        return value;
    }
    export function EmValueToPixelValue(value: any) {
        if (value)
        {
            value = EmToFloat(value) * 16;
            return value;
        }
        return 0;
    }
    var styleProperties = new Array<{ prop: string; toLower: string }>();
    export function ToStyleProperty(name: string): string {
        if (styleProperties.length == 0) {
            for (var prop in document.body.style) {
                styleProperties.Add({ prop: prop, toLower: prop.toLowerCase() });
            }
        }
        var temp = name.toLowerCase();
        var found = styleProperties.First(o=> o.toLower == temp);
        return found ? found.prop : null;
    }
}