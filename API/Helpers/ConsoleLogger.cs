namespace API.Helpers;

public static class ConsoleLogger {
    public static void Error(string error) {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine(error);
        Console.ForegroundColor = ConsoleColor.Green;
    }
}
