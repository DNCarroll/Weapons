var ConventionBasedView = (function () {
    function ConventionBasedView(key) {
        this.Key = key;
        this.ViewUrl = "/Views/" + key.toString() + ".html";
    }
    ConventionBasedView.prototype.Url = function (route) {
        return this.Key.toString();
    };
    ConventionBasedView.prototype.UrlTitle = function (route) {
        return this.Key.toString();
    };
    ConventionBasedView.prototype.PageTitle = function (route) {
        return this.Key.toString();
    };
    ConventionBasedView.prototype.Loaded = function (route) {
    };
    return ConventionBasedView;
})();
;
//# sourceMappingURL=ConventionBasedView.js.map