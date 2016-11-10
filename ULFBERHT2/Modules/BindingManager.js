var BindingManager;
(function (BindingManager) {
    var Binders = new Array();
    function Clear() {
        Binders.forEach(function (b) { return b.Dispose(); });
    }
    BindingManager.Clear = Clear;
    function Add(binder) {
        Binders.Add(binder);
    }
    BindingManager.Add = Add;
    function CurrentParameters() {
        return HistoryManager.CurrentRoute().Parameters;
    }
    BindingManager.CurrentParameters = CurrentParameters;
})(BindingManager || (BindingManager = {}));
//# sourceMappingURL=BindingManager.js.map