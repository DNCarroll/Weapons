/// <reference path="../Prototypes/HTMLElement.ts"/>

module Accordion {
    export function Hook(ele: HTMLElement, parentRule?) {
        if (!parentRule) {
            parentRule = ".accordion";
        }
        var accordions = ele.Get(function (obj) {
            return !Is.NullOrEmpty(obj.getAttribute("data-accordion"));
        });
        accordions.forEach(a=> {
            a.className = null;
            a.className = Accordion.MaximumClass(a, parentRule);
        });
    }
    export function MaximumClass (ele:HTMLElement, parentRule?) {
        var className = parentRule + " input:checked ~ article.Max" + ele.id;
        //find does it already exists
        //yes? then mod it to be like this one
        var style = null;
        var mysheet = <CSSStyleSheet>Accordion.GetStyleSheet("mainSheet");
        var rules = Accordion.GetStyleSheetRules(mysheet);
        for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            if (r.selectorText.indexOf(className) > -1) {
                style = r.style;
                style.height = ele.style.maxHeight;
            }
        }
        if (!style) {
            mysheet.insertRule(className + "{ height:" + ele.style.maxHeight + "}", 0);
        }
        return "Max" + ele.id;
    }
    export function GetStyleSheet(name) {        
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            if (sheet.title == name) {
                return sheet;
            }
        }
    }
    export function GetStyleSheetRules (styleSheet) : Array<any> {
        var rules = document.all ? 'rules' : 'cssRules';
        return <Array<any>>styleSheet[rules];
    }
}