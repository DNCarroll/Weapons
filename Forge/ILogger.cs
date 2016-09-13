using System;

namespace Forge {
    public interface ILogger {
        void Error(Exception ex, string data = null, string dataType = null);
        void Info(string message, string data = null, string dataType = null);
    }
}
