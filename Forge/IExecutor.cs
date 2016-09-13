using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Forge {
    public interface IExecutor {
        Result Execute(object objectToShip, ILogger logger = null);
        Type Type { get; }
    }
}
