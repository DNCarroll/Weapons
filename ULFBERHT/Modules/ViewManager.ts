module ViewManager {
    export var Routes = new Array<Route>();
    export var Views = new Array<IView>();
    export function Initialize(...views: Array<IView>) {
        AddViews(views);
        window.addEventListener("popstate", ViewManager.BackEvent);
    }
    export function CurrentRoute(): Route {
        if (ViewManager.Routes != null && ViewManager.Routes.length > 0) {
            return ViewManager.Routes[ViewManager.Routes.length - 1];
        }
        return null;
    }
    export function AddViews(views: Array<IView>) {
        views.forEach(l=> {
            Views.Remove(l2=> l2.Key == l.Key);
            Views.Add(l);
        });
    }
    export function BackEvent(e) {
        if (ViewManager.Routes.length > 1) {
            ViewManager.Routes.splice(ViewManager.Routes.length - 1, 1);
        }
        if (ViewManager.Routes.length > 0) {
            var viewInfo = ViewManager.Routes[ViewManager.Routes.length - 1];
            var found = <IView>Views.First(function (o) {
                return o.Key == viewInfo.Key;
            });
            viewInfo.Show();
        }
        else {
            //do nothing?
        }
    }
    export function Load(viewKey, parameters?: Array<string>) {
        var found = <IView>Views.First(function (o) {
            return o.Key == viewKey;
        });
        if (found) {
            var route = new Route(viewKey, parameters, found);
            var url = found.Url(this);
            var title = found.UrlTitle(this);
            var documentTitle = found.DocumentTitle(this);
            Routes.push(route);
            if (Is.NullOrEmpty(url) && Is.NullOrEmpty(title)) {
                window.PushState(null, title, url);
            }
            if (documentTitle) {
                document.title = documentTitle;
            }
            route.Show();
        }
    }
}