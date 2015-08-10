window.PageLoaded(function () {

    
    //Ajax.DefaultHeader = Main.DefaultHeader;
    Ajax.UseAsDateUTC = true;
    Ajax.Resolver("SqlCompare");
    //Binding.Happened = Main.SomethingBound;    
    ViewManager.Initialize(new Compare(ViewType.Compare));    
    window.Show(ViewType.Compare);
    
    //Main.Authenticate();
    //there is only one view
}); 

//the view
class Compare implements IView {
    Key: ViewType;
    KeyName: string;
    ViewUrl: string;
    Container: HTMLElement;
    constructor(
        key: ViewType) {
        this.Key = key;
        this.Container = "content".Element();
        this.KeyName = What.Is.EnumName(ViewType, this.Key);
        this.ViewUrl = "/Views/" + this.KeyName + ".html";
    }
    Preload() {
        var dialogMenu = "dialogMenu".Element();
        if (dialogMenu) {
            dialogMenu.Remove();
        }
    }
    Url(route: Route): string {
        return (Ajax.Host ? "SqlCompare" : "");
    }
    UrlTitle(route: Route): string {
        return "TSqlCompare - " + this.KeyName;
    }
    Loaded(route: Route) {
        //"menu".Element().style.height = "100%";
        //var dialogMenu = "dialogMenu".Element();
        //if (dialogMenu) {
        //    document.body.appendChild(dialogMenu);
        //}
        //this.Subloaded(route);
        //the view is gotten from here its talking to Api about connection strings
        var progress = "progress".Element();
        var DoCompare = "DoCompare".Element();
        var dim = DoCompare.DimAndOff();
        progress.style.top = (dim.Top + 4) + "px";
        progress.style.left = (dim.Width + dim.Left + 6) + "px";
        //progress.style.top = 
        var height = "innerHeight" in window
            ? window.innerHeight
            : document.documentElement.offsetHeight;
        //subtract the top margin
        var cont = "ObjectSummaryContainer".Element();
        var marginTop = parseFloat(cont.style.top.replace("em", ""));
        marginTop = Convert.EmValueToPixelValue(marginTop);
        height -= marginTop;
        cont.style.height = height + "px";
        var obj = Local.Get("ConnectionStrings");
        if (obj)
        {
            "ConnectionA".Input().value = obj.A;
            "ConnectionB".Input().value = obj.B;            
        }
    }
    Subloaded(route: Route) {
    }
    static Clicked() {
        if (!Is.NullOrEmpty("ConnectionA".Input().value) && !Is.NullOrEmpty("ConnectionB".Input().value)) {
            
            var obj = {
                A: "ConnectionA".Input().value,
                B: "ConnectionB".Input().value
            };
            Local.Save("ConnectionStrings", obj);
            Api.Compare.Get(obj, function (result) {
                var objSummary = "ObjectSummary".List();
                objSummary.Bind(result);
            });
        }
    }
    static SelectedItemChanged(obj, element: HTMLElement) {      
        "FullName".Element().innerHTML = obj.FullName;
        "Lines".List().Bind(obj.Lines);
    }
}
module Api {    
    export var Compare = "/Api/Compare";
}
enum ViewType {    
    Compare
}