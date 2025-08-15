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
            Active: {
                isChecked: true,
                display: "Trạng thái"
            },
            CreatedAt: {
                isChecked: true,
                display: "Ngày tạo"
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
        checkTableDivHeight()

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
            code: item.MaTinhTP,
            name: item.TenTinhTP,
            districts: item.QuanHuyen
        }));
    }

    // Convert API data to dropdown options for districts
    function convertDistrictsToDropDownOptions(data) {
        return data.map(item => ({
            code: item.MaQuanHuyen,
            name: item.TenQuanHuyen,
        }));
    }

    const districtDropdown = new SearchableDropdown('districtContainer', 'districtInput', 'districtDropdown', 'district', districts, null, true);

    function getDistrictsByProvinceId() {
        var provinceName = document.getElementById('province').value;

        console.log("Tên tỉnh thành:", provinceName);

        for (province of provinces) {
            if (province.name = provinceName) {
                districts = convertDistrictsToDropDownOptions(province.districts)

                districtDropdown.setOptions(districts)

                break;
            }
        }

        
    }

    function getProvinces() {
        fetch('data/province_and_district.json') // vì file ở public nên gọi trực tiếp tên file
            .then(response => {
                if (!response.ok) {
                    throw new Error("Không thể đọc file JSON");
                }
                return response.json(); // chuyển từ text sang object
            })
            .then(data => {
                console.log(data); // In: Kiên

                provinces = convertProvincesToDropDownOptions(data);

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
            })
            .catch(error => {
                console.error("Lỗi:", error);
            });
    }

    getProvinces()

    //Initialize currency masks
    const tuitionInput = document.getElementById('tuitionFee');
    const tuitionHidden = document.getElementById('tuitionFeeHidden');
    const tuitionMask = new CurrencyMask(tuitionInput, {
        maxDigits: 15,
        decimalPlaces: 0,
        decimalSeparator: ',',
        thousandSeparator: '.',
        allowNegative: false,
        hiddenInput: tuitionHidden,
    });

    const tutoringInput = document.getElementById('tutoringFee');
    const tutoringHidden = document.getElementById('tutoringFeeHidden');
    const tutoringMask = new CurrencyMask(tutoringInput, {
        maxDigits: 9,
        decimalPlaces: 2,
        decimalSeparator: ',',
        thousandSeparator: '.',
        allowNegative: true,
        hiddenInput: tutoringHidden,
    });

  //Initialize date typing for date of birth
    const dobInput = document.getElementById('dob');
    const dobHidden = document.getElementById('dob_iso'); // optional
    const maskDOB = new DateMask(dobInput, { showPlaceholder: true, hiddenInput: dobHidden });

    const jdInput = document.getElementById('joinDate');
    const jdHidden = document.getElementById('joinDateISO'); // optional
    const maskJD = new DateMask(jdInput, { showPlaceholder: true, hiddenInput: jdHidden });

  // Initialize date picker
    // Initialize when page loads
    initDatePicker();

  // Initialize numeric inputs
  //const numericInputs = ['tuitionFee', 'tutoringFee'];
  //numericInputs.forEach(inputId => {
  //  const input = document.getElementById(inputId);
  //  input.addEventListener('input', function (e) {
  //    const value = e.target.value;
  //    // Allow only numbers and decimal point
  //    const regex = /^[0-9]*\.?[0-9]*$/;
  //    if (value === '' || regex.test(value)) {
  //      // Valid input, do nothing
  //    } else {
  //      // Invalid input, revert to previous value
  //      e.target.value = e.target.value.slice(0, -1);
  //    }
  //  });
  //});

  // Form submission
    const form = document.getElementById('studentForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect & trim form data (important: trim to avoid "   " passing)
        const formData = {
            studentId: (document.getElementById('studentId')?.value ?? '').trim(),
            studentName: (document.getElementById('studentName')?.value ?? '').trim(),
            dateOfBirth: (document.getElementById('dob_iso')?.value ?? '').trim(),
            joinDate: (document.getElementById('joinDateISO')?.value ?? '').trim(),
            province: (document.getElementById('province')?.value ?? '').trim(),
            district: (document.getElementById('district')?.value ?? '').trim(),
            tuitionFee: (document.getElementById('tuitionFeeHidden')?.value ?? '').trim(),
            tutoringFee: (document.getElementById('tutoringFeeHidden')?.value ?? '').trim()
        };

        console.log('Form submitted (raw):', formData);

        const isValid = validateForm(formData);
        console.log('IsValid:', isValid);

        if (isValid) {
            console.log('FORM VALID -> proceed');
            alert('Đã lưu thông tin thành công!');
            createStudent(formData);
        } else {
            console.log('FORM INVALID -> blocked submit');
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
                DiaChi: formData.province + " - " + formData.district,
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

    function formatNumber(value, minDecimals = 0, maxDecimals = 2) {
        if (value === null || value === undefined || value === '') return '';

        let num = Number(value);
        if (isNaN(num)) return '';

        // Dùng Intl.NumberFormat cho chuẩn
        const formatter = new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: minDecimals,
            maximumFractionDigits: maxDecimals
        });

        return formatter.format(num);
    }


    function fillStudentTable(data) {
        const tbody = document.querySelector('#student-list tbody');
        tbody.innerHTML = ''; // Xóa hết nội dung cũ

        studentManagement.pagination.totalPages = data.totalPages

        data.students.forEach((item, index) => {
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

            var tableHeaderItem = `<th class="border border-gray-300 px-4 py-2 text-left">STT</th>`
            var tableBodyItem = `<td class="border border-gray-300 px-4 py-2 !text-left">${index + 1}</td>`

            for (const [key, value] of Object.entries(studentManagement.colOptions)) {
                if (value.isChecked) {
                    tableHeaderItem += `<th class="border border-gray-300 px-4 py-2 text-left">${value.display}</th>`

                    switch (key) {
                        case "MaSV": case "TenSV": case "DiaChi": {
                            tableBodyItem += `<td class="border border-gray-300 px-4 py-2 !text-left">${item[key] || ''}</td>`;
                            break;
                        }
                        case "HocPhi": {
                            tableBodyItem += `<td class="border border-gray-300 px-4 py-2 !text-right">${formatNumber(item[key], 0, 0) || ''}</td>`;
                            break;
                        }
                        case "PhuDao": {
                            tableBodyItem += `<td class="border border-gray-300 px-4 py-2 !text-right">${formatNumber(item[key], 2, 2) || ''}</td>`;
                            break;
                        }
                        case "Active": {
                            if (item[key]) {
                                tableBodyItem += `<td class="border border-gray-300 px-4 py-2 !text-left">
                                                    <button class="py-2 px-3 rounded-md text-white bg-green-600 hover:bg-green-800 mr-2 cursor-pointer">
                                                        Đang hoạt động
                                                    </button>
                                                </td>`;
                            } else {
                                tableBodyItem += `<td class="border border-gray-300 px-4 py-2 !text-left">
                                                    <button class="py-2 px-3 rounded-md text-white bg-red-600 hover:bg-red-800 mr-2 cursor-pointer">
                                                        Đã ẩn
                                                    </button>
                                                </td>`;
                            }

                            break;
                        }
                        case "NgaySinh": case "NgayVaoDoan": case "CreatedAt": {
                            tableBodyItem += `<td class="border border-gray-300 px-4 py-2 text-center">${formatDate(item[key])}</td>`;
                            break;
                        }
                    }
                }
            }

            tableHeaderItem += `<th class="border border-gray-300 px-4 py-2 text-left">Hành động</th>`

            tableBodyItem += `<td class="border border-gray-300 px-4 py-2">
                                <button class="py-2 px-3 rounded-md text-white bg-yellow-600 hover:bg-yellow-800 mr-2 cursor-pointer"><i class="fa-solid fa-pen"></i></button>
                                <button class="py-2 px-3 rounded-md text-white bg-red-600 hover:bg-red-800 mr-2 cursor-pointer"><i class="fa-solid fa-trash-can"></i></button>
                            </td>`

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

    function checkTableDivHeight() {
        const tableDiv = document.getElementById('table');
        const paginationDiv = document.getElementById('pagination');
        const paginationContainerDiv = document.getElementById('pagination-container');

        if (tableDiv.scrollHeight > window.innerHeight) {
            // A dài hơn viewport → B dính ở bottom
            paginationDiv.classList.add('fixed', 'bottom-0', 'left-0', 'right-0');
            paginationContainerDiv.classList.add('px-16', 'pb-2')
            paginationContainerDiv.classList.remove('py-2')
        } else {
            // A ngắn hơn viewport → B nằm ngay dưới A
            paginationDiv.classList.remove('fixed', 'bottom-0', 'left-0', 'right-0');
            paginationContainerDiv.classList.remove('px-16', 'pb-2')
            paginationContainerDiv.classList.add('py-2')
        }
    }
});



