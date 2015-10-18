class Route {
    Key: any;
    Parameters: Array<any>;
    View: IView;
    constructor(key: any, parameters: Array<any>, view: IView) {
        this.Key = key;
        this.Parameters = parameters;
        this.View = view;
    }
    Show() {
        //get the html 
        //set the ViewContainer inner html
        var url = "RouteKey" + this.Key.toString();
        var found = sessionStorage.getItem(url);
        var callback = this.SetHTML;
        var view = this.View;
        var router = this;
        if (!found || window["IsDebug"]) {
            Ajax.Html(this.View.ViewUrl, function (result) {
                if (result) {
                    view.Preload(this);
                    sessionStorage.setItem(url, result);
                    callback(result, view, router);
                }
            });
        }
        else {
            this.SetHTML(found, this.View, this);
        }
    }
    SetHTML(html: string, view: IView, route: Route) {
        view.Preload(this);
        view.Container.innerHTML = html;
        var elements = view.Container.Get(ele=> {
            return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
        });
        for (var i = 0; i < elements.length; i++) {
            Binding.DataContainer.Auto(elements[i]);
        }
        if (view.Loaded) {
            view.Loaded(route);
        }
    }
    static FormatUrl(url: string) {
        url = url.replace(/[^A-z0-9/]/g, "");
        return url;
    }
}