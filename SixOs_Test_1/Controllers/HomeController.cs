using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SixOs_Test_1.Models;

namespace SixOs_Test_1.Controllers
{
    public class HomeController : Controller
    {
        public HomeController()
        {
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}
