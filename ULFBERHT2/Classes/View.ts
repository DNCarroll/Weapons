//jobs of this code  
//1. get the view.html for this view via the ViewUrl
//2. bind the view once it has returned
//      the incoming view may have either auto binding
//      or the view itself will have insight into binding
abstract class View implements IView {
    abstract ViewUrl(): string;
    Preload(view: IView, viewInstance: ViewInstance) { }
    Show(viewInstance: ViewInstance) {                
        var found = sessionStorage.getItem(this.ViewUrl());        
        if (!found || window["IsDebug"]) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.RequestCompleted.bind(this));
            ajax.Get(this.ViewUrl());
        }
        else {
            this.SetHTML(found);
        }
    }
    RequestCompleted(arg: CustomEventArg<Ajax>) {        
        if (arg.Sender.ResponseText) {
            sessionStorage.setItem(this.ViewUrl(), arg.Sender.ResponseText);
            this.SetHTML(arg.Sender.ResponseText);
        }        
        arg.Sender = null;
    }    
    SetHTML(html: string) {
        var containter = this.ContainerID();
        if (!Is.NullOrEmpty(containter)) {
            document.getElementById(this.ContainerID()).innerHTML = html;
        }
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
    }
    abstract ContainerID(): string;
}