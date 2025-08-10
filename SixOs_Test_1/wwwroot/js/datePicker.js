function pad2(n) { return String(n).padStart(2, '0'); }

function formatDateForDisplay(date) { // Date -> "dd-MM-yyyy"
    const d = pad2(date.getDate()), m = pad2(date.getMonth() + 1), y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

function dateToISO(date) { // Date -> "yyyy-mm-dd"
    const d = pad2(date.getDate()), m = pad2(date.getMonth() + 1), y = date.getFullYear();
    return `${y}-${m}-${d}`;
}

function parseDisplayToDate(str) { // "dd-MM-yyyy" or "dd/MM/yyyy" -> Date or null
    if (!str) return null;
    const parts = str.trim().replace(/\//g, '-').split('-');
    if (parts.length !== 3) return null;
    const d = Number(parts[0]), m = Number(parts[1]), y = Number(parts[2]);
    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
}

function parseISOToDate(iso) { // "yyyy-mm-dd" -> Date or null
    if (!iso) return null;
    const parts = iso.split('-');
    if (parts.length !== 3) return null;
    const y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
}

// Basic display formatter while typing for "dd-MM-yyyy"
function formatDateInput(raw) {
    // keep only digits and dashes, then insert dashes at 2 and 5
    const digits = raw.replace(/[^\d-]/g, '').replace(/-+/g, '-').slice(0, 10);
    const cleanDigits = digits.replace(/-/g, '');
    const p1 = cleanDigits.slice(0, 2);
    const p2 = cleanDigits.slice(2, 4);
    const p3 = cleanDigits.slice(4, 8);
    let out = p1;
    if (p2) out += '-' + p2;
    if (p3) out += '-' + p3;
    return out;
}

function validateDateFormat(str) { // expects dd-MM-yyyy
    return parseDisplayToDate(str) !== null;
}


// DatePicker class
class DatePicker {
    constructor(inputId, toggleId, calendarId, hiddenId) {
        this.input = document.getElementById(inputId);
        this.toggle = toggleId ? document.getElementById(toggleId) : null;
        this.calendar = document.getElementById(calendarId);
        this.hidden = hiddenId ? document.getElementById(hiddenId) : null;
        this.currentMonth = new Date();
        this.selectedDate = ''; // store in display format "dd-MM-yyyy"
        this._boundOnNativeInput = this._onNativeInput.bind(this);
        this.init();
    }

    init() {
        if (!this.input) throw new Error('input element not found');
        if (!this.calendar) throw new Error('calendar element not found');

        // If native date input, listen to 'change' to pick up native picker
        if (this.input.type === 'date') {
            this.input.addEventListener('change', this._boundOnNativeInput);
        } else {
            // text input -> format while typing
            this.input.addEventListener('input', (e) => {
                const formatted = formatDateInput(e.target.value);
                e.target.value = formatted;
            });
            this.input.addEventListener('blur', () => {
                const v = this.input.value;
                if (v.length === 10 && validateDateFormat(v)) {
                    this.selectedDate = v;
                    const dt = parseDisplayToDate(v);
                    this.currentMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);
                    this.renderCalendar();
                    // Update hidden input
                    this.updateHiddenInput(dt);
                } else {
                    // restore previous selectedDate if invalid
                    this.input.value = this.selectedDate || '';
                }
            });
        }

        // toggle
        if (this.toggle) {
            this.toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCalendar();
            });
        }

        // calendar outside click closes
        document.addEventListener('click', (e) => {
            if (!this.calendar.contains(e.target) && e.target !== this.input && (!this.toggle || e.target !== this.toggle)) {
                this.hideCalendar();
            }
        });

        // initial render
        this.renderCalendar();
    }

    // handle native date input change (type="date")
    _onNativeInput(e) {
        const iso = e.target.value; // yyyy-mm-dd
        const dt = parseISOToDate(iso);
        if (dt) {
            const display = formatDateForDisplay(dt);
            this.selectedDate = display;
            this.currentMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);
            this.renderCalendar();
            // Update hidden input
            this.updateHiddenInput(dt);
            // keep input.value as ISO (native)
        } else {
            // cleared or invalid
            this.selectedDate = '';
            this.renderCalendar();
            // Clear hidden input
            if (this.hidden) this.hidden.value = '';
        }
    }

    // Update hidden input with selected date
    updateHiddenInput(dateObj) {
        if (this.hidden) {
            // Set hidden input value as ISO format (yyyy-mm-dd)
            this.hidden.value = dateObj ? dateToISO(dateObj) : '';
        }
    }

    toggleCalendar() {
        if (this.calendar.classList.contains('hidden')) this.showCalendar();
        else this.hideCalendar();
    }

    showCalendar() {
        this.calendar.classList.remove('hidden');
        this.renderCalendar();
    }

    hideCalendar() {
        this.calendar.classList.add('hidden');
    }

    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const monthYearDisplay = this.currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
        const calendarDays = this.generateCalendarDays();

        // build HTML safely
        let html = '';
        html += `<div class="calendar-header flex items-center justify-between px-2 py-2">
               <button type="button" class="calendar-nav-btn" data-action="prev" aria-label="Prev month">
                 ‹
               </button>
               <div class="calendar-month-year font-medium">${monthYearDisplay}</div>
               <button type="button" class="calendar-nav-btn" data-action="next" aria-label="Next month">
                 ›
               </button>
             </div>`;
        html += `<div class="calendar-weekdays grid grid-cols-7 text-center text-xs font-semibold px-2 pb-1">
               ${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => `<div>${d}</div>`).join('')}
             </div>`;
        html += `<div class="calendar-days grid grid-cols-7 gap-1 p-2">`;
        calendarDays.forEach(day => {
            const isSelected = this.isSelectedDate(day.date);
            const classes = ['calendar-day', 'text-center', 'py-2', day.isCurrentMonth ? '' : 'opacity-50', isSelected ? 'bg-indigo-600 text-white rounded' : 'hover:bg-gray-100 cursor-pointer'].join(' ');
            const dataDate = formatDateForDisplay(day.date); // dd-MM-yyyy
            html += `<div class="${classes}" data-date="${dataDate}" role="button" tabindex="0">${day.date.getDate()}</div>`;
        });
        html += `</div>`;
        html += `<div class="calendar-footer flex justify-between px-2 py-2">
               <button type="button" id="todayBtn" class="text-sm">Hôm nay</button>
               <button type="button" id="closeBtn" class="text-sm">Đóng</button>
             </div>`;

        this.calendar.innerHTML = html;

        // attach nav listeners
        const prev = this.calendar.querySelector('[data-action="prev"]');
        const next = this.calendar.querySelector('[data-action="next"]');
        if (prev) prev.addEventListener('click', () => this.prevMonth());
        if (next) next.addEventListener('click', () => this.nextMonth());
        const todayBtn = this.calendar.querySelector('#todayBtn');
        if (todayBtn) todayBtn.addEventListener('click', () => this.selectToday());
        const closeBtn = this.calendar.querySelector('#closeBtn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideCalendar());

        // days click
        this.calendar.querySelectorAll('.calendar-day').forEach(el => {
            el.addEventListener('click', (ev) => {
                const ds = el.getAttribute('data-date'); // dd-MM-yyyy
                this.selectDate(ds);
            });
            // keyboard
            el.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    el.click();
                }
            });
        });
    }

    generateCalendarDays() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay(); // 0 = Sun
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        const calendarDays = [];
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = daysFromPrevMonth; i > 0; i--) {
            calendarDays.push({ date: new Date(year, month - 1, prevMonthLastDay - i + 1), isCurrentMonth: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        const totalDaysToShow = 42;
        const remaining = totalDaysToShow - calendarDays.length;
        for (let i = 1; i <= remaining; i++) {
            calendarDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        return calendarDays;
    }

    isSelectedDate(date) {
        if (!this.selectedDate) return false;
        const dd = parseDisplayToDate(this.selectedDate);
        if (!dd) return false;
        return dd.getDate() === date.getDate() && dd.getMonth() === date.getMonth() && dd.getFullYear() === date.getFullYear();
    }

    prevMonth() {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
        this.renderCalendar();
    }
    nextMonth() {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
        this.renderCalendar();
    }
    selectToday() {
        const today = new Date();
        this.setDateFromDateObj(today);
        this.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.renderCalendar();
        this.hideCalendar();
    }

    // central setter for a Date object
    setDateFromDateObj(dateObj) {
        const display = formatDateForDisplay(dateObj); // dd-MM-yyyy
        this.selectedDate = display;

        // for type="date" set ISO or valueAsDate so native input accepts
        if (this.input.type === 'date') {
            if ('valueAsDate' in this.input) {
                this.input.valueAsDate = dateObj;
            } else {
                this.input.value = dateToISO(dateObj);
            }
        } else {
            // text input: show dd-MM-yyyy
            this.input.value = display;
        }

        // Update hidden input
        this.updateHiddenInput(dateObj);

        // dispatch change
        const event = new Event('change', { bubbles: true });
        this.input.dispatchEvent(event);
    }

    // string input in display format "dd-MM-yyyy"
    selectDate(dateString) {
        const dt = parseDisplayToDate(dateString);
        if (!dt) return;
        this.setDateFromDateObj(dt);
    }

    // public API: getValue returns ISO for type=date, display for text
    getValue() {
        if (this.input.type === 'date') {
            // return ISO
            return this.input.value || '';
        }
        return this.selectedDate || '';
    }

    // public API: getHiddenValue returns ISO format from hidden input
    getHiddenValue() {
        return this.hidden ? this.hidden.value : '';
    }

    // public API: setValue accepts "dd-MM-yyyy" or ISO "yyyy-mm-dd"
    setValue(value) {
        if (!value) {
            this.selectedDate = '';
            if (this.input.type === 'date') this.input.value = '';
            else this.input.value = '';
            // Clear hidden input
            if (this.hidden) this.hidden.value = '';
            this.renderCalendar();
            return;
        }
        // try ISO first
        let dt = parseISOToDate(value);
        if (!dt) dt = parseDisplayToDate(value);
        if (!dt) return; // invalid
        this.setDateFromDateObj(dt);
        this.currentMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);
        this.renderCalendar();
    }

} // end class