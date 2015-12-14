var ActionEvent = (function () {
    function ActionEvent(actionType, obj, field, value) {
        this.Cancel = false;
        this.ActionType = actionType;
        this.Object = obj;
        this.Field = field;
        this.Value = value;
    }
    return ActionEvent;
})();
