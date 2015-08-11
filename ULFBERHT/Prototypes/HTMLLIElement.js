HTMLLIElement.prototype.Rebind = function () {
    var row = this;
    Binding.DataContainer.DataBind(row.DataContainer, row, row.DataObject);
    return row;
};
//# sourceMappingURL=HTMLLIElement.js.map