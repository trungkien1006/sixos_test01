using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SixOs_Test_1.Models;
using SixOs_Test_1.DTOs;

namespace SixOs_Test_1.Controllers.APIs
{
    [ApiController]
    [Route("api/sinh-vien")]
    public class SinhVienController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SinhVienController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSinhVienDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var sv = new SinhVien
            {
                MaSV = dto.MaSV,
                TenSV = dto.TenSV,
                IDTinhTP = dto.IDTinhTP,
                IDQuanHuyen = dto.IDQuanHuyen,
                NgaySinh = dto.NgaySinh,
                NgayVaoDoan = dto.NgayVaoDoan,
                HocPhi = dto.HocPhi,
                PhuDao = dto.PhuDao
            };

            _context.SinhVien.Add(sv); // LINQ insert
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm sinh viên thành công", data = sv });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SinhVien>>> GetAll()
        {
            var query = _context.SinhVien
            .GroupJoin(_context.TinhTP,
                sv => sv.IDTinhTP,
                tp => tp.ID,
                (sv, tps) => new { sv, tps })
            .SelectMany(
                x => x.tps.DefaultIfEmpty(),
                (x, tp) => new { x.sv, tp })
            .GroupJoin(_context.QuanHuyen,
                x => x.sv.IDQuanHuyen,
                qh => qh.ID,
                (x, qhs) => new { x.sv, x.tp, qhs })
            .SelectMany(
                x => x.qhs.DefaultIfEmpty(),
                (x, qh) => new
                {
                    x.sv.ID,
                    x.sv.MaSV,
                    x.sv.TenSV,
                    x.sv.NgaySinh,
                    x.sv.NgayVaoDoan,
                    DiaChi = ((qh != null ? qh.TenQuanHuyen : "") + " - " + (x.tp != null ? x.tp.TenTinhTP : "")).Trim(' ', '-'),
                    x.sv.HocPhi,
                    x.sv.PhuDao
                });


            var students = await query.ToListAsync();

            return Ok(students);
        }
    }
}
