using System;
using System.Data.SqlClient;

namespace BattleAxe
{
    public class SqlCommandCacheObject
    {

        private DateTime _ExpiresAt = DateTime.MaxValue;
        public DateTime ExpiresAt
        {
            get { return _ExpiresAt; }
            set
            {
                _ExpiresAt = value;
            }
        }

        public SqlCommandCacheObject(string commandText, string connectionString,  SqlCommand sqlCommand)
        {
            this.CommandText = commandText;
            this.ConnectionString = connectionString;
            this.SqlCommand = sqlCommand;
            this.Key = commandText + connectionString;
            if (CommandMethods.SqlCommandCacheTimeout != SqlCommandCacheTimeout.NeverExpires)
            {
                this.ExpiresAt = DateTime.Now.AddMinutes((int)CommandMethods.SqlCommandCacheTimeout);
            }
        }

        private string _Key;
        public string Key
        {
            get { return _Key; }
            set
            {
                _Key = value;
            }
        }

        private DateTime _Initialized = new DateTime();
        public DateTime Initialized
        {
            get { return _Initialized; }
            set
            {
                _Initialized = value;
            }
        }

        private string _ConnectionString;
        public string ConnectionString
        {
            get { return _ConnectionString; }
            set
            {
                _ConnectionString = value;
            }
        }

        private string _CommandText;
        public string CommandText
        {
            get { return _CommandText; }
            set
            {
                _CommandText = value;
            }
        }

        private SqlCommand _SqlCommand;
        public SqlCommand SqlCommand
        {
            get { return _SqlCommand; }
            set
            {
                _SqlCommand = value;
            }
        }
    }
}
