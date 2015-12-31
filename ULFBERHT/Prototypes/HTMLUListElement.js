HTMLUListElement.prototype.Dispose = function () {
    Binding.DataContainer.Dispose(this);
};
HTMLUListElement.prototype.Bind = function (data) {
    var that = this;
    HTMLHelper.UL.Bind(that, data);
};
HTMLUListElement.prototype.Rebind = function (field, sender) {
    Binding.DataContainer.Rebind(this, sender, field);
};
HTMLUListElement.prototype.InsertRow = function (row, beforeElement) {
    if (beforeElement) {
        this.insertBefore(row, beforeElement);
    }
    else {
        this.appendChild(row);
    }
};
HTMLUListElement.prototype.InsertAndBind = function (dataObject, beforeElement) {
    var that = this;
    var row = HTMLHelper.UL.CreateRow(that, dataObject);
    if (that.AlternatingRowClass && that.AsyncPosition % 2 == 0) {
        row.className = that.AlternatingRowClass;
    }
    that.InsertRow(row, beforeElement);
    Binding.DataContainer.DataBind(that, row, dataObject);
    return row;
};
HTMLUListElement.prototype.AddRow = function (dataObject, beforeElement) {
    var that = this;
    that.DataObject.Add(dataObject);
    var row = HTMLHelper.UL.CreateRow(that, dataObject);
    if (!beforeElement) {
        var elements = that.Get(function (e) { return e.tagName == "LI"; });
        var pos = elements.length - 1;
        var lookForFooter = true;
        while (lookForFooter) {
            var li = elements[pos];
            if (li.TemplateType == "footer") {
                beforeElement = li;
            }
            else {
                lookForFooter = false;
            }
            pos--;
            if (pos == 0) {
                lookForFooter = false;
            }
        }
    }
    that.InsertRow(row, beforeElement);
    Binding.DataContainer.DataBind(that, row, dataObject);
    if (Binding.Happened) {
        Binding.Happened(that);
    }
    return row;
};
HTMLUListElement.prototype.SetSelected = function (obj, sender) {
    var that = this;
    if (that.DataObject) {
        if (that.SelectedElement) {
            that.SelectedElement.className = null;
            if (that.SelectedElement.OriginalClass) {
                that.SelectedElement.className = that.SelectedElement.OriginalClass;
            }
        }
        that.SelectedElement = sender;
        if (that.SelectedItemClass) {
            that.SelectedElement.className = null;
            that.SelectedElement.className = that.SelectedItemClass;
        }
        if (that.SelectedItemChanged) {
            that.SelectedItemChanged(obj, that.SelectedElement);
        }
        if (that.Form) {
            that.Form.Bind(obj);
        }
    }
};
