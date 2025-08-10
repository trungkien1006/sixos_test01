document.addEventListener('DOMContentLoaded', function () {
    var provinces = []
    var districts = []

    function convertProvincesToDropDownOptions(data) {
        return data.map(item => ({
            id: item.id,
            code: item.maTinhTP,
            name: item.tenTinhTP,
        }));
    }

    function convertDistrictsToDropDownOptions(data) {
        return data.map(item => ({
            id: item.id,
            code: item.maQuanHuyen,
            name: item.tenQuanHuyen,
        }));
    }

    const districtDropdown = new SearchableDropdown('districtContainer', 'districtInput', 'districtDropdown', 'district', districts, null, true);

    function getDistrictsByProvinceId() {
        var provinceId = document.getElementById('province').value;

        $.ajax({
            url: `/api/quan-huyen/${provinceId}`,   // URL API cần gọi
            type: 'GET',              // Hoặc 'POST', 'PUT', 'DELETE'
            dataType: 'json',         // Kiểu dữ liệu trả về
            data: {                   // Dữ liệu gửi lên (nếu có)
            },
            success: function (response) {
                console.log("Dữ liệu nhận được:", response);

                districts = convertDistrictsToDropDownOptions(response)

                districtDropdown.setOptions(districts)
                
            },
            error: function (xhr, status, error) {
                console.error("Lỗi:", error);
            }
        });
    }

    $.ajax({
        url: '/api/tinh-tp',   // URL API cần gọi
        type: 'GET',              // Hoặc 'POST', 'PUT', 'DELETE'
        dataType: 'json',         // Kiểu dữ liệu trả về
        data: {                   // Dữ liệu gửi lên (nếu có)
        },
        success: function (response) {
            console.log("Dữ liệu nhận được:", response);

            provinces = convertProvincesToDropDownOptions(response);

            // Initialize province dropdown
            const provinceDropdown = new SearchableDropdown('provinceContainer', 'provinceInput', 'provinceDropdown', 'province', provinces, function (value) {
                // Reset district when province changes
                districtDropdown.setValue('');

                if (value) {
                    districtDropdown.enable();
                    getDistrictsByProvinceId(value);
                } else {
                    districtDropdown.disable();
                }
            });
        },
        error: function (xhr, status, error) {
            console.error("Lỗi:", error);
        }
    });

    //Initialize currency masks
    const tuitionInput = document.getElementById('tuitionFee');
    const tuitionHidden = document.getElementById('tuitionFeeHidden');
    const tuitionMask = new CurrencyMask(tuitionInput, {
        hiddenInput: tuitionHidden,
        maxDigits: 15  // allow up to 15 digits
    });

    const tutoringInput = document.getElementById('tutoringFee');
    const tutoringHidden = document.getElementById('tutoringFeeHidden');
    const tutoringMask = new CurrencyMask(tutoringInput, {
        hiddenInput: tutoringHidden,
        maxDigits: 15  // allow up to 15 digits
    });

  //Initialize date typing for date of birth
    const dobInput = document.getElementById('dob');
    const dobHidden = document.getElementById('dob_iso'); // optional
    const maskDOB = new DateMask(dobInput, { showPlaceholder: true, hiddenInput: dobHidden });

    const jdInput = document.getElementById('jd');
    const jdHidden = document.getElementById('jd_iso'); // optional
    const maskJD = new DateMask(jdInput, { showPlaceholder: true, hiddenInput: jdHidden });

  // Initialize date picker
    const datePicker = new DatePicker('jd', 'calendarToggle', 'calendar', 'jd_iso');

  // Initialize numeric inputs
  const numericInputs = ['tuitionFee', 'tutoringFee'];
  numericInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    input.addEventListener('input', function (e) {
      const value = e.target.value;
      // Allow only numbers and decimal point
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        // Valid input, do nothing
      } else {
        // Invalid input, revert to previous value
        e.target.value = e.target.value.slice(0, -1);
      }
    });
  });

  // Form submission
  const form = document.getElementById('studentForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Collect form data
        const formData = {
            studentId: document.getElementById('studentId').value,
            studentName: document.getElementById('studentName').value,
            dateOfBirth: document.getElementById('dob_iso').value,
            joinDate: document.getElementById('jd_iso').value,
            province: document.getElementById('province').value,
            district: document.getElementById('district').value,
            tuitionFee: document.getElementById('tuitionFeeHidden').value,
            tutoringFee: document.getElementById('tutoringFeeHidden').value
        };
        console.log('Form submitted:', formData);
        isValid = validateForm(formData)
        // Validate form
        // If valid, submit form
        if (isValid) {
            console.log('Form submitted:', formData);
            alert('Đã lưu thông tin thành công!');

            createStudent(formData);
    }
    });

    function createStudent(formData) {
        $.ajax({
            url: `/api/sinh-vien`,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',  // Quan trọng để gửi JSON
            data: JSON.stringify({
                MaSV: formData.studentId,
                TenSV: formData.studentName,
                NgaySinh: formData.dateOfBirth || null,
                NgayVaoDoan: formData.joinDate || null,
                IDTinhTP: formData.province ? parseInt(formData.province) : null,
                IDQuanHuyen: formData.district ? parseInt(formData.district) : null,
                HocPhi: formData.tuitionFee ? parseFloat(formData.tuitionFee) : null,
                PhuDao: formData.tutoringFee ? parseFloat(formData.tutoringFee) : null
            }),
            success: function (response) {
                console.log("Dữ liệu nhận được:", response);
                getStudents()
            },
            error: function (xhr, status, error) {
                console.error("Lỗi:", error);
            }
        });
    }

    function fillStudentTable(data) {
        const tbody = document.querySelector('#student-list tbody');
        tbody.innerHTML = ''; // Xóa hết nội dung cũ

        data.forEach(item => {
            // Format ngày dd-MM-yyyy
            const formatDate = (isoStr) => {
                if (!isoStr) return '';
                const d = new Date(isoStr);
                if (isNaN(d)) return '';
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };

            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-50');

            row.innerHTML = `
                <td class="border border-gray-300 px-4 py-2">${item.maSV}</td>
                <td class="border border-gray-300 px-4 py-2">${item.tenSV}</td>
                <td class="border border-gray-300 px-4 py-2">${formatDate(item.ngaySinh)}</td>
                <td class="border border-gray-300 px-4 py-2">${formatDate(item.ngayVaoDoan)}</td>
                <td class="border border-gray-300 px-4 py-2">${item.diaChi || ''}</td>
                <td class="border border-gray-300 px-4 py-2">${item.hocPhi?.toLocaleString() || ''}</td>
                <td class="border border-gray-300 px-4 py-2">${item.phuDao?.toLocaleString() || ''}</td>
            `;

            tbody.appendChild(row);
        });
    }

    function getStudents() {
        $.ajax({
            url: `/api/sinh-vien`,
            type: 'GET',
            dataType: 'json',
            data: {},
            success: function (response) {
                console.log("Dữ liệu nhận được:", response);

                fillStudentTable(response)
            },
            error: function (xhr, status, error) {
                console.error("Lỗi:", error);
            }
        });
    }

    getStudents()
});



