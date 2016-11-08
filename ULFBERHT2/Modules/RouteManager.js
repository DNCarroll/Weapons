//this is the deal that will handle back event 
//and be aware of what pages were hit
var HistoryManager;
(function (HistoryManager) {
    HistoryManager.ViewInstances = new Array();
    function BackEvent(e) {
        if (HistoryManager.ViewInstances.length > 1) {
            HistoryManager.ViewInstances.splice(HistoryManager.ViewInstances.length - 1, 1);
        }
        if (HistoryManager.ViewInstances.length > 0) {
            var viewInfo = HistoryManager.ViewInstances[HistoryManager.ViewInstances.length - 1];
            var found = viewInfo.ViewContainer;
            found.Show(viewInfo);
        }
        else {
        }
    }
    HistoryManager.BackEvent = BackEvent;
})(HistoryManager || (HistoryManager = {}));
//# sourceMappingURL=RouteManager.js.map