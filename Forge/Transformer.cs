using System;

namespace Forge {
    public abstract class Transformer<from, to> : ITransform<from, to> {
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
        public abstract to Transform(from obj);
    }   
    
    public interface ITransform<from, to> : ITransform {
        to Transform(from obj);
    }
    public interface ITransform {
        Type FromType { get; }
        Type ToType { get; }
    }

}
