/// <reference path="../Modules/Is.ts"/>
interface HTMLSelectElement {
    AddOptions(arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement;
    AddOptionsViaObject(obj, selectedValue?, orderedAsIs?);
}
HTMLSelectElement.prototype.AddOptions= function(arrayOrObject, valueProperty ? : string, displayProperty?: string, selectedValue?): HTMLSelectElement {
    var select = <HTMLSelectElement>this;
    if (Is.Array(arrayOrObject)) {
        var tempArray = <Array<any>>arrayOrObject;
        if (displayProperty && valueProperty) {
            tempArray.forEach(t => {  
                var option = new Option(t[displayProperty], t[valueProperty]);              
                select["options"][select.options.length] = option;
                if (selectedValue &&
                    t[valueProperty] == selectedValue) {
                    option.selected = true;
                }
            });                        
        }
        else if (tempArray.length > 1 && Is.String(tempArray[0])) {
            tempArray.forEach(t => {
                var option = new Option(t, t);
                select["options"][select.options.length] = option;
                if (selectedValue &&
                    t == selectedValue) {
                    option.selected = true;
                }
            });
        }
    }
    else if (arrayOrObject) {
        //if its a object prop
        for (var prop in arrayOrObject) {
            if (Is.Function(prop)) {
                var option = new Option(prop, prop);
                select["options"][select.options.length] = option;
                if (selectedValue && selectedValue == prop) {
                    option.selected = true;
                }
            }
        }
    }    
    return select;
};
HTMLSelectElement.prototype.AddOptionsViaObject = function (obj, selectedValue?, orderedAsIs?) {
    var select = <HTMLSelectElement>this;
    if (orderedAsIs) {
        for (var prop in obj) {
            var option = new Option(prop, obj[prop]);
            select["options"][select.options.length] = option;
            if (selectedValue && selectedValue == obj[prop]) {
                option.selected = true;
            }
        }
    }
    else {
        var tempArray = new Array();
        for (var prop in obj) {
            if (Is.Numeric(obj[prop]))
            {
                tempArray.push(prop);
            }
        }
        tempArray = tempArray.sort();
        tempArray.forEach(t => {   
            var option = new Option(t, obj[t]);         
            select["options"][select.options.length] = option;
            if (selectedValue != undefined && selectedValue == obj[t]) {
                option.selected = true;
            }
        });
    }
};
