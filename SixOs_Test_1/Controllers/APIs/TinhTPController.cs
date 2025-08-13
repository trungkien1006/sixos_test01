using Microsoft.AspNetCore.Mvc;
using SixOs_Test_1.Models;
using Microsoft.EntityFrameworkCore;

namespace SixOs_Test_1.Controllers.APIs
{
    [ApiController]
    [Route("api/tinh-tp")]
    public class TinhTPController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TinhTPController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TinhTP>>> GetAll()
        {
            var provinces = await _context.TinhTP.OrderBy(p => p.TenTinhTP).ToListAsync();

            return Ok(provinces);
        }
    }
}
