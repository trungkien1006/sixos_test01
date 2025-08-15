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

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateSinhVienDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var sv = new SinhVien
            {
                MaSV = dto.MaSV,
                TenSV = dto.TenSV,
                DiaChi = dto.DiaChi,    
                NgaySinh = dto.NgaySinh,
                NgayVaoDoan = dto.NgayVaoDoan,
                HocPhi = dto.HocPhi,
                PhuDao = dto.PhuDao,
                Active = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = null,
                DeletedAt = null // Mặc định không xóa
            };

            _context.SinhVien.Add(sv); // LINQ insert
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm sinh viên thành công", data = sv });
        }

        [HttpPost]
        public async Task<ActionResult<GetSinhVienResponseDTO>> GetAll([FromBody] GetSinhVienDTO dto)
        {
            // Tạo query gốc trước Select
            var query = _context.SinhVien
                .Where(p => p.DeletedAt == null); // Chỉ lấy SV chưa bị xóa

            // Filter không dấu
            if (!string.IsNullOrEmpty(dto.SearchValue) && !string.IsNullOrEmpty(dto.SearchType))
            {
                string searchValue = dto.SearchValue.ToLower();

                switch (dto.SearchType)
                {
                    case "MaSV":
                        query = query.Where(p => EF.Functions.Like(
                            EF.Functions.Collate(p.MaSV, "SQL_Latin1_General_CP1_CI_AI"),
                            $"%{searchValue}%"));
                        break;
                    case "TenSV":
                        query = query.Where(p => EF.Functions.Like(
                            EF.Functions.Collate(p.TenSV, "SQL_Latin1_General_CP1_CI_AI"),
                            $"%{searchValue}%"));
                        break;
                    case "DiaChi":
                        query = query.Where(p => EF.Functions.Like(
                            EF.Functions.Collate(p.DiaChi, "SQL_Latin1_General_CP1_CI_AI"),
                            $"%{searchValue}%"));
                        break;
                        // thêm các case khác nếu cần
                }
            }

            // Tính tổng
            int totalRecord = await query.CountAsync();

            // Phân trang và lấy dữ liệu sau khi filter
            int skip = (dto.Page - 1) * dto.Limit;
            var allData = await query
                .OrderBy(p => p.ID) // thêm sort để tránh skip/take lỗi
                .Skip(skip)
                .Take(dto.Limit)
                .Select(p => new
                {
                    ID = p.ID,
                    MaSV = p.MaSV,
                    TenSV = p.TenSV,
                    NgaySinh = p.NgaySinh,
                    NgayVaoDoan = p.NgayVaoDoan,
                    DiaChi = p.DiaChi,
                    HocPhi = p.HocPhi,
                    PhuDao = p.PhuDao,
                    Active = p.Active,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                })
                .ToListAsync();

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

            return new GetSinhVienResponseDTO
            {
                students = result,
                totalPages = (int)Math.Ceiling((double)totalRecord / dto.Limit)
            };
        }


    }
}
