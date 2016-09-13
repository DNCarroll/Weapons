using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Forge {

    public static class Service {
        
        //static List<IImporter> importer = new List<IImporter>();
        //static List<ITransform> transformers = new List<ITransform>();
        //static List<IValidator> validators = new List<IValidator>();
        //static ILogger logger = null;
        static List<IInstantiator> instantiators = new List<IInstantiator>();
        static Service() {
            //fillList(importer, MapType.Importer);
            //fillList(transformers, MapType.Transformer);
            //fillList(validators, MapType.Validator);
            //logger = getLogger(getAssemblies().ToArray());

        }

        //Should it be a new object everytime?
        //grab a map to the cached types then 
        //do a new up of them to establish the newable part of it

        public static Result Import<T>(this string transformerFullClassName, T objectToTransform, string connectionString = null) =>
            process(objectToTransform, getTransformer<T>(transformerFullClassName), connectionString);

        public static Result Import<T>(this T objectToTransform, string connectionString = null)
            where T : class => process(objectToTransform, findInstantiator<ITransform>(objectToTransform.GetType(), MapType.Transformer), connectionString);


        static Result process<T>(this T objectToTransform, ITransform transformer, string connectionString = null) {
            var logger = getLogger();
            var result = new Result { DataObject = null, Success = false, Message = $"Transformer not found for {objectToTransform.GetType().FullName}." };
            result = transformer?.Execute(objectToTransform, logger) ?? result;
            IValidator validator = findInstantiator<IValidator>(transformer?.ToType, MapType.Validator);
            IImporter shipper = findInstantiator<IImporter>(transformer?.ToType, MapType.Importer);
            if (shipper != null) {
                shipper.ConnectionString = shipper.ConnectionString ?? connectionString;
            }
            result = executeIfFound(transformer, validator, result, logger, "validator", transformer?.ToType.FullName);
            result = executeIfFound(validator, shipper, result, logger, "shipper", transformer?.ToType.FullName);
            return result;
        }
        static ILogger getLogger() {
            return (ILogger)instantiators.FirstOrDefault(i => i.MapType == MapType.Logger).NewObject();
        }
        static IValidator getValidator(Type type) {
            return (IValidator)instantiators.FirstOrDefault(i => i.MapType == MapType.Validator && i.IsTypeMatch(type));
        }
        static IImporter getImporter(Type type) {
            return (IImporter)instantiators.Where(i => i.MapType == MapType.Importer && i.IsTypeMatch(type));
        }

        static T findInstantiator<T>(Type type, MapType mapType) => (T)instantiators.FirstOrDefault(i => i.MapType == mapType && i.IsTypeMatch(type))?.NewObject();

        static Result executeIfFound(IExecutor previousExecutor, IExecutor executor, Result currentResult, ILogger logger, string whatIsBeingLookedFor, string typeName) {
            return previousExecutor == null || !currentResult.Success ? 
                        currentResult : 
                        executor?.Execute(currentResult.DataObject, logger) ?? 
                        new Result() {
                            DataObject = currentResult.DataObject,
                            Success = false,
                            Message = resultMessage(whatIsBeingLookedFor, typeName)
                        };
        }

        static string resultMessage(string whatIsBeingLookedFor, string typeName) => $"Failed to find {whatIsBeingLookedFor} interface for {typeName}.";

        static ITransform getTransformer<from>(string transformerFullClassName) =>
            (ITransform)instantiators?.FirstOrDefault(
                                                    i => i.MapType == MapType.Transformer && 
                                                    i.Type.FullName == transformerFullClassName)?.NewObject() ?? default(ITransform);           
        

        //static void fillList<T>(List<T> listToFill, MapType mapType) {
        //    if (listToFill.Count() == 0) {
        //        var assemblies = getAssemblies();
        //        foreach (var assembly in assemblies) {
        //            Interrogate(assembly, listToFill, mapType);
        //        }
        //    }
        //}

        public static void Interrogate<T>(T obj) => Interrogate(obj.GetType());
        public static void Interrogate(Type type) {            
            Interrogate(type.Assembly);
        }

        public static void Interrogate(Assembly assembly) {
            if (assemblyHasNotBeenInterrogated(assembly)) {
                var transformers = getTypes<ITransform>(assembly);
                var validators = getTypes<IValidator>(assembly);
                var importers = getTypes<IImporter>(assembly);
                var logger = getTypes<ILogger>(assembly).FirstOrDefault();
                instantiators.AddRange(transformers.Select(t => getInstantiator<ITransform>(t, MapType.Transformer)));
                instantiators.AddRange(validators.Select(t => getInstantiator<IValidator>(t, MapType.Validator)));
                instantiators.AddRange(importers.Select(t => getInstantiator<IImporter>(t, MapType.Importer)));
                instantiators.Add(getInstantiator<ILogger>(logger, MapType.Logger));

                //foreach (var item in transformers) {
                //    instantiators.Add(new Instantiator<ITransform>(item, MapType.Transformer));
                //}
                //foreach (var item in validators) {
                //    instantiators.Add(new Instantiator<IValidator>(item, MapType.Validator));
                //}

                //var items = assembly.GetTypes().Where(x => x.IsClass && !x.IsAbstract && x.GetInterfaces().ToList().FirstOrDefault(i => i == typeof(T)) != null).ToList();
                //foreach (var item in items) {
                //    var obj = Activator.CreateInstance(item);
                //    instantiators.Add(new Instantiator<T>(item, mapType));
                //    listToFill.Add((T)obj);
                //}
            }
        }
        static Instantiator<T> getInstantiator<T>(Type type, MapType mapType) => new Instantiator<T>(type, mapType);
        static List<Type> getTypes<T>(Assembly assembly) {
            return assembly.GetTypes().Where(x => x.IsClass && !x.IsAbstract && x.GetInterfaces().ToList().FirstOrDefault(i => i ==typeof(T)) != null).ToList();
        }
        //public static void Interrogate<T>(Assembly assembly, List<T> listToFill, MapType mapType) {
        //    if (assemblyHasNotBeenInterrogated(assembly, listToFill)) {
        //        var items = assembly.GetTypes().Where(x => x.IsClass && !x.IsAbstract && x.GetInterfaces().ToList().FirstOrDefault(i => i == typeof(T)) != null).ToList();
        //        foreach (var item in items) {
        //            var obj = Activator.CreateInstance(item);
        //            instantiators.Add(new Instantiator<T>(item, mapType));                    
        //            listToFill.Add((T)obj);
        //        }
        //    }
        //}
        static bool assemblyHasNotBeenInterrogated<T>(Assembly assembly, List<T> listToFill) => listToFill.FirstOrDefault(t => t.GetType().Assembly == assembly) == null;
        static bool assemblyHasNotBeenInterrogated(Assembly assembly) => instantiators.FirstOrDefault(t => t.Type.Assembly == assembly) == null;

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
