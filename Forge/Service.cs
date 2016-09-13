using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Forge {

    public static class Service {
        static List<IShipper> shippers = new List<IShipper>();
        static List<ITransform> transformers = new List<ITransform>();
        static List<IValidator> validators = new List<IValidator>();
        static ILogger logger = null;

        static Service() {
            fillList(shippers);
            fillList(transformers);
            fillList(validators);
            logger = getLogger(getAssemblies().ToArray());
        }

        public static Result Process<T>(this string transformerFullClassName, T objectToTransform, string connectionString = null) =>
            process(objectToTransform, getTransformer<T>(transformerFullClassName), connectionString);

        public static Result Process<T>(this T objectToTransform, string connectionString = null)
            where T : class => process(objectToTransform, transformers.FirstOrDefault(t => t.FromType == typeof(T)), connectionString);
        
        static Result process<T>(this T objectToTransform, ITransform transformer, string connectionString = null) {
            var result = new Result { DataObject = null, Success = false, Message = $"Transformer not found for {typeof(T).FullName}." };
            result = transformer?.Execute(objectToTransform, logger) ?? result;
            IValidator validator = validators.FirstOrDefault(v => v.Type == transformer?.ToType);
            IShipper shipper = shippers.FirstOrDefault(v => v.Type == validator?.Type);
            if (shipper != null) {
                shipper.ConnectionString = shipper.ConnectionString ?? connectionString;
            }
            result = executeIfFound(transformer, validator, result, logger, "validator", transformer?.ToType.FullName);
            result = executeIfFound(validator, shipper, result, logger, "shipper", transformer?.ToType.FullName);
            return result;
        }

        static Result executeIfFound(IExecutor previousExecutor, IExecutor executor, Result currentResult, ILogger logger, string whatIsBeingLookedFor, string typeName) {
            return previousExecutor == null ? 
                        currentResult : 
                        executor?.Execute(currentResult.DataObject, logger) ?? 
                        new Result() {
                            DataObject = currentResult.DataObject,
                            Success = false,
                            Message = resultMessage(whatIsBeingLookedFor, typeName)
                        };
        }

        static string resultMessage(string whatIsBeingLookedFor, string typeName) => $"Failed to find {whatIsBeingLookedFor} interface for {typeName}.";

        static ITransform getTransformer<from>(string transformerFullClassName) {
            var found = transformers.FirstOrDefault(d => d.GetType().FullName == transformerFullClassName && d.FromType == typeof(from));
            if (found != null) {
                return found;
            }
            return null;
        }

        static void fillList<T>(List<T> listToFill) {
            if (listToFill.Count() == 0) {
                var assemblies = getAssemblies();
                foreach (var assembly in assemblies) {
                    Interrogate(assembly, listToFill);
                }
            }
        }

        public static void Interrogate<T>(T obj) => Interrogate(obj.GetType());
        public static void Interrogate(Type type) {
            logger = getLogger(new Assembly[] { type.Assembly });
            Interrogate(type.Assembly, transformers);
            Interrogate(type.Assembly, shippers);
            Interrogate(type.Assembly, validators);
        }
        public static void Interrogate<T>(Assembly assembly, List<T> listToFill) {
            if (assemblyHasNotBeenInterrogated(assembly, listToFill)) {
                var items = assembly.GetTypes().Where(x => x.IsClass && !x.IsAbstract && x.GetInterfaces().ToList().FirstOrDefault(i => i == typeof(T)) != null).ToList();
                foreach (var item in items) {
                    listToFill.Add((T)Activator.CreateInstance(item));
                }
            }
        }
        static bool assemblyHasNotBeenInterrogated<T>(Assembly assembly, List<T> listToFill) => listToFill.FirstOrDefault(t => t.GetType().Assembly == assembly) == null;

        static List<Assembly> getAssemblies() {
            List<Assembly> listOfAssemblies = new List<Assembly>();
            var mainAsm = Assembly.GetExecutingAssembly() ?? Assembly.GetCallingAssembly();
            if (mainAsm != null) {
                listOfAssemblies.Add(mainAsm);
                foreach (var refAsmName in mainAsm.GetReferencedAssemblies()) {
                    listOfAssemblies.Add(Assembly.Load(refAsmName));
                }
            }
            return listOfAssemblies;
        }
        static ILogger getLogger(Assembly[] assemblies) {
            var found = assemblies.SelectMany(a => 
                                        a.GetTypes()).FirstOrDefault(x => 
                                                        x.IsClass &&
                                                        !x.IsAbstract &&
                                                        x.GetInterfaces().FirstOrDefault(i => i == typeof(ILogger)) != null);
            if (found != null) {
                return (ILogger)Activator.CreateInstance(found);
            }
            return null;
        }
    }
}
