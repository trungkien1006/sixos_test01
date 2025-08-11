document.addEventListener('DOMContentLoaded', function () {
    var studentManagement = {
        searchFields: [
            {
                code: "TenSV",
                display: "Tên sinh viên",
            },
            {
                code: "DiaChi",
                display: "Địa chỉ",
            }
        ],
        colOptions: {
            MaSV: {
                isChecked: true,
                display: "Mã SV"
            },
            TenSV: {
                isChecked: true,
                display: "Tên SV"
            },
            NgaySinh: {
                isChecked: true,
                display: "Ngày sinh"
            },
            NgayVaoDoan: {
                isChecked: true,
                display: "Ngày vào đoàn"
            },
            DiaChi: {
                isChecked: true,
                display: "Địa chỉ"
            },
            HocPhi: {
                isChecked: true,
                display: "Học phí"
            },
            PhuDao: {
                isChecked: true,
                display: "Phụ đạo"
            },
        },
        limits: [
            {
                value: 5,
            },
            {
                value: 10,
            },
            {
                value: 15,
            },
            {
                value: 20,
            },
            {
                value: 30,
            },
            {
                value: 50,
            },
            {
                value: 75,
            },
            {
                value: 100,
            },
        ],
        searchData: "",
        pagination: {
            currentPage: 1,
            totalPages: 8,
        },
        currentSearchField: "TenSV",
        currentLimit: 5,
    }

    // thêm option cho limit select 
    var limitOptions = document.getElementById('limitOptions')

    // thêm event khi click vào item sẽ thay đổi trường seachField
    limitOptions.addEventListener('change', function () {
        studentManagement.currentLimit = limitOptions.value

        console.log("Select limit")
        getStudents(studentManagement)
    })

    var colOptionBtn = document.getElementById('colOptionBtn')
    var colOptionList = document.getElementById('colOptionList')

    //thêm event bật tắt menu toggle column
    colOptionBtn.addEventListener('click', function () {
        colOptionList.classList.toggle('hidden')
    })

    // gọi hàm get sinh viên khi nhấn nút tìm kiếm
    var searchBtn = document.getElementById('searchBtn')

    searchBtn.addEventListener('click', function () {

        console.log("Nút tìm kiếm")
        getStudents(studentManagement)
    })

    // gán event cho các nút trong chức năng phân trang
    var paginationToStartBtn = document.getElementById('paginationToStartBtn')
    var paginationToEndBtn = document.getElementById('paginationToStartBtn')
    var paginationToNextBtn = document.getElementById('paginationToStartBtn')
    var paginationToPrevBtn = document.getElementById('paginationToStartBtn')

    paginationToStartBtn.addEventListener('click', function () {
        if (studentManagement.pagination.currentPage != 1) {
            studentManagement.pagination.currentPage = 1

            console.log("Nút về 1 phân trang")
            getStudents(studentManagement)
        }
    })

    paginationToEndBtn.addEventListener('click', function () {
        if (studentManagement.pagination.currentPage != studentManagement.pagination.totalPages) {
            studentManagement.pagination.currentPage = studentManagement.pagination.totalPages

            console.log("Nút về 1 phân trang")
            getStudents(studentManagement)
        }
    })

    paginationToNextBtn.addEventListener('click', function () {
        if (studentManagement.pagination.currentPage != studentManagement.pagination.totalPages) {
            studentManagement.pagination.currentPage = studentManagement.pagination.currentPage + 1

            console.log("Nút tiến tới phân trang")
            getStudents(studentManagement)
        }
    })

    paginationToPrevBtn.addEventListener('click', function () {
        if (studentManagement.pagination.currentPage != 1) {
            studentManagement.pagination.currentPage = studentManagement.pagination.currentPage - 1

            console.log("Nút thụt lùi phân trang")
            getStudents(studentManagement)
        }
    })

    function initSearchLimitPagination(studentManagement) {
        // hiển thị các nút phân trang
        var paginationNumberField = document.getElementById('pagination-number-field')

        var paginationNumberFieldItem = ''

        var startPaginationBtn = studentManagement.pagination.currentPage - 1

        if (startPaginationBtn < 1) {
            startPaginationBtn = 1
        }

        if (studentManagement.pagination.currentPage == studentManagement.pagination.totalPages && studentManagement.pagination.totalPages > 2) {
            startPaginationBtn = studentManagement.pagination.currentPage - 2
        }

        for (let i = 0; i < 3; i++) {
            if (startPaginationBtn > studentManagement.pagination.totalPages) {
                break;
            }

            if (startPaginationBtn == studentManagement.pagination.currentPage) {
                paginationNumberFieldItem += `<a href="#" class="pagination-item inline-flex items-center px-3 py-2 text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 cursor-pointer
                                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                ${startPaginationBtn}
                                            </a>`
            } else {
                paginationNumberFieldItem += `<a href="#" class="pagination-item inline-flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                 ${startPaginationBtn}
                                            </a>`
            }

            startPaginationBtn++
        }

        paginationNumberField.innerHTML = paginationNumberFieldItem

        // thêm event click cho pagination item --> change data
        var paginationItems = document.querySelectorAll('.pagination-item')

        paginationItems.forEach(val => {
            val.addEventListener('click', function () {
                studentManagement.pagination.currentPage = Number(val.innerHTML)

                console.log("Nút số phân trang")
                getStudents(studentManagement)
            })
        })

      

        var limitOptionItemText = ''

        studentManagement.limits.forEach(item => {
            limitOptionItemText += `<option class="limit-option-item" value="${item.value}" ${item.value == studentManagement.currentLimit ? "selected" : ""}>${item.value}</option>`
        })

        limitOptions.innerHTML = limitOptionItemText

        // thay đổi trường searchData khi người dùng nhập vào ô input
        var searchInput = document.getElementById('searchInput')

        searchInput.addEventListener('input', function (e) {
            studentManagement.searchData = e.target.value.trim()
        })

        //thêm option cho search select
        var searchOptions = document.getElementById('searchOptions')

        var searchOptionItemText = ''

        studentManagement.searchFields.forEach(item => {
            searchOptionItemText += `<option class="search-option-item" value="${item.code}" ${item.code == studentManagement.currentSearchField ? "selected" : ""}>${item.display}</option>`
        })

        searchOptions.innerHTML = searchOptionItemText

        // thêm event khi click vào item sẽ thay đổi trường seachField
        searchOptions.addEventListener('change', function () {
            studentManagement.currentSearchField = searchOptions.value
        })

        //thêm các column mặc định của bảng vào toggle menu
        var colOptionListItemText = ''

        for (const [key, value] of Object.entries(studentManagement.colOptions)) {
            colOptionListItemText += `<div class="col-option-item flex justify-between px-6 py-3 hover:duration-300 duration-300 hover:bg-gray-100 cursor-pointer">
                            <input class="pointer-events-none cursor-not-allowed scale-150" type="checkbox" name="colOption" value="${key}" ${value.isChecked ? "checked" : ""}/>
                            <p id="rowName">${value.display}</p>
                        </div>`
        }

        colOptionList.innerHTML = colOptionListItemText

        // thêm event khi click vào item sẽ check checkbox
        var colOptionListItem = document.querySelectorAll('.col-option-item')

        colOptionListItem.forEach(val => {
            val.addEventListener('click', function () {
                if (val.children[0].checked) {
                    val.children[0].checked = false

                    studentManagement.colOptions[val.children[0].value].isChecked = false

                    console.log("Checkbox column")
                    getStudents(studentManagement)
                } else {
                    val.children[0].checked = true

                    studentManagement.colOptions[val.children[0].value].isChecked = true

                    console.log("Checkbox column")
                    getStudents(studentManagement)
                }
            })
        })
    }

    var provinces = []
    var districts = []

    // Convert API data to dropdown options
    function convertProvincesToDropDownOptions(data) {
        return data.map(item => ({
            id: item.id,
            code: item.maTinhTP,
            name: item.tenTinhTP,
        }));
    }

    // Convert API data to dropdown options for districts
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
            url: `/api/sinh-vien/create`,
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
                getStudents(studentManagement)
            },
            error: function (xhr, status, error) {
                console.error("Lỗi:", error);
            }
        });
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    function fillStudentTable(data) {
        const tbody = document.querySelector('#student-list tbody');
        tbody.innerHTML = ''; // Xóa hết nội dung cũ

        studentManagement.pagination.totalPages = data.totalPages

        data.students.forEach(item => {
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

            var tableHeader = document.getElementById('table-header')

            var tableHeaderItem = ``
            var tableBodyItem = ``

            for (const [key, value] of Object.entries(studentManagement.colOptions)) {
                if (value.isChecked) {
                    tableHeaderItem += `<th class="border border-gray-300 px-4 py-2 text-left">${value.display}</th>`

                    switch (key) {
                        case "MaSV": case "TenSV": case "DiaChi": {
                            tableBodyItem += `<td class="border border-gray-300 px-4 py-2 !text-left">${item[key] || ''}</td>`;
                            break;
                        }
                        case "HocPhi": case "PhuDao": {
                            tableBodyItem += `<td class="border border-gray-300 px-4 py-2 !text-right">${formatNumber(item[key]) || ''}</td>`;
                            break;
                        }
                        case "NgaySinh": case "NgayVaoDoan": {
                            tableBodyItem += `<td class="border border-gray-300 px-4 py-2 text-center">${formatDate(item[key])}</td>`;
                            break;
                        }
                    }
                }
            }

            row.innerHTML = tableBodyItem;

            tableHeader.innerHTML = tableHeaderItem 
            tbody.appendChild(row);
        });
    }

    function getStudents(studentManagement) {
        console.log(studentManagement)

        var columns = []

        for (const [key, value] of Object.entries(studentManagement.colOptions)) {
            if (value.isChecked) {
                columns.push(key)
            }
        }

        $.ajax({
            url: `/api/sinh-vien`,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',  // Quan trọng để gửi JSON
            data: JSON.stringify({
                searchValue: studentManagement.searchData,
                searchType: studentManagement.currentSearchField,
                page: studentManagement.pagination.currentPage,
                limit: studentManagement.currentLimit,
                columns: columns,
            }),
            success: function (response) {
                console.log("Dữ liệu nhận được:", response);

                fillStudentTable(response)

                document.getElementById('studentForm').reset();
                resetErrorField()
                districtDropdown.setValue('');
                districtDropdown.disable();

                initSearchLimitPagination(studentManagement)
            },
            error: function (xhr, status, error) {
                console.error("Lỗi:", error);
            }
        });
    }

    getStudents(studentManagement)

    // toggle modal
    var overlay = document.getElementById('overlay');
    var modal = document.getElementById('modal');
    var createButton = document.getElementById('createBtn');
    var closeButton = document.getElementById('closeBtn');

    overlay.addEventListener('click', function () {
        overlay.classList.add('hidden');
    })

    modal.addEventListener('click', function (e) {
        e.stopPropagation()
    })

    closeButton.addEventListener('click', function () {
        overlay.classList.add('hidden');
    })

    createButton.addEventListener('click', function () {
        overlay.classList.remove('hidden');

        document.getElementById('studentForm').reset();
        resetErrorField()

        districtDropdown.setValue('');
        districtDropdown.disable();
    });

    function resetErrorField() {
        var errorFields = document.querySelectorAll('.error-field')
        var inputFields = document.querySelectorAll('.input-field')

        inputFields.forEach(item => {
            item.classList.remove('error-border');
        })

        errorFields.forEach(item => {
            item.innerHTML = ""
        })
    }

    initSearchLimitPagination(studentManagement)
});



