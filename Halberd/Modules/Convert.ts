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
}