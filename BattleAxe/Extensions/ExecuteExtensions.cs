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
        public static T Execute<T>(this SqlCommand command, T parameter = null)
            where T : class
        {
            try
            {
                ParameterMethods.SetInputs(parameter, command);
                if (command.IsConnectionOpen())
                {
                    command.ExecuteNonQuery();
                    ParameterMethods.SetOutputs(parameter, command);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return parameter;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="command"></param>
        /// <returns></returns>
        public static T Execute<T>(this T parameter, SqlCommand command)
            where T : class
        {
            return Execute(command, parameter);
        }
    }
}
