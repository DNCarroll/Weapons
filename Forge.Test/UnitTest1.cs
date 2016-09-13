using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;

namespace Forge.Test {
    [TestClass]
    public class TryTransformAndImport {
        [TestMethod]
        public void ShouldSucceedViaFullTranformerName() {
            var fromObject = new FromObject { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);            
            string transformerFullName = "Forge.Test.TransformerWithValidatorAndShipper";
            var result = transformerFullName.Process(fromObject);
            Assert.IsTrue(result.Success);
        }
       
        [TestMethod]
        public void ShouldSucceedViaObjectOnly() {
            var fromObject = new FromObject { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);
            var result = fromObject.Process();
            Assert.IsTrue(result.Success);
        }

        [TestMethod]
        public void ShouldNotFindATransformerViaFullname() {
            var fromObject = new FromObjectWithoutTransformer { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);
            string transformerFullName = "Forge.Test.TransformerWithValidatorAndShipper";
            var result = transformerFullName.Process(fromObject);
            Assert.IsTrue(!result.Success && result.Message == "Transformer not found for Forge.Test.FromObjectWithoutTransformer.");
        }

        [TestMethod]
        public void ShouldNotFindATransformerViaObjectOnly() {
            var fromObject = new FromObjectWithoutTransformer { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);
            var result = fromObject.Process();
            Assert.IsTrue(!result.Success && result.Message == "Transformer not found for Forge.Test.FromObjectWithoutTransformer.");
        }

        [TestMethod]
        public void ShouldNotFindAValidatorViaFullName() {
            var fromObject = new FromObject { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);
            string transformerFullName = "Forge.Test.TransformerWithoutValidator";
            var result = transformerFullName.Process(fromObject);
            Assert.IsTrue(!result.Success && result.Message == "Failed to find validator interface for Forge.Test.ToObjectDoesntHaveValidator.");
        }

        [TestMethod]
        public void ShouldNotFindAValidatorViaObject() {
            var fromObject = new FromObject { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);
            var result = fromObject.Process();
            Assert.IsTrue(!result.Success && result.Message == "Failed to find validator interface for Forge.Test.ToObjectDoesntHaveValidator.");
        }

        [TestMethod]
        public void ShouldNotFindAShipperViaFullName() {
            var fromObject = new FromObject { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);
            string transformerFullName = "Forge.Test.TransformerWithValidatorButWithoutShipper";
            var result = transformerFullName.Process(fromObject);
            Assert.IsTrue(!result.Success && result.Message == "Failed to find shipper interface for Forge.Test.ToObjectDoesntHaveShipper.");
        }

        public void ShouldNotFindAShipperViaObject() {
            var fromObject = new FromObject { ID = 1, Name = "some object" };
            Service.Interrogate(fromObject);
            var result = fromObject.Process();
            Assert.IsTrue(!result.Success && result.Message == "Failed to find shipper interface for Forge.Test.ToObjectDoesntHaveShipper.");
        }
    }

    public class FromObject {
        public int ID { get; set; }
        public string Name { get; set; }

    }

    public class FromObjectWithoutTransformer {
        public int ID { get; set; }
        public string Name { get; set; }

    }   

    public class ToObjectDoesntHaveValidator {
        public int ID { get; set; }
        public string Name { get; set; }
    }
     
    public class ToObjectDoesntHaveShipper {
        public int ID { get; set; }
        public string Name { get; set; }
    }

    public class ToObject {
        public int ID { get; set; }
        public string Name { get; set; }
    }

    public class TransformerWithValidatorAndShipper : Transformer<FromObject, ToObject> {
        public override Result Execute(FromObject obj, ILogger logger = null) {
            return new Result { DataObject = new ToObject { ID = obj.ID, Name = obj.Name }, Success = true };
        }
    }

    public class TransformerWithoutValidator : Transformer<FromObject, ToObjectDoesntHaveValidator> {
        public override Result Execute(FromObject obj, ILogger logger = null) {
            return new Result { DataObject = new ToObjectDoesntHaveValidator { ID = obj.ID, Name = obj.Name }, Success = true };
        }
    }

    public class TestValidator : Validator<ToObject> {
        public override Result Execute(ToObject objectToValidate, ILogger logger = null) {
            return new Result { DataObject = objectToValidate, Success = true };
        }
    }

    public class TestShipper : Shipper<ToObject> {
        public override Result Execute(ToObject objectToShip, ILogger logger = null) {
            return new Result { DataObject = objectToShip, Success = true };
        }
    }

    public class TransformerWithValidatorButWithoutShipper : Transformer<FromObject, ToObjectDoesntHaveShipper> {
        public override Result Execute(FromObject obj, ILogger logger = null) {
            return new Result { DataObject = new ToObjectDoesntHaveShipper { ID = obj.ID, Name = obj.Name }, Success = true } ;
        }
    }

    public class TestValidator2 : Validator<ToObjectDoesntHaveShipper> {
        public override Result Execute(ToObjectDoesntHaveShipper objectToValidate, ILogger logger = null) {
            return new Result { DataObject = objectToValidate, Success = true };
        }
    }

    public class Logger : ILogger {
        public void Error(Exception ex, string data = null, string dataType = null) {
            
        }

        public void Info(string message, string data = null, string dataType = null) {
            
        }
    }
}
