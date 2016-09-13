using System;

namespace Forge {
    public abstract class Shipper<T> : IShipper {
        public virtual string ConnectionString { get; set; }
        public Type Type { get { return typeof(T); } }
        public abstract Result Execute(T objectToShip, ILogger logger = null);
        public Result Execute(object objectToShip, ILogger logger = null) {                        
            Result result = new Result { Message = $"Failed to ship type of {nameof(T)}" };
            if (objectToShip != null &&
                objectToShip.GetType() == typeof(T)) {
                var typed = (T)objectToShip;
                result = Execute(typed, logger);
            }
            return result;
        }
    }
    public interface IShipper : IExecutor {
        Type Type { get; }
        string ConnectionString { get; set; }
    }
}
