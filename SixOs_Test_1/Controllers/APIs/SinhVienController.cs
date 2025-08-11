using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SixOs_Test_1.DTOs;
using SixOs_Test_1.Models;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text.Json;

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

        [HttpPost("/create")]
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

        [HttpPost]
        public async Task<ActionResult<GetSinhVienResponseDTO>> GetAll([FromBody] GetSinhVienDTO dto)
        {
            // Tạo query cơ bản
            var baseQuery = _context.SinhVien
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
                        ID = x.sv.ID,
                        MaSV = x.sv.MaSV,
                        TenSV = x.sv.TenSV,
                        NgaySinh = x.sv.NgaySinh,
                        NgayVaoDoan = x.sv.NgayVaoDoan,
                        DiaChi = ((qh != null ? qh.TenQuanHuyen : "") + " - " + (x.tp != null ? x.tp.TenTinhTP : "")),
                        HocPhi = x.sv.HocPhi,
                        PhuDao = x.sv.PhuDao
                    });

            // Filter
            if (!string.IsNullOrEmpty(dto.SearchValue) && !string.IsNullOrEmpty(dto.SearchType))
            {
                string searchValue = dto.SearchValue.ToLower();
                baseQuery = baseQuery.Where($"{dto.SearchType}.ToLower().Contains(@0)", searchValue);
            }

            // Tính tổng
            int totalRecord = await baseQuery.CountAsync();

            // Phân trang và lấy dữ liệu
            int skip = (dto.Page - 1) * dto.Limit;
            var allData = await baseQuery.Skip(skip).Take(dto.Limit).ToListAsync();

            // Tạo select động bằng reflection
            var result = allData.Select(item =>
            {
                var dict = new Dictionary<string, object>();
                var itemType = item.GetType();

                foreach (var column in dto.Columns)
                {
                    var property = itemType.GetProperty(column);
                    if (property != null)
                    {
                        dict[column] = property.GetValue(item);
                    }
                }
                return dict;
            }).ToList();

            return (new GetSinhVienResponseDTO
            {
                students = result, // Cast về kiểu SinhVien nếu cần
                totalPages = (int)Math.Ceiling((double)totalRecord / dto.Limit)
            });
        }
    }
}
