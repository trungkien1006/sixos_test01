using Microsoft.AspNetCore.Mvc;
using SixOs_Test_1.Models;
using Microsoft.EntityFrameworkCore;

namespace SixOs_Test_1.Controllers.APIs
{
    [ApiController]
    [Route("api/quan-huyen")]
    public class QuanHuyenController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuanHuyenController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<QuanHuyen>>> GetByID(int id)
        {
            var districts = await _context.QuanHuyen.Where(p => p.IDTinhTP == id).ToListAsync();

            return Ok(districts);
        }
    }
}
