var ViewInstance = (function () {
    function ViewInstance(parameters, viewContainer) {
        this.Parameters = parameters;
        this.ViewContainer = viewContainer;
    }
    ViewInstance.FormatUrl = function (url) {
        url = url.replace(/[^A-z0-9/]/g, "");
        return url;
    };
    return ViewInstance;
}());
//# sourceMappingURL=Route.js.map