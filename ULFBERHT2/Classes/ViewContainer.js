//nothing to add as of 2016-11-08
var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.ViewSegments = new Array();
        this.IsDefault = false;
    }
    ViewContainer.prototype.Show = function (route) {
        this.ViewSegments.forEach(function (s) {
            s.Show(route);
        });
    };
    ViewContainer.prototype.IsUrlPatternMatch = function (url) {
        var pattern = this.UrlPattern();
        if (pattern) {
            var regex = new RegExp(pattern, 'i');
            return url.match(regex) ? true : false;
        }
        return false;
    };
    return ViewContainer;
}());
//# sourceMappingURL=ViewContainer.js.map