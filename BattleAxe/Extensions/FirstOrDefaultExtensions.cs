using System.Data.SqlClient;

namespace BattleAxe
{
    public static class FirstOrDefaultExtensions
    {
        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <param name="parameter"></param>
        /// <returns></returns>       
        public static T FirstOrDefault<T>(this SqlCommand command, T parameter = null)
            where T : class, new()
        {
            T newObj = null;
            try
            {
                if (command.IsConnectionOpen())
                {
                    ParameterMethods.SetInputs(parameter, command);
                    newObj = DataReaderMethods.GetFirst<T>(command);
                    ParameterMethods.SetOutputs(parameter, command);
                }
            }
            catch
            {
                throw;
            }
            finally
            {
                command.CloseConnection();
            }
            return newObj;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="command"></param>
        /// <returns></returns>
        public static T FirstOrDefault<T>(this T parameter, SqlCommand command)
            where T : class, new()
        {
            return command.FirstOrDefault(parameter);
        }
    }
}
