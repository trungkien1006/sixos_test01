// Global variables
let calendarVisible = false;
let selectedDate = null;
let currentMonth = new Date();

function initDatePicker() {
    console.log('Initializing DatePicker...');
    populateYearSelect();
    updateMonthYearSelects();
    generateCalendar();
    bindInputEvents();
    console.log('DatePicker initialized!');
}

function populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('yearSelect');

    for (let i = currentYear - 20; i <= currentYear + 20; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

function updateMonthYearSelects() {
    document.getElementById('monthSelect').value = currentMonth.getMonth();
    document.getElementById('yearSelect').value = currentMonth.getFullYear();
}

function formatDisplayDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function formatISODate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toggleDatePicker() {
    console.log('Toggle clicked, current state:', calendarVisible);
    const calendar = document.getElementById('calendar');

    if (calendarVisible) {
        console.log('Hiding calendar');
        calendar.style.display = 'none';
        calendarVisible = false;
    } else {
        console.log('Showing calendar');
        calendar.style.display = 'block';
        calendarVisible = true;
    }
    console.log('New state:', calendarVisible);
}

function hideDatePicker() {
    console.log('Hiding calendar via hideDatePicker');
    calendarVisible = false;
    document.getElementById('calendar').style.display = 'none';
}

function handleDateSelect(date) {
    selectedDate = date;
    document.getElementById('joinDate').value = formatDisplayDate(date);
    document.getElementById('joinDateISO').value = formatISODate(date);
    hideDatePicker();
    clearError();
}

function handleMonthChange(select) {
    const newMonth = parseInt(select.value);
    currentMonth = new Date(currentMonth.getFullYear(), newMonth, 1);
    generateCalendar();
}

function handleYearChange(select) {
    const newYear = parseInt(select.value);
    currentMonth = new Date(newYear, currentMonth.getMonth(), 1);
    generateCalendar();
}

function generateCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const calendarGrid = document.getElementById('calendarGrid');

    // Clear existing days (keep weekday headers)
    const existingDays = calendarGrid.querySelectorAll('.calendar-day, .empty-day');
    existingDays.forEach(day => day.remove());

    // Get first day of month and calculate starting day
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();

    // Get number of days in month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'w-8 h-8 empty-day';
        calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dayElement = document.createElement('div');

        // Check if this day is selected
        const isSelected = selectedDate &&
            selectedDate.getDate() === i &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

        dayElement.className = `w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm calendar-day ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200'
            }`;

        dayElement.textContent = i;
        dayElement.onclick = function () {
            handleDateSelect(date);
        };

        calendarGrid.appendChild(dayElement);
    }
}

function bindInputEvents() {
    const inputField = document.getElementById('joinDate');

    inputField.addEventListener('input', function (e) {
        const value = e.target.value;

        if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
            const [day, month, year] = value.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            if (date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day) {
                selectedDate = date;
                document.getElementById('joinDateISO').value = formatISODate(date);
                clearError();
                currentMonth = new Date(year, month - 1, 1);
                updateMonthYearSelects();
                generateCalendar();
            } else {
                selectedDate = null;
                document.getElementById('joinDateISO').value = '';
                showError('Invalid date');
            }
        } else if (value === 'dd-MM-yyyy' || value === '') {
            selectedDate = null;
            document.getElementById('joinDateISO').value = '';
            clearError();
        } else {
            selectedDate = null;
            document.getElementById('joinDateISO').value = '';
            if (value.length === 10) {
                showError('Invalid date format');
            } else {
                clearError();
            }
        }
    });

    inputField.addEventListener('focus', function () {
        if (this.value === 'dd-MM-yyyy') {
            this.value = '';
        }
    });

    inputField.addEventListener('blur', function () {
        if (!this.value) {
            this.value = 'dd-MM-yyyy';
        }
    });

    inputField.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            hideDatePicker();
        }
    });
}

function showError(message) {
    const errorElement = document.getElementById('joinDateError');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}
function clearError() {

    const errorElement = document.getElementById('joinDateError');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

// Close calendar when clicking outside
document.addEventListener('click', function (e) {
    const calendar = document.getElementById('calendar');
    const inputField = document.getElementById('joinDate');
    const calendarToggle = document.getElementById('calendarToggle');

    if (calendar && inputField && calendarToggle) {
        if (!calendar.contains(e.target) &&
            !inputField.contains(e.target) &&
            !calendarToggle.contains(e.target)) {
            hideDatePicker();
        }
    }
});