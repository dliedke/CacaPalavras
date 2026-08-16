// CacaPalavras é um jogo 100% estático (HTML/CSS/JS puro, sem build).
// Este host ASP.NET Core existe só para servir os arquivos de wwwroot/
// localmente com F5/debug no Visual Studio — não há API nem lógica de servidor.

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles(); // serve wwwroot/index.html em "/"
app.UseStaticFiles();

app.Run();
