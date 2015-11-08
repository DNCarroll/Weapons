module HTMLHelper {
    export module UL {
        export function CreateRow(that: HTMLUListElement, dataObject: any) {
            var row = <HTMLLIElement>that.RowHtml.CreateElementFromHtml();
            row.DataObject = dataObject;
            row.DataContainer = that;
            row.OriginalClass = row.className ? row.className : null;
            row.TemplateType = "row";
            row.onclick = function () {
                that.SetSelected(row.DataObject, row);
            };
            return row;
        }
    }

}