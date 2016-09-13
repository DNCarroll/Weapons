using Microsoft.CSharp;
using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Forge {
    public enum MapType {
        Logger,
        Transformer,
        Validator,
        Importer
    }

    public delegate object GetValue<T>();
    public class Instantiator<T> : IInstantiator {
        GetValue<T> newObject { get; set; }

        private Type type;
        public Type Type {
            get { return type; }
        }

        private MapType mapType;
        public MapType MapType {
            get { return mapType; }
        }

        public Instantiator(Type type, MapType mapType) {
            this.type = type;
            this.mapType = mapType;
            var code = getCode(type);
            var method = createMethod(code, type);
            var betterFunction = (GetValue<T>)Delegate.CreateDelegate(typeof(GetValue<T>), method);
            this.newObject = (GetValue<T>)betterFunction;

        }
        string getCode(Type type) {
            return @"using System;
            namespace Forge
            {
                public static class NewObjectMethods 
                {
                    public static " + $"{ type.FullName }  NewObject()" +
                    "{" +
                        $"return new {type.FullName}();" +
                     @"}
                }
            }";
        }
        public bool IsTypeMatch(Type type) {
            var obj = newObject();
            if (obj is IExecutor) {                
                return ((IExecutor)obj).Type == type;
            }
            return false;
        }
        static MethodInfo createMethod(string code, Type type) {
            CSharpCodeProvider provider = new CSharpCodeProvider();
            CompilerParameters parameters = new CompilerParameters();

            // True - memory generation, false - external file generation
            parameters.GenerateInMemory = true;
            parameters.GenerateExecutable = false;
            // Add CSharpSimpleScripting.exe as a reference to Scripts.dll to expose interfaces
            List<Assembly> referencedAssemblies = new List<Assembly>();
            referencedAssemblies.Add(type.Assembly);
            //parameters.ReferencedAssemblies.Add(type.Assembly.Location);
            var interfaces = type.GetInterfaces();
            foreach (var i in interfaces) {
                var found = referencedAssemblies.FirstOrDefault(a => a == i.Assembly);
                if (found == null) {
                    referencedAssemblies.Add(i.Assembly);
                }
            }
            foreach (var a in referencedAssemblies) {
                parameters.ReferencedAssemblies.Add(a.Location);
            }

            CompilerResults results = provider.CompileAssemblyFromSource(parameters, code);

            Type binaryFunction = results.CompiledAssembly.GetType("Forge.NewObjectMethods");
            return binaryFunction.GetMethod("NewObject");
        }

        public object NewObject() {
            return newObject();
        }
    }

    public interface IInstantiator {
        Type Type { get; }
        object NewObject();
        MapType MapType { get; }
        bool IsTypeMatch(Type type);
    }
}
