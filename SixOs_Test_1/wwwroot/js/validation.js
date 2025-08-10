// Validate student ID (no whitespace)
function validateStudentId(studentId) {
  if (!studentId) {
    return 'Vui lòng nhập mã sinh viên';
  }
  if (studentId.includes(' ')) {
    return 'Mã sinh viên không được chứa khoảng trắng';
  }
  return '';
}
// Validate Vietnamese name
function validateVietnameseName(name) {
  if (!name) {
    return 'Vui lòng nhập tên sinh viên';
  }
  // Vietnamese name regex pattern
  // Allows Vietnamese characters, spaces, and hyphens
  const vietnameseNamePattern = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\-]+$/;
  if (!vietnameseNamePattern.test(name)) {
    return 'Tên không hợp lệ, chỉ cho phép chữ cái, dấu và khoảng trắng';
  }
  return '';
}
// Validate date format (dd-mm-yyyy)
function validateDateFormat(dateString) {
  if (!dateString || dateString.length !== 10) {
    return false;
  }
  // Check format
  const dateFormatPattern = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateFormatPattern.test(dateString)) {
    return false;
  }
  // Check if date is valid
  const [day, month, year] = dateString.split('-').map(Number);
  // Check month range
  if (month < 1 || month > 12) {
    return false;
  }
  // Check day range based on month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }
  return true;
}
// Display error message
function showError(inputId, errorMessage) {
  const errorElement = document.getElementById(`${inputId}Error`);
  const inputElement = document.getElementById(inputId);
  if (errorMessage) {
    errorElement.textContent = errorMessage;
    errorElement.classList.remove('hidden');
    inputElement.classList.add('error-border');
  } else {
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
    inputElement.classList.remove('error-border');
  }
  return !!errorMessage;
}
// Validate form
function validateForm(formData) {
  let hasError = false;
  // Validate student ID
  const studentIdError = validateStudentId(formData.studentId);
  hasError = showError('studentId', studentIdError) || hasError;
  // Validate student name
  const studentNameError = validateVietnameseName(formData.studentName);
  hasError = showError('studentName', studentNameError) || hasError;
  // Validate date of birth
  let dateOfBirthError = '';
  if (!formData.dateOfBirth) {
      dateOfBirthError = 'Vui lòng chọn ngày sinh';
  }
  hasError = showError('dob', dateOfBirthError) || hasError;
  // Validate join date
  let joinDateError = '';
  if (!formData.joinDate) {
    joinDateError = 'Vui lòng chọn ngày vào đoàn';
  }
    hasError = showError('jd', joinDateError) || hasError;

    let provinceError = '';
    if (!formData.province) {
        provinceError = 'Vui lòng chọn tỉnh thành';
    }
    hasError = showError('provinceInput', provinceError) || hasError;

    let districtError = '';
    if (!formData.district) {
        districtError = 'Vui lòng chọn quận huyện';
    }
    hasError = showError('districtInput', districtError) || hasError;

    let tuitionFeeError = '';
    if (!formData.tuitionFee) {
        tuitionFeeError = 'Vui lòng điền học phí';
    }
    hasError = showError('tuitionFee', tuitionFeeError) || hasError;

    let tutoringFeeError = '';
    if (!formData.tutoringFee) {
        tutoringFeeError = 'Vui lòng điền phụ đạo';
    }
    hasError = showError('tutoringFee', tutoringFeeError) || hasError;

  return !hasError;
}