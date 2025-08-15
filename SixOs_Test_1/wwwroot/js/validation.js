// ===================== Helpers: Validate (return error string or "") =====================
function validateStudentId(studentId) {
    if (!studentId) {
        return 'Vui lòng nhập mã sinh viên';
    }
    if (/\s/.test(studentId)) {
        return 'Mã sinh viên không được chứa khoảng trắng';
    }
    return '';
}

function validateVietnameseName(name) {
    if (!name) {
        return 'Vui lòng nhập tên sinh viên';
    }
    const vietnameseNamePattern = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\-]+$/;
    const ok = vietnameseNamePattern.test(String(name));
    if (!ok) return 'Tên không hợp lệ, chỉ cho phép chữ cái, dấu và khoảng trắng';
    return '';
}

function validateTuition(value) {
    return (value === '' || value == null) ? 'Vui lòng điền học phí' : '';
}
function validateTutoring(value) {
    return (value === '' || value == null) ? 'Vui lòng điền phụ đạo' : '';
}


// ===================== UI Error Renderer (unique name) =====================
// renamed to renderFieldError to avoid collisions
function renderFieldError(domId, errorMessage) {
    const errorId = `${domId}Error`;

    const inputEl = document.getElementById(domId);
    const errorEl = document.getElementById(errorId);

    const hasErr = Boolean(errorMessage && String(errorMessage).trim() !== '');

    if (errorEl) {
        errorEl.textContent = hasErr ? errorMessage : '';
        errorEl.classList.toggle('hidden', !hasErr);
    }

    if (inputEl) {
        inputEl.classList.toggle('error-border', hasErr);
    }

    return hasErr; // true nếu có lỗi
}


// ===================== Form Validator (mapping + summary) =====================
function validateForm(formData) {
    let hasError = false;
    const errors = {};
    let firstErrorDom = null;

    const mapping = [
        { name: 'studentId', domId: 'studentId', validator: () => validateStudentId(formData.studentId) },
        { name: 'studentName', domId: 'studentName', validator: () => validateVietnameseName(formData.studentName) },
        { name: 'dateOfBirth', domId: 'dob', validator: () => (!formData.dateOfBirth ? 'Vui lòng chọn ngày sinh' : '') },
        { name: 'joinDate', domId: 'joinDate', validator: () => (!formData.joinDate ? 'Vui lòng chọn ngày vào đoàn' : '') },
        { name: 'province', domId: 'provinceInput', validator: () => (!formData.province ? 'Vui lòng chọn tỉnh thành' : '') },
        { name: 'district', domId: 'districtInput', validator: () => (!formData.district ? 'Vui lòng chọn quận huyện' : '') },
        { name: 'tuitionFee', domId: 'tuitionFee', validator: () => validateTuition(formData.tuitionFee) },
        { name: 'tutoringFee', domId: 'tutoringFee', validator: () => validateTutoring(formData.tutoringFee) }
    ];

    mapping.forEach(({ name, domId, validator }) => {
        const msg = validator() || '';
        errors[name] = msg;
        const fieldHasError = renderFieldError(domId, msg);
        if (fieldHasError) {
            if (!firstErrorDom) firstErrorDom = domId;
            hasError = true;
        }
    });

    if (firstErrorDom) {
        const el = document.getElementById(firstErrorDom);
        if (el && typeof el.focus === 'function') {
            el.focus();
        }
    }

    return !hasError;
}