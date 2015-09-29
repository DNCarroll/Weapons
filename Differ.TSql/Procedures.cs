using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BattleAxe;

namespace Differ.TSql
{
    public static class Procedures
    {
        const string objectSelect = @"    SELECT 
		OBJECT_SCHEMA_NAME(o.id) SchemaName, 
		o.name ObjectName,
		o.id ID,
        s.[definition] Body,
		CASE xtype
			WHEN 'FN' THEN 1 
			WHEN 'IF' THEN 2
			WHEN 'P' THEN 3
			WHEN 'TF' THEN 4
			WHEN 'TR' THEN 5
			ELSE 0 END 
		DataBaseType
    FROM 
        sys.sql_modules s inner join
        sys.sysobjects o on s.object_id = o.id
    WHERE 
        xtype in ('FN', 'IF', 'P', 'TF', 'TR') AND
		s.definition IS NOT NULL AND 
        o.name NOT LIKE '%diagram%'
	ORDER BY 
		o.name;";        

        public static SqlCommand GetObjectCommand(string connectionString)
        {
            return Common.GetCommand(objectSelect, connectionString, System.Data.CommandType.Text);
        }

    }
}
