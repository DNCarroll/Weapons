using System;
using System.Data.SqlClient;

namespace BattleAxe
{
    public static class ExecuteExtensions
    {
        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <param name="command"></param>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static T Execute<T>(this SqlCommand command, T obj = null)
            where T : class
        {
            try
            {
                ParameterMethods.SetInputs(obj, command);
                if (command.IsConnectionOpen())
                {
                    command.ExecuteNonQuery();
                    ParameterMethods.SetOutputs(obj, command);
                }
                command.Connection.Close();
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return obj;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="command"></param>
        /// <returns></returns>
        public static T Execute<T>(this T obj, SqlCommand command)
            where T : class
        {
            return Execute(command, obj);
        }
    }
}
