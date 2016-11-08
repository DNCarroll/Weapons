Array.prototype.Return = function (func) {
    switch (this.length) {
        case 0:
            return func();
            ;
        case 1:
            return func(this[0]);
        case 2:
            return func(this[0], this[1]);
        case 3:
            return func(this[0], this[1], this[2]);
        case 4:
            return func(this[0], this[1], this[2], this[3]);
        case 5:
            return func(this[0], this[1], this[2], this[3], this[4]);
        case 6:
            return func(this[0], this[1], this[2], this[3], this[4], this[5]);
        case 7:
            return func(this[0], this[1], this[2], this[3], this[4], this[5], this[6]);
        default:
            return null;
    }
};
Array.prototype.Select = function (keySelector) {
    var ret = new Array();
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        var newObj = keySelector(obj);
        ret.push(newObj);
    }
    return ret;
};
Array.prototype.Ascend = function (keySelector) {
    return this.sort(function (a, b) {
        return keySelector(a) < keySelector(b) ? -1 :
            keySelector(a) > keySelector(b) ? 1 : 0;
    });
};
Array.prototype.Descend = function (keySelector) {
    return this.sort(function (a, b) {
        return keySelector(a) < keySelector(b) ? 1 :
            keySelector(a) > keySelector(b) ? -1 : 0;
    });
};
Array.prototype.First = function (func) {
    if (func) {
        for (var i = 0; i < this.length; i++) {
            var currentObject = this[i];
            var match = func(currentObject);
            if (match) {
                return this[i];
            }
        }
    }
    else if (this.length > 0) {
        return this[0];
    }
    return null;
};
Array.prototype.Last = function (func) {
    if (func) {
        if (this.length > 0) {
            var pos = this.length - 1;
            while (pos > 0) {
                var currentObject = this[pos];
                var match = func(currentObject);
                if (match) {
                    return this[pos];
                }
                pos--;
            }
        }
    }
    else {
        if (this.length > 0) {
            return this[this.length - 1];
        }
    }
    return null;
};
Array.prototype.Remove = function (func) {
    if (func) {
        if (this.length > 0) {
            var pos = this.length - 1;
            while (pos > 0) {
                var match = func(this[pos]);
                if (match) {
                    this.splice(pos, 1);
                }
                pos--;
            }
        }
    }
    return this;
};
Array.prototype.Where = function (func) {
    var matches = new Array();
    for (var i = 0; i < this.length; i++) {
        var currentObject = this[i];
        var match = func(currentObject);
        if (match) {
            matches.push(currentObject);
        }
    }
    return matches;
};
Array.prototype.Take = function (count) {
    var ret = new Array();
    for (var i = 0; i < count; i++) {
        if (this.length > i) {
            ret.push(this[i]);
        }
        else {
            break;
        }
    }
    return ret;
};
Array.prototype.Add = function (objectOrObjects) {
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.IndexOf = function (funcOrObj) {
    var i = -1;
    var isFunction = Is.Function(funcOrObj);
    if (isFunction) {
        for (var i = 0; i < this.length; i++) {
            if (funcOrObj(this[i])) {
                return i;
            }
        }
    }
    else {
        for (var i = 0; i < this.length; i++) {
            var match = true;
            for (var prop in funcOrObj) {
                if (funcOrObj[prop] != this[i][prop]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return i;
            }
        }
    }
    return i;
};
Array.prototype.Insert = function (obj, position) {
    if (position == undefined) {
        position = 0;
    }
    if (position > this.length) {
        position = this.length;
    }
    this.splice(position, 0, obj);
};
Array.prototype.ToArray = function (property) {
    var ret = new Array();
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (item[property]) {
            ret.push(item[property]);
        }
    }
    return ret;
};
//# sourceMappingURL=Array.js.map