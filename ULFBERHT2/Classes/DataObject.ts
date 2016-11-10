class DataObject implements IDataObject {
    constructor(raw: any) {
        //set the propertyvalues of this object
        for (var prop in raw) {
            this[prop] = raw[prop];
        }
    }
    PropertyChanged: (obj: IDataObject, property: string) => void;
}