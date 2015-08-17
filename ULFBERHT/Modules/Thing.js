var Thing;
(function (Thing) {
    function Merge(object, into) {
        for (var prop in object) {
            var value = object[prop];
            if (value) {
                into[prop] = object[prop];
            }
        }
        return into;
    }
    Thing.Merge = Merge;
    function Clone(object) {
        var newobject = {};
        for (var prop in object) {
            newobject[prop] = object[prop];
        }
        return newobject;
    }
    Thing.Clone = Clone;
    function ToArray(object, nameColumn, valueColumn) {
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
    Thing.ToArray = ToArray;
    function Concat(object, properties) {
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
    Thing.Concat = Concat;
    function GetValueIn(object, forPropertyName, defaultValue) {
        if (object[forPropertyName]) {
            return object[forPropertyName];
        }
        else if (defaultValue) {
            return defaultValue;
        }
        return null;
    }
    Thing.GetValueIn = GetValueIn;
})(Thing || (Thing = {}));
var What;
(function (What) {
    var Is;
    (function (Is) {
        function EnumName(inObject, forValue) {
            for (var prop in inObject) {
                if (inObject[prop] == forValue) {
                    return prop;
                }
            }
            return null;
        }
        Is.EnumName = EnumName;
        function EnumValue(inObject, forName) {
            forName = forName.toLowerCase();
            for (var prop in inObject) {
                if (prop.toLowerCase() == forName) {
                    return inObject[prop];
                }
            }
            return null;
        }
        Is.EnumValue = EnumValue;
    })(Is = What.Is || (What.Is = {}));
})(What || (What = {}));
