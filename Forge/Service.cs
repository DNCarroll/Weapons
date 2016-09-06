using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Forge {
    public enum Action {
        Insert,
        Update
    }
    public static class Service {
        static List<IImporter> _importers = new List<IImporter>();
        static List<ITransform> _transformers = new List<ITransform>();
        
        static Service() {
            fillList(_importers);
            fillList(_transformers);
        }
        
        /// <summary>
        /// Transforms object from "FromType" to "ToType" given a transformer has been created somewhere in the 
        /// assemblies and imports the "to" object into the destination via the importer also given it has been
        /// created somewhere in the assemblies.  The Process returns a result that tells of success, the created
        /// "to" object, a string message, and exception.
        /// </summary>
        /// <typeparam name="from"></typeparam>
        /// <typeparam name="to"></typeparam>
        /// <param name="fromObject"></param>
        /// <param name="saveAction"></param>
        /// <param name="connectionString">If the connection string is left as null the processor presumes that the DataProcessor will determine connectionString on its own.</param>
        /// <returns></returns>
        public static Result<to> Process<from, to>(this from fromObject, Action saveAction, string connectionString = null) => Process<from, to>(getTransformer<from, to>(), getImporter<to>(), fromObject, saveAction, connectionString);
        public static Result<to> Update<from, to>(this from fromObject, string connectionString = null) => Process<from, to>(getTransformer<from, to>(), getImporter<to>(), fromObject, Action.Update, connectionString);
        public static Result<to> Insert<from, to>(this from fromObject, string connectionString = null) => Process<from, to>(getTransformer<from, to>(), getImporter<to>(), fromObject, Action.Insert, connectionString);
        public static Result<to> Process<from, to>(this ITransform<from, to> transformer, IImporter<to> importer, from fromObject, Action saveAction, string connectionString = null) {
            Result<to> results = new Result<to> { Success = false, Message = transformer == null ? "Transformer not found." : importer == null ? "Importer not found" : "" };
            to transformed = default(to);
            if (string.IsNullOrEmpty(results.Message)) {
                importer.ConnectionString = connectionString ?? importer.ConnectionString;
                results.Message = "Transformer found but transformation failed.";
                transformed = transformer.Transform(fromObject);
                if (transformed != null) {
                    results = saveAction == Action.Insert ? importer.Insert(transformed) : importer.Update(transformed);
                }
            }
            return results;
        }

        static ITransform<from, to> getTransformer<from, to>() {
            var found = _transformers.FirstOrDefault(d => d.FromType == typeof(from) && d.ToType == typeof(to));
            if (found != null && found is ITransform<from, to>) {
                return (ITransform<from, to>)found;
            }
            return null;
        }

        static IImporter<to> getImporter<to>() {
            var found = _importers.FirstOrDefault(d => d.Type == typeof(to));
            if (found != null && found is IImporter<to>) {
                return (IImporter<to>)found;
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
            Interrogate(type.Assembly, _transformers);
            Interrogate(type.Assembly, _importers);
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
    }
}
