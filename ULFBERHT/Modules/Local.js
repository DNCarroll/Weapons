var Local;
(function (Local) {
    function CanStore() {
        try {
            return localStorage ? true : false;
        }
        catch (e) {
            return false;
        }
    }
    Local.CanStore = CanStore;
    function Remove(key) {
        if (Local.CanStore()) {
            localStorage.removeItem(key);
        }
    }
    Local.Remove = Remove;
    function Clear() {
        if (Local.CanStore()) {
            localStorage.clear();
        }
    }
    Local.Clear = Clear;
    function Save(key, obj) {
        if (Local.CanStore()) {
            var json = JSON.stringify(obj);
            localStorage.setItem(key, json);
        }
    }
    Local.Save = Save;
    function Get(key, defaultObject) {
        try {
            var temp = null;
            if (!temp && Local.CanStore()) {
                if (Is.Property(key, localStorage)) {
                    temp = localStorage.getItem(key);
                }
                if (Is.String(temp)) {
                    temp = JSON.parse(temp);
                    Ajax.ConvertProperties(temp);
                    return temp;
                }
            }
            return temp;
        }
        catch (e) {
            throw e;
        }
    }
    Local.Get = Get;
})(Local || (Local = {}));
