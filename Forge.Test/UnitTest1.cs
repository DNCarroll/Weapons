using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Forge.Test {
    [TestClass]
    public class TryTransformAndImport {
        [TestMethod]
        public void Execute() {
            var fromObject = new FromObject { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);
            var result = fromObject.Process<FromObject, ToObject>(Action.Insert);
            Assert.IsTrue(result.Success);
        }
    }

    public class FromObject {
        public int ID { get; set; }
        public string Name { get; set; }

    }
    public class ToObject {
        public int ID { get; set; }
        public string Name { get; set; }
    }

    public class FromFromToTo : Transformer<FromObject, ToObject> {
        public override ToObject Transform(FromObject obj) {
            return new ToObject { ID = obj.ID, Name = obj.Name };
        }
    }

    public class ToImporter : Importer<ToObject> {
        public override string ConnectionString {
            get {
                return "";
            }

            set {                
            }
        }

        public override ToObject First(object id) {
            throw new NotImplementedException();
        }

        public override Result<ToObject> Insert(ToObject objectToInsert) {
            return new Result<ToObject> { DataObject = objectToInsert, Message = "Successfully imported", Success = true };
        }

        public override Result<ToObject> Update(ToObject objectToUpdate) {
            throw new NotImplementedException();
        }
    }

}
