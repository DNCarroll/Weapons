using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace BattleAxe
{
    public static class UpdateExtensions
    {
        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer.
        /// beware this has no error trapping so make sure to trap your errors 
        /// </summary>
        /// <param name="command"></param>
        /// <param name="objs"></param>
        /// <returns></returns>
        public static List<T> Update<T>(this SqlCommand command, List<T> objs)
            where T : class
        {
            try
            {
                if (command.IsConnectionOpen())
                {
                    foreach (var obj in objs)
                    {
                        ParameterMethods.SetInputParameters(obj, command);
                        command.ExecuteNonQuery();
                        ParameterMethods.SetOutputParameters(obj, command);
                    }
                }
                command.CloseConnection();
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.CloseConnection();
            }
            return objs;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer.
        /// beware this has no error trapping so make sure to trap your errors 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="objs">the objects that you want to update with the provided command</param>
        /// <param name="command"></param>
        public static void Update<T>(this List<T> objs, SqlCommand command)
            where T : class
        {
            Update(command, objs);
        }
    }
}
