using Microsoft.CSharp;
using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace BattleAxe
{
    public delegate object GetValue<T>(T obj, string propertyName)
        where T : class;
    public delegate void SetValue<T>(T obj, string propertyName, object value)
        where T : class;

    public static class Compiler
    {
        static Dictionary<Type, object> setMethods = new Dictionary<Type, object>();
        static Dictionary<Type, object> getMethods = new Dictionary<Type, object>();
        public static void SetValue<T>(this T obj, string propertyName, object value)
            where T : class
        {
            var type = typeof(T);
            if (setMethods.ContainsKey(type))
            {
                var found = (SetValue<T>)setMethods[typeof(T)];
                found(obj, propertyName, value);
            }
            else
            {
                var built = SetHelper.Value<T>(type);
                if (built != null)
                {
                    setMethods.Add(typeof(T), built);
                    built(obj, propertyName, value);
                }
            }
        }

        public static object GetValue<T>(this T obj, string propertyName)
            where T : class
        {
            var type = typeof(T);
            if (getMethods.ContainsKey(type))
            {
                var found = (GetValue<T>)getMethods[typeof(T)];
                return found(obj, propertyName);
            }
            else
            {
                var built = GetHelper.Value<T>(type);
                if (built != null)
                {
                    getMethods.Add(typeof(T), built);
                    return built(obj, propertyName);
                }
            }
            return null;
        }
        public static class SetHelper
        {
            static string caseStatement(string propertyName, string type, string convertMethod, string defaultValue)
            {
                var ret = "case \"{propertyName}\":";
                ret += "obj.{propertyName} = value is {type} ? ({type})value : value != null ? {convertMethod} : {defaultValue}; break;";
                ret = ret.Replace("{propertyName}", propertyName)
                         .Replace("{type}", type)
                         .Replace("{convertMethod}", convertMethod)
                         .Replace("{defaultValue}", defaultValue);
                return ret;
            }

            public static SetValue<T> Value<T>(Type type)
                where T : class
            {
                var classSet = getClass();
                var method = getSetMethod(type);
                // methods.AppendLine(method);
                if (method != null)
                {
                    classSet = classSet.Replace("{method}", method);
                    //ready to build it
                    MethodInfo function = createMethod(classSet, type);
                    var betterFunction = (SetValue<T>)Delegate.CreateDelegate(typeof(SetValue<T>), function);
                    return betterFunction;
                }
                return null;
            }

            static MethodInfo createMethod(string code, Type type)
            {
                CSharpCodeProvider provider = new CSharpCodeProvider();
                CompilerParameters parameters = new CompilerParameters();

                // Reference to System.Drawing library
                //parameters.ReferencedAssemblies.Add("System.Drawing.dll");
                // True - memory generation, false - external file generation
                parameters.GenerateInMemory = true;
                parameters.GenerateExecutable = false;
                // Add CSharpSimpleScripting.exe as a reference to Scripts.dll to expose interfaces
                List<Assembly> referencedAssemblies = new List<Assembly>();
                referencedAssemblies.Add(type.Assembly);
                //parameters.ReferencedAssemblies.Add(type.Assembly.Location);
                var interfaces = type.GetInterfaces();
                foreach (var i in interfaces)
                {
                    var found = referencedAssemblies.FirstOrDefault(a => a == i.Assembly);
                    if (found == null)
                    {
                        referencedAssemblies.Add(i.Assembly);
                    }
                }
                foreach (var a in referencedAssemblies)
                {
                    parameters.ReferencedAssemblies.Add(a.Location);
                }

                CompilerResults results = provider.CompileAssemblyFromSource(parameters, code);

                Type binaryFunction = results.CompiledAssembly.GetType("BattleAxe.SetMethods");
                return binaryFunction.GetMethod("SetValue");
            }

            static string getClass()
            {

                string ret = @"
            using System;
            namespace BattleAxe
            {
                public static class SetMethods 
                {
                    {method}
                }
            }";
                return ret;
            }

            static string getSetValue(string type)
            {

                string ret = @"
                    public static void SetValue({type} obj, string propertyName, object value)
                    {
                        switch (propertyName)
                        {
                            {caseStatements}
                            default:
                                break;
                        }
        	
                    }
         ";
                ret = ret.Replace("{type}", type);
                return ret;
            }

            static string getSetMethod(Type type)
            {
                var properties = type.GetProperties();
                var cases = new StringBuilder();

                var method = getSetValue(type.FullName);

                foreach (var property in properties)
                {
                    //only add sets that can
                    var setmethod = property.SetMethod;
                    if (setmethod != null && setmethod.IsPublic && property.Name != "Item")
                    {
                        var propertyName = property.Name;
                        var propertyType = property.PropertyType;
                        if (propertyType.Equals(typeof(int)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "int", "Convert.ToInt32(value)", "0"));
                        }
                        else if (propertyType.Equals(typeof(string)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "string", "Convert.ToString(value)", "System.String.Empty"));
                        }
                        else if (propertyType.Equals(typeof(bool)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "bool", "Convert.ToBoolean(value)", "false"));
                        }
                        else if (propertyType.Equals(typeof(double)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "double", "Convert.ToDouble(value)", "0"));
                        }
                        else if (propertyType.Equals(typeof(byte)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "byte", "Convert.ToByte(value)", "(byte)0"));
                        }
                        else if (propertyType.Equals(typeof(short)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "short", "Convert.ToInt16(value)", "(short)0"));
                        }
                        else if (propertyType.Equals(typeof(long)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "long", "Convert.ToInt64(value)", "0"));
                        }
                        else if (propertyType.Equals(typeof(Single)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "Single", "Convert.ToSingle(value)", "0"));
                        }
                        else if (propertyType.Equals(typeof(decimal)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "decimal", "Convert.ToDecimal(value)", "0"));
                        }
                        else if (propertyType.Equals(typeof(char)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "char", "Convert.ToChar(value)", "System.Char.MinValue"));
                        }
                        else if (propertyType.Equals(typeof(Guid)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "Guid", "new System.Guid(value.ToString())", "System.Guid.Empty"));
                        }
                        else if (propertyType.Equals(typeof(DateTime)))
                        {
                            cases.AppendLine(caseStatement(propertyName, "DateTime", "Convert.ToDateTime(value)", "System.DateTime.MinValue"));
                        }
                        else if (propertyType.IsEnum)
                        {
                            var typeName = propertyType.FullName;
                            var caseStatement = "case \"{propertyName}\":";
                            caseStatement += "obj.{propertyName} = ({type})System.Enum.Parse(typeof({type}), value.ToString()); break;";
                            caseStatement = caseStatement.Replace("{propertyName}", propertyName).Replace("{type}", typeName);
                            cases.AppendLine(caseStatement);
                        }
                        else if (propertyType.Equals(typeof(byte[])))
                        {
                            //dont really have an answer for this one yet
                            //we go through reader and it reads bytes
                            var typeName = propertyType.FullName;
                            var caseStatement = "case \"{propertyName}\":";
                            caseStatement += "obj.{propertyName} = value!=null && value is byte[] ? (byte[])value: null; break;";
                            caseStatement = caseStatement.Replace("{propertyName}", propertyName);
                            cases.AppendLine(caseStatement);
                        }
                        else if (propertyType.Equals(typeof(object)))
                        {
                            var caseStatement = "case \"{propertyName}\":";
                            caseStatement += "obj.{propertyName} = value; break;";
                            caseStatement = caseStatement.Replace("{propertyName}", propertyName);
                            cases.AppendLine(caseStatement);
                        }
                    }
                }
                if (cases.Length > 0)
                {
                    method = method.Replace("{caseStatements}", cases.ToString());
                    return method;
                }
                return null;
            }
        }

        public static class GetHelper
        {
            public static GetValue<T> Value<T>(Type type)
                where T : class
            {
                var classSet = getClass();
                var method = getGetMethod(type);
                // methods.AppendLine(method);
                if (method != null)
                {
                    classSet = classSet.Replace("{method}", method);
                    //ready to build it
                    MethodInfo function = createMethod(classSet, type);
                    var betterFunction = (GetValue<T>)Delegate.CreateDelegate(typeof(GetValue<T>), function);
                    return betterFunction;
                }
                return null;
            }

            static string getClass()
            {

                string ret = @"
            using System;
            namespace BattleAxe
            {
                public static class GetMethods 
                {
                    {method}
                }
            }";
                return ret;
            }

            static string getGetMethod(Type type)
            {
                var properties = type.GetProperties();
                var cases = new StringBuilder();

                var method = getGetValue(type.FullName);
                //only add properties that have get 
                //Item = the property index?
                foreach (var property in properties)
                {
                    var getmethod = property.GetMethod;
                    if (getmethod != null && getmethod.IsPublic && property.Name != "Item")
                    {
                        var propertyName = property.Name;
                        var propertyType = property.PropertyType;
                        if (propertyType.Equals(typeof(DateTime)))
                        {
                            cases.AppendLine("case \"{propertyName}\": return obj.{propertyName} == System.DateTime.MinValue ? null : (object)obj.{propertyName};".Replace("{propertyName}", propertyName));
                        }
                        else
                        {
                            cases.AppendLine("case \"{propertyName}\": return obj.{propertyName};".Replace("{propertyName}", propertyName));
                        }
                    }
                }
                if (cases.Length > 0)
                {
                    method = method.Replace("{caseStatements}", cases.ToString());
                    return method;
                }
                return null;
            }

            static string getGetValue(string type)
            {

                string ret = @"
                    public static object GetValue({type} obj, string propertyName)
                    {
                        switch (propertyName)
                        {
                            {caseStatements}
                            default:
                                return null;
                        }
        	
                    }
         ";
                ret = ret.Replace("{type}", type);
                return ret;
            }

            static MethodInfo createMethod(string code, Type type)
            {
                CSharpCodeProvider provider = new CSharpCodeProvider();
                CompilerParameters parameters = new CompilerParameters();

                // Reference to System.Drawing library
                //parameters.ReferencedAssemblies.Add("System.Drawing.dll");
                // True - memory generation, false - external file generation
                parameters.GenerateInMemory = true;
                parameters.GenerateExecutable = false;
                // Add CSharpSimpleScripting.exe as a reference to Scripts.dll to expose interfaces
                List<Assembly> referencedAssemblies = new List<Assembly>();
                referencedAssemblies.Add(type.Assembly);
                //parameters.ReferencedAssemblies.Add(type.Assembly.Location);
                var interfaces = type.GetInterfaces();
                foreach (var i in interfaces)
                {
                    var found = referencedAssemblies.FirstOrDefault(a => a == i.Assembly);
                    if (found == null)
                    {
                        referencedAssemblies.Add(i.Assembly);
                    }
                }
                foreach (var a in referencedAssemblies)
                {
                    parameters.ReferencedAssemblies.Add(a.Location);
                }

                CompilerResults results = provider.CompileAssemblyFromSource(parameters, code);

                Type binaryFunction = results.CompiledAssembly.GetType("BattleAxe.GetMethods");
                return binaryFunction.GetMethod("GetValue");
            }
        }
    }

}
