var DataObject = (function () {
    function DataObject(raw) {
        //set the propertyvalues of this object
        for (var prop in raw) {
            this[prop] = raw[prop];
        }
    }
    return DataObject;
}());
//# sourceMappingURL=DataObject.js.map