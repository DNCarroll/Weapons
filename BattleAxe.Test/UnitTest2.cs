using System;
using BattleAxe;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BattleAxe.Test {
    [TestClass]
    public class TestSelectUpdateDelete {

        public string ConnectionString { get; set; } = "Data Source=CEARVALL;Initial Catalog=testDatabase;Integrated Security=True";
        [TestMethod]
        public void TestInsert() {
            var newItem = new testTable { name = "new thing", value = "important" };
            "testTable_Update".GetCommand(ConnectionString).Execute(newItem);
            var item = $"SELECT * FROM testTable WHERE id ={newItem.id}".GetCommand(ConnectionString, System.Data.CommandType.Text).FirstOrDefault<testTable>();
            Assert.IsTrue(item != null && item.value == newItem.value && item.name == newItem.name);
        }

        [TestMethod]
        public void TestUpdate() {
            var item = "testTable_Get".GetCommand(ConnectionString).FirstOrDefault<testTable>();
            item.value = Guid.NewGuid().ToString();
            "testTable_Update".GetCommand(ConnectionString).Execute(item);
            var updateditem = $"SELECT * FROM testTable WHERE id ={item.id}".GetCommand(ConnectionString, System.Data.CommandType.Text).FirstOrDefault<testTable>();
            Assert.IsTrue(item != null && item.value == updateditem.value && item.name == updateditem.name);
        }

        [TestMethod]
        public void TestDelete() {
            var item = "testTable_Get".GetCommand(ConnectionString).FirstOrDefault<testTable>();
            "testTable_Delete".GetCommand(ConnectionString).Execute(item);
            var found = $"SELECT * FROM testTable WHERE id ={item.id}".GetCommand(ConnectionString, System.Data.CommandType.Text).FirstOrDefault<testTable>();
            Assert.IsTrue(found == null);
        }
    }

    public class testTable {
        public int id { get; set; }
        public string value { get; set; }
        public string name { get; set; }
    }
}
