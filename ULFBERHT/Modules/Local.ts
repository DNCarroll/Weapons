module Local {    
    export function CanStore(): boolean {
        try {
            return localStorage ? true : false;
        } catch (e) {
            return false;
        }
    }
    export function Remove(key: string): void {
        if (Local.CanStore()) {
            localStorage.removeItem(key);            
        }
    }
    export function Clear(): void {
        if (Local.CanStore()) {
            localStorage.clear();            
        }
    }
    export function Save(key: string, obj: any): void {        
        if (Local.CanStore()) {
            var json = JSON.stringify(obj);
            localStorage.setItem(key, json);
        }
    }
    export function Get(key: string, defaultObject?: any) {
        try {
            var temp = null;
            if (!temp && Local.CanStore()) {
                if (Is.Property(key, localStorage)) {
                    temp = localStorage.getItem(key);
                }
                if (Is.String(temp)) {
                    temp = JSON.parse(temp);
                    Ajax.ConvertProperties(temp);
                    return temp;
                }
            }
            return temp;
        } catch (e) {
            throw e;
        }
    }
} 