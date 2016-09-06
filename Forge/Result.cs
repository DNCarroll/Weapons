namespace Forge {
    public class Result<T> {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T DataObject { get; set; }
        public System.Exception Exception { get; set; }
    }
}
