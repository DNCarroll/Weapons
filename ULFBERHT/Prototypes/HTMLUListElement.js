HTMLUListElement.prototype.Dispose = function () {
    Binding.DataContainer.Dispose(this);
};
HTMLUListElement.prototype.Bind = function (data) {
    var that = this;
    if (!that.AlreadySetup) {
        that.AlreadySetup = true;
        Binding.DataContainer.Setup(that);
        Binding.DataContainer.SetupUl(that);
    }
    var tempArray;
    if (Is.Array(data)) {
        tempArray = data;
    }
    else {
        tempArray = new Array();
        tempArray.push(data);
    }
    that.DataObject = tempArray;
    that.Clear();
    Ajax.ShowProgress();
    if (that.style.display == "none") {
        that.style.display = "table";
    }
    if (that.HeaderHtml) {
        that.HeaderHtml.forEach(function (h) {
            var header = that.AddHtml(h);
            header.DataContainer = that;
            header.TemplateType = "header";
            Binding.DataContainer.LookForInsert(header);
        });
    }
    that.AsyncPosition = 0;
    var endAsync = function () {
        if (that.FooterHtml) {
            that.FooterHtml.forEach(function (f) {
                var footer = that.AddHtml(f);
                footer.DataContainer = that;
                footer.TemplateType = "footer";
                Binding.DataContainer.LookForInsert(footer);
                if (that.DataObject && that.DataObject.length > 0) {
                    that.SetSelected(that.DataObject[0], that.First(function (e) { return e.DataObject == that.DataObject[0]; }));
                }
            });
        }
        Ajax.HideProgress();
        if (that.ActionEvent != null) {
            that.ActionEvent(new ActionEvent(ActionType.Bound, that.DataObject, null, null));
        }
        if (Binding.Happened) {
            Binding.Happened(that);
        }
    };
    var async = function () {
        var dataObject = that.DataObject[that.AsyncPosition];
        that.InsertAndBind(dataObject);
        that.AsyncPosition = that.AsyncPosition + 1;
        if (that.AsyncPosition == that.DataObject.length) {
            setTimeout(endAsync, 0);
        }
        else {
            setTimeout(async, 0);
        }
    };
    if (data &&
        data.length &&
        that.RowHtml) {
        setTimeout(async, 0);
    }
    else {
        endAsync();
    }
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
    var row = that.RowHtml.CreateElementFromHtml();
    row.DataObject = dataObject;
    row.DataContainer = that;
    row.OriginalClass = row.className ? row.className : null;
    row.TemplateType = "row";
    row.onclick = function () {
        that.SetSelected(row.DataObject, row);
    };
    that.InsertRow(row, beforeElement);
    Binding.DataContainer.DataBind(that, row, dataObject);
    return row;
};
HTMLUListElement.prototype.AddRow = function (dataObject, beforeElement) {
    var that = this;
    that.DataObject.Add(dataObject);
    var row = that.RowHtml.CreateElementFromHtml();
    row.DataObject = dataObject;
    row.DataContainer = that;
    row.OriginalClass = row.className ? row.className : null;
    row.TemplateType = "row";
    row.onclick = function () {
        that.SetSelected(row.DataObject, row);
    };
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
