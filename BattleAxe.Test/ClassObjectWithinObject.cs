using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BattleAxe.Test {
    [TestClass]
    public class ClassObjectWithinObject {
        [TestMethod]
        public void TestMethod1() {
            var setMethod = Compiler.SetMethod(new SomeObject());
            var getMethod = Compiler.GetMethod(new SomeObject());
            Assert.IsTrue(true);
        }
    }
    public class SomeObject {
        public int ID { get; set; }
        public string Name { get; set; }

        public SomeObject2 SomeInternalObject { get; set; }
    }

    public class SomeObject2 {
        public int id { get; set; }
        public string name { get; set; }

    }
}
