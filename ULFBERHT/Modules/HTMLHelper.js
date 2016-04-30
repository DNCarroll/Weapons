var HTMLHelper;
(function (HTMLHelper) {
    var UL;
    (function (UL) {
        function CreateRow(list, dataObject) {
            var row = list.RowHtml.CreateElementFromHtml();
            row.DataObject = dataObject;
            row.DataContainer = list;
            row.OriginalClass = row.className ? row.className : null;
            row.TemplateType = "row";
            row.onclick = function () {
                list.SetSelected(row.DataObject, row);
            };
            return row;
        }
        UL.CreateRow = CreateRow;
        function Bind(list, data) {
            if (!list.AlreadySetup) {
                list.AlreadySetup = true;
                Binding.DataContainer.Setup(list);
                Binding.DataContainer.SetupUl(list);
            }
            var tempArray;
            if (Is.Array(data)) {
                tempArray = data;
            }
            else {
                tempArray = new Array();
                tempArray.push(data);
            }
            list.DataObject = tempArray;
            list.Clear();
            Ajax.ShowProgress();
            if (list.style.display == "none") {
                list.style.display = "table";
            }
            if (list.HeaderHtml) {
                list.HeaderHtml.forEach(function (h) {
                    var header = list.AddHtml(h);
                    header.DataContainer = list;
                    header.TemplateType = "header";
                    Binding.DataContainer.LookForInsert(header);
                });
            }
            list.AsyncPosition = 0;
            var endAsync = function () {
                addFooter(list);
            };
            if (list.AsyncBinding) {
                var async = function () {
                    asyncBind(list, async, endAsync);
                };
                if (data &&
                    data.length &&
                    list.RowHtml) {
                    setTimeout(async, 0);
                }
                else {
                    endAsync();
                }
            }
            else if (data &&
                data.length &&
                list.RowHtml) {
                tempArray.forEach(function (o) {
                    list.InsertAndBind(o);
                    list.AsyncPosition = list.AsyncPosition + 1;
                });
                endAsync();
            }
        }
        UL.Bind = Bind;
        function addFooter(list) {
            if (list.FooterHtml) {
                list.FooterHtml.forEach(function (f) {
                    var footer = list.AddHtml(f);
                    footer.DataContainer = list;
                    footer.TemplateType = "footer";
                    Binding.DataContainer.LookForInsert(footer);
                    if (list.DataObject && list.DataObject.length > 0) {
                        list.SetSelected(list.DataObject[0], list.First(function (e) { return e.DataObject == list.DataObject[0]; }));
                    }
                });
            }
            Ajax.HideProgress();
            if (list.ActionEvent != null) {
                list.ActionEvent(new ActionEvent(ActionType.Bound, list.DataObject, null, null));
            }
            if (Binding.Happened) {
                Binding.Happened(list);
            }
        }
        function asyncBind(list, async, endAsync) {
            var dataObject = list.DataObject[list.AsyncPosition];
            list.InsertAndBind(dataObject);
            list.AsyncPosition = list.AsyncPosition + 1;
            if (list.AsyncPosition == list.DataObject.length) {
                setTimeout(endAsync, 0);
            }
            else {
                setTimeout(async, 0);
            }
        }
    })(UL = HTMLHelper.UL || (HTMLHelper.UL = {}));
})(HTMLHelper || (HTMLHelper = {}));
//# sourceMappingURL=HTMLHelper.js.map