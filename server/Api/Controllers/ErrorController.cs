using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
public class ErrorController : ControllerBase
{
    [Route("/error")]
    public IActionResult HandleError()
    {
        var exception = HttpContext.Features.Get<IExceptionHandlerFeature>()?.Error;

        Console.WriteLine(exception);

        return Problem(
            title: "An unexpected error occurred.",
            detail: exception?.Message,
            statusCode: StatusCodes.Status500InternalServerError
        );
    }
}