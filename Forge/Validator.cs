using System;

namespace Forge {
    public abstract class Validator<T> : IValidator {        
        public Type Type { get { return typeof(T); } }
        public abstract Result Execute(T objectToValidate, ILogger logger = null);
        public Result Execute(object objectToValidate, ILogger logger = null) {
            Result result = new Result { Message = $"Failed to validate type of {nameof(T)}" };
            if (objectToValidate != null &&
                objectToValidate.GetType() == typeof(T)) {
                var typed = (T)objectToValidate;
                result = Execute(typed, logger);
            }
            return result;
        }
    }
    public interface IValidator : IExecutor {
        Type Type { get; }
        
    }
}
