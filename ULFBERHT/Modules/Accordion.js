/// <reference path="../Prototypes/HTMLElement.ts"/>
var Accordion;
(function (Accordion) {
    function Hook(ele, parentRule) {
        if (!parentRule) {
            parentRule = ".accordion";
        }
        var accordions = ele.Get(function (obj) {
            return !Is.NullOrEmpty(obj.getAttribute("data-accordion"));
        });
        accordions.forEach(function (a) {
            a.className = null;
            a.className = Accordion.MaximumClass(a, parentRule);
        });
    }
    Accordion.Hook = Hook;
    function MaximumClass(ele, parentRule) {
        var className = parentRule + " input:checked ~ article.Max" + ele.id;
        //find does it already exists
        //yes? then mod it to be like this one
        var style = null;
        var mysheet = Accordion.GetStyleSheet("mainSheet");
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
    Accordion.MaximumClass = MaximumClass;
    function GetStyleSheet(name) {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            if (sheet.title == name) {
                return sheet;
            }
        }
    }
    Accordion.GetStyleSheet = GetStyleSheet;
    function GetStyleSheetRules(styleSheet) {
        var rules = document.all ? 'rules' : 'cssRules';
        return styleSheet[rules];
    }
    Accordion.GetStyleSheetRules = GetStyleSheetRules;
})(Accordion || (Accordion = {}));
