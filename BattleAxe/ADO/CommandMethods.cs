using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace BattleAxe
{
    public static class CommandMethods
    {
        /// <summary>
        /// this will derive the parameters if this is a StoredProcedure type of command
        /// </summary>
        /// <param name="commandText"></param>
        /// <param name="connectionString"></param>
        /// <param name="commandType"></param>
        /// <returns></returns>
        public static SqlCommand GetCommand(this string commandText, string connectionString, CommandType commandType = CommandType.StoredProcedure)
        {
            connectionString = ConnectionMaintenance.ConnectionStringTimeout(connectionString);
            var found = cachedCommands.FirstOrDefault(o => o.Item1 == commandText && o.Item2 == connectionString);
            if (found == null)
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    var sqlCommand = new SqlCommand
                    {
                        CommandText = commandText,
                        CommandType = commandType
                    };
                    if (commandText.Length > 6)
                    {
                        if (commandText.ToLower().Substring(0, 6) == "select")
                        {
                            commandType = CommandType.Text;
                        }
                    }

                    if (commandType == CommandType.StoredProcedure)
                    {

                        var temp = new System.Data.SqlClient.SqlCommand
                        {
                            CommandText = commandText,
                            Connection = conn,
                            CommandType = CommandType.StoredProcedure
                        };
                        conn.Open();
                        System.Data.SqlClient.SqlCommandBuilder.DeriveParameters(temp);
                        foreach (System.Data.SqlClient.SqlParameter p in temp.Parameters)
                        {
                            var typeName = p.TypeName;
                            if (typeName != null && typeName.Count(c => c == '.') == 2)
                            {
                                typeName = typeName.Substring(typeName.IndexOf(".") + 1);
                            }
                            sqlCommand.Parameters.Add(new SqlParameter
                            {
                                Direction = p.Direction,
                                ParameterName = p.ParameterName,
                                SqlDbType = p.SqlDbType,
                                Size = p.Size,
                                Precision = p.Precision,
                                Scale = p.Scale,
                                SourceColumn = p.ParameterName.Replace("@", ""),
                                TypeName = typeName == null ? null : typeName
                            });
                            if (p.SqlDbType == SqlDbType.Structured)
                            {
                                addStructureFieldForParameter(sqlCommand, typeName, connectionString);
                            }
                        }
                        conn.Close();
                    }
                    else
                    {
                        sqlCommand.CommandType = CommandType.Text;
                        var regex = new System.Text.RegularExpressions.Regex("@\\w+");
                        var matches = regex.Matches(sqlCommand.CommandText);
                        foreach (System.Text.RegularExpressions.Match match in matches)
                        {
                            sqlCommand.Parameters.Add(new SqlParameter
                            {
                                ParameterName = match.Value,
                                SourceColumn = match.Value.Replace("@", "")
                            });
                        }
                    }
                    cachedCommands.Add(new Tuple<string, string, SqlCommand>(commandText, connectionString, sqlCommand));
                    sqlCommand.Connection = new SqlConnection(connectionString);
                    return sqlCommand;
                }
            }
            else
            {
                var sqlCommand = new SqlCommand { CommandText = found.Item1, Connection = new SqlConnection(found.Item2) };
                sqlCommand.CommandType = found.Item3.CommandType;
                foreach (SqlParameter item in found.Item3.Parameters)
                {
                    sqlCommand.Parameters.Add(new SqlParameter
                    {
                        Direction = item.Direction,
                        ParameterName = item.ParameterName,
                        SqlDbType = item.SqlDbType,
                        Size = item.Size,
                        Precision = item.Precision,
                        Scale = item.Scale,
                        SourceColumn = item.ParameterName.Replace("@", ""),
                        TypeName = item.TypeName
                    });
                }
                return sqlCommand;
            }
        }

        private static List<Tuple<string, string, SqlCommand>> m_cachedCommands = new List<Tuple<string, string, SqlCommand>>();
        internal static List<Tuple<string, string, SqlCommand>> cachedCommands
        {
            get { return m_cachedCommands; }
            set { m_cachedCommands = value; }
        }

        private static List<Tuple<SqlCommand, string, string>> m_StructureFields = new List<Tuple<SqlCommand, string, string>>();
        internal static List<Tuple<SqlCommand, string, string>> structureFields
        {
            get { return m_StructureFields; }
            set
            {
                m_StructureFields = value;
            }
        }

        private static void addStructureFieldForParameter(SqlCommand referenceCommand, string typeName, string connectionString)
        {
            var commandString =
@"select 
    c.name FieldName
from
    sys.table_types tt inner
join
sys.columns c on c.object_id = tt.type_table_object_id
where
    USER_NAME(tt.schema_id) + '.' + tt.name = '" + typeName + "'";

            using (var conn = new SqlConnection(connectionString))
            {
                using (var command = new SqlCommand(commandString, conn))
                {
                    conn.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string value = reader.GetString(0);
                            structureFields.Add(new Tuple<SqlCommand, string, string>(referenceCommand, typeName, value));
                        }
                    }
                }
            }

        }        
    }
}
