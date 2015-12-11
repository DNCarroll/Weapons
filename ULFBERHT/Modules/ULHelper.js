var HTMLHelper;
(function (HTMLHelper) {
    var UL;
    (function (UL) {
        function CreateRow(that, dataObject) {
            var row = that.RowHtml.CreateElementFromHtml();
            row.DataObject = dataObject;
            row.DataContainer = that;
            row.OriginalClass = row.className ? row.className : null;
            row.TemplateType = "row";
            row.onclick = function () {
                that.SetSelected(row.DataObject, row);
            };
            return row;
        }
        UL.CreateRow = CreateRow;
    })(UL = HTMLHelper.UL || (HTMLHelper.UL = {}));
})(HTMLHelper || (HTMLHelper = {}));
