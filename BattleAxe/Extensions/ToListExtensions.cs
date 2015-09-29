using System.Collections.Generic;
using System.Data.SqlClient;

namespace BattleAxe
{
    public static class ToListExtensions
    {
        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <param name="parameter"></param>
        /// <returns></returns>
        public static List<T> ToList<T>(this SqlCommand command, T parameter = null)
            where T : class, new()
        {
            List<T> ret = new List<T>();
            try
            {
                if (command.IsConnectionOpen())
                {
                    ParameterMethods.SetInputs(parameter, command);
                    executeReaderAndFillList(command, ret);
                    ParameterMethods.SetOutputs(parameter, command);
                }
            }
            catch
            {
                throw;
            }
            finally { command.CloseConnection(); }
            return ret;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="command"></param>
        /// <returns></returns>
        public static List<T> ToList<T>(this T parameter, SqlCommand command)
            where T : class, new()
        {
            return ToList<T>(command, parameter);
        }
        private static void executeReaderAndFillList<T>(SqlCommand command, List<T> ret) where T : class, new()
        {
            using (var reader = command.ExecuteReader())
            {
                var map = DataReaderMap.GetReaderMap(reader);
                while (reader.Read())
                {
                    T newObj = new T();
                    DataReaderMap.Set(reader, map, newObj);
                    ret.Add(newObj);
                }
            }
        }
    }
}
