module Thing {   
    export function Merge(object, into) : any {
        for (var prop in object) {
            var value = object[prop];
            if (value)
            {
                into[prop] = object[prop];
            }
        }        
        return into;
    }
    export function Clone(object) {
        var newobject = {
        };
        for (var prop in object) {
            newobject[prop] = object[prop];
        }
        return newobject;
    }
    export function ToArray(object, nameColumn?: string, valueColumn?: string): any[] {
        var ret = new Array();
        if (!nameColumn) {
            nameColumn = "Name";
        }
        if (!valueColumn) {
            valueColumn = "Value";
        }
        for (var prop in object) {
            var localObj = {};
            localObj[nameColumn] = prop;
            localObj[valueColumn] = object[prop];
            ret.push(localObj);
        }
        return ret;
    }
    export function Concat(object, properties: string[]): string {
        var ret = "";        
        for (var i = 0; i < properties.length; i++) {
            if (Is.Property(properties[i], object)) {
                var value = object[properties[i]];
                if (value) {
                    ret += value.toString();
                }
            }
        }
        return ret;
    }
    export function GetValueIn(object, forPropertyName, defaultValue?) {
        if (object[forPropertyName])
        {
            return object[forPropertyName];
        }
        else if (defaultValue)
        {
            return defaultValue;
        }
        return null;
    }
}

module What {
    export module Is {
        export function EnumName(inObject, forValue): string {
            for (var prop in inObject) {
                if (inObject[prop] == forValue) {
                    return <string>prop;
                }                
            }
            return null;
        }
        export function EnumValue(inObject, forName: string): any {
            forName = forName.toLowerCase();
            for (var prop in inObject) {
                if (prop.toLowerCase() == forName) {
                    return inObject[prop];
                }
            }
            return null;
        }
    }
}