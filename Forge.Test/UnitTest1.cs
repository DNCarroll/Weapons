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
        [TestMethod]
        public void TestForFailure() {
            var someobject = new SomeobjectThatdoesntHaveTransformorImporter();
            Assert.IsTrue(!someobject.Process<SomeobjectThatdoesntHaveTransformorImporter, ToObject>(Action.Insert).Success);
        }
        [TestMethod]
        public void TestForFailWhenAlreadyLoaded() {
            var someobject = new SomeobjectThatdoesntHaveTransformorImporter();
            Service.Interrogate(new FromObject());
            Assert.IsTrue(!someobject.Process<SomeobjectThatdoesntHaveTransformorImporter, ToObject>(Action.Insert).Success);
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

    public class FromFromToTo2 : Transformer<FromObject, ToObject> {
        public override ToObject Transform(FromObject obj) {
            return new ToObject { ID = obj.ID, Name = obj.Name };
        }
    }
    public class SomeobjectThatdoesntHaveTransformorImporter {

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

    public class ToImporter2 : Importer<ToObject> {
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
