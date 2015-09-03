var ViewManager;
(function (ViewManager) {
    ViewManager.Routes = new Array();
    ViewManager.Views = new Array();
    function Initialize() {
        var views = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            views[_i - 0] = arguments[_i];
        }
        AddViews(views);
        window.addEventListener("popstate", ViewManager.BackEvent);
    }
    ViewManager.Initialize = Initialize;
    function CurrentRoute() {
        if (ViewManager.Routes != null && ViewManager.Routes.length > 0) {
            return ViewManager.Routes[ViewManager.Routes.length - 1];
        }
        return null;
    }
    ViewManager.CurrentRoute = CurrentRoute;
    function AddViews(views) {
        views.forEach(function (l) {
            ViewManager.Views.Remove(function (l2) { return l2.Key == l.Key; });
            ViewManager.Views.Add(l);
        });
    }
    ViewManager.AddViews = AddViews;
    function BackEvent(e) {
        if (ViewManager.Routes.length > 1) {
            ViewManager.Routes.splice(ViewManager.Routes.length - 1, 1);
        }
        if (ViewManager.Routes.length > 0) {
            var viewInfo = ViewManager.Routes[ViewManager.Routes.length - 1];
            var found = ViewManager.Views.First(function (o) {
                return o.Key == viewInfo.Key;
            });
            viewInfo.Show();
        }
        else {
        }
    }
    ViewManager.BackEvent = BackEvent;
    function Load(viewKey, parameters) {
        var found = ViewManager.Views.First(function (o) {
            return o.Key == viewKey;
        });
        if (found) {
            var route = new Route(viewKey, parameters, found);
            ViewManager.Routes.push(route);
            window.PushState(null, found.UrlTitle(this), found.Url(route));
            route.Show();
        }
    }
    ViewManager.Load = Load;
})(ViewManager || (ViewManager = {}));
//# sourceMappingURL=ViewManager.js.map