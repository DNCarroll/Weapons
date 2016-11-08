var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.IsDefault = false;
        this.ViewSegments = new Array();
    }
    ViewContainer.prototype.Show = function (route) {
        this.ViewSegments.forEach(function (s) {
            s.Show(route);
        });
    };
    return ViewContainer;
}());
//# sourceMappingURL=ViewManager.js.map