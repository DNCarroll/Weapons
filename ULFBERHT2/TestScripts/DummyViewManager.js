var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DummyViewManager = (function (_super) {
    __extends(DummyViewManager, _super);
    function DummyViewManager() {
        _super.call(this);
        this.ViewSegments.push(new DummyContent());
        this.ViewSegments.push(new ViewHeader());
        this.ViewSegments.push(new ViewFooter());
        this.IsDefault = true;
    }
    DummyViewManager.prototype.DocumentTitle = function (route) { return "Dummy Content"; };
    DummyViewManager.prototype.Url = function (route) { return "DummyView"; };
    DummyViewManager.prototype.UrlPattern = function () { return "dummypattern|dummy"; };
    DummyViewManager.prototype.UrlTitle = function (route) { return "Dummy Page"; };
    return DummyViewManager;
}(ViewContainer));
ViewContainers.push(new DummyViewManager());
//# sourceMappingURL=DummyViewManager.js.map