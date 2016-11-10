module BindingManager {
    var Binders: Array <Binder> = new Array<Binder>();
    export function Clear() {
        Binders.forEach(b => b.Dispose());
    }
    export function Add(binder: Binder) {
        Binders.Add(binder);
    }
    export function CurrentParameters(): any[] {
        return HistoryManager.CurrentRoute().Parameters;
    }
}