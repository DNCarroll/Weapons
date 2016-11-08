var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DefaultContentManager = (function (_super) {
    __extends(DefaultContentManager, _super);
    function DefaultContentManager() {
        _super.call(this);
        this.ViewSegments.push(new ViewContent());
        this.ViewSegments.push(new ViewHeader());
        this.ViewSegments.push(new ViewFooter());
        this.IsDefault = true;
    }
    DefaultContentManager.prototype.DocumentTitle = function (route) { return "Default content"; };
    DefaultContentManager.prototype.Url = function (route) { return "Default"; };
    DefaultContentManager.prototype.UrlPattern = function () { return "default"; };
    DefaultContentManager.prototype.UrlTitle = function (route) { return "Default Page"; };
    return DefaultContentManager;
}(ViewContainer));
ViewContainers.push(new DefaultContentManager());
//# sourceMappingURL=ViewModelTest.js.map