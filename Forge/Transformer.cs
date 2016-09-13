using System;

namespace Forge {
    public abstract class Transformer<from, to> : ITransform {        
        public Type FromType {
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
        public Result Execute(object objectoToTransform, ILogger logger = null) {
            Result result = new Result { Message = $"Failed to transfrom type of {nameof(from)}" };
            if (objectoToTransform != null &&
                objectoToTransform.GetType() == typeof(from)) {
                var typed = (from)objectoToTransform;
                result = Execute(typed, logger);
            }
            return result;
        }
    }   
    public interface ITransform : IExecutor {
        Type FromType { get; }
        Type ToType { get; }
    }
}
