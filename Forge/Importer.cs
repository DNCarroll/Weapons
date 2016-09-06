using System;

namespace Forge {
    public abstract class Importer<T> : IImporter<T> {
        public Type Type { get { return typeof(T); } }
        public abstract string ConnectionString { get; set; }
        public abstract T FirstByID(object id);
        public abstract Result<T> Insert(T objectToInsert);
        public abstract Result<T> Update(T objectToUpdate);
    }
    public interface IImporter<T> : IImporter {
        Result<T> Insert(T objectToInsert);
        Result<T> Update(T objectToUpdate);
        T FirstByID(object id);
    }
    public interface IImporter {
        Type Type { get; }
        string ConnectionString { get; set; }
    }
}
