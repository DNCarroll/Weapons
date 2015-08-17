var ViewByConvention = (function () {
    function ViewByConvention(key) {
        this.Key = key;
        this.ViewUrl = "/Views/" + key.toString() + ".html";
    }
    ViewByConvention.prototype.Url = function (route) {
        return this.Key.toString();
    };
    ViewByConvention.prototype.UrlTitle = function (route) {
        return this.Key.toString();
    };
    ViewByConvention.prototype.Loaded = function (route) {
    };
    ViewByConvention.prototype.Preload = function () { };
    return ViewByConvention;
})();
;
