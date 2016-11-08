//Jobs for this code
//1. supply information for history and spa like functionality for history
//2. call all of its views to be shown
//3. when initial page has loaded determine if this is the container to be used
//4. if coming in from ShowByUrl subsequent window load use IsUrlPatternMatch to determin if it is correct view
var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.Views = new Array();
        this.IsDefault = false;
    }
    ViewContainer.prototype.Show = function (route) {
        this.Views.forEach(function (s) {
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