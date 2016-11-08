//jobs of this code  
//1. get the view.html for this view via the ViewUrl
//2. bind the view once it has returned
//      the incoming view may have either auto binding
//      or the view itself will have insight into binding
var View = (function () {
    function View() {
    }
    View.prototype.Preload = function (view, viewInstance) { };
    View.prototype.Show = function (viewInstance) {
        var url = this.ViewUrl();
        var found = sessionStorage.getItem(url);
        var callback = this.SetHTML;
        var view = this;
        if (!found || window["IsDebug"]) {
            var containter = this.ContainerID();
            if (!Is.NullOrEmpty(containter)) {
                Ajax.Html(this.ViewUrl(), function (result) {
                    if (result) {
                        sessionStorage.setItem(url, result);
                        callback(view, result, viewInstance);
                    }
                });
            }
        }
        else {
            this.SetHTML(this, found, viewInstance);
        }
    };
    View.prototype.SetHTML = function (view, html, viewIntance) {
        view.Preload(view, viewIntance);
        document.getElementById(view.ContainerID()).innerHTML = html;
        //here is your autobinding  
        //var elements = view.Container.Get(ele => {
        //    return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
        //});
        //for (var i = 0; i < elements.length; i++) {
        //    Binding.DataContainer.Auto(elements[i]);
        //}
        //if (view.Loaded) {
        //    view.Loaded(route);
        //}
    };
    return View;
}());
//# sourceMappingURL=View.js.map