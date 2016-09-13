using System;

namespace Forge {
    public abstract class Transformer<from, to> : ITransform {        
        public Type Type {
            get {
                return typeof(from);
            }
        }
        public Type ToType {
            get {
                return typeof(to);
            }
        }

        public abstract Result Execute(from objectoToTransform, ILogger logger = null);
        public Result Execute(object objectToShip, ILogger logger = null) {
            Result result = new Result { Message = $"Failed to transfrom type of {objectToShip.GetType().FullName}." };
            if (objectToShip != null &&
                objectToShip.GetType() == typeof(from)) {
                var typed = (from)objectToShip;
                result = Execute(typed, logger);
            }
            return result;
        }
    }   
    public interface ITransform : IExecutor {        
        Type ToType { get; }
    }
}
