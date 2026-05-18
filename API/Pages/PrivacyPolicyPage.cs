namespace API.Pages;

internal static class PrivacyPolicyPage {
    public static string ReadHtml(IWebHostEnvironment environment) {
        var path = Path.Combine(environment.ContentRootPath, "Pages", "PrivacyPolicy.html");
        return File.ReadAllText(path);
    }
}
