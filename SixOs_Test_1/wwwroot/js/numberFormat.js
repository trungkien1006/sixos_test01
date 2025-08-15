class CurrencyMask {
    constructor(inputEl, opts = {}) {
        if (typeof inputEl === 'string') inputEl = document.getElementById(inputEl);
        if (!inputEl) throw new Error('input not found');

        this.input = inputEl;
        this.hidden = opts.hiddenInput
            ? (typeof opts.hiddenInput === 'string'
                ? document.getElementById(opts.hiddenInput)
                : opts.hiddenInput)
            : null;

        this.maxInteger = opts.maxDigits ?? 12;
        this.decimalPlaces = Number.isInteger(opts.decimalPlaces) ? opts.decimalPlaces : 2;
        this.decimalSep = opts.decimalSeparator ?? ',';
        this.thousandSep = opts.thousandSeparator ?? '.';
        this.allowNegative = !!opts.allowNegative;

        this._composing = false;
        this._prevDisplay = '';
        this._prevRaw = '';

        // IME
        this.input.addEventListener('compositionstart', () => { this._composing = true; });
        this.input.addEventListener('compositionend', () => { this._composing = false; this._onInput(); });

        // input events
        this.input.addEventListener('input', (e) => { if (!this._composing) this._onInput(e); });
        this.input.addEventListener('paste', (e) => this._onPaste(e));

        // init
        this._formatAndSync('', { caretDigits: null });
    }

    // --- utils caret ---
    _digitsBefore(display, pos) {
        let c = 0;
        for (let i = 0; i < Math.min(pos, display.length); i++) {
            if (/\d/.test(display[i])) c++;
        }
        return c;
    }

    _posForDigits(display, digits) {
        if (digits <= 0) return 0;
        let d = 0;
        for (let i = 0; i < display.length; i++) {
            if (/\d/.test(display[i])) {
                d++;
                if (d === digits) return i + 1;
            }
        }
        return display.length;
    }

    // --- LOGIC ---
    _displayToRaw(display) {
        if (!display) return '';
        let s = String(display);

        // Xử lý dấu âm
        let isNegative = false;
        if (this.allowNegative && s.startsWith('-')) {
            isNegative = true;
            s = s.slice(1);
        }

        // Chỉ giữ số và 2 loại dấu
        s = s.replace(/[^\d.,]/g, '');
        if (!s) return '';

        // Tìm dấu thập phân CUỐI CÙNG
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        const lastDecimalPos = Math.max(lastDot, lastComma);

        let decimalPos = -1;
        let hasDecimal = false;

        if (lastDecimalPos !== -1 && this.decimalPlaces > 0) {
            const afterDecimal = s.slice(lastDecimalPos + 1);
            const cleanAfter = afterDecimal.replace(/[^\d]/g, '');

            if (cleanAfter.length <= this.decimalPlaces) {
                decimalPos = lastDecimalPos;
                hasDecimal = true;
            }
        }

        let integerPart = '';
        let decimalPart = '';

        if (hasDecimal) {
            integerPart = s.slice(0, decimalPos);
            decimalPart = s.slice(decimalPos + 1);
        } else {
            integerPart = s;
        }

        // Làm sạch phần nguyên
        integerPart = integerPart.replace(/[^\d]/g, '');

        // Làm sạch phần thập phân
        decimalPart = decimalPart.replace(/[^\d]/g, '');

        // Tạo raw
        let raw = integerPart || '0';
        if (hasDecimal) {
            raw += '.' + decimalPart;
        }

        return (isNegative ? '-' : '') + raw;
    }

    _rawToDisplay(raw, keepTrailingDecimal = false) {
        if (!raw) return '';
        let s = String(raw);

        let isNegative = s.startsWith('-');
        if (isNegative) s = s.slice(1);

        let parts = s.split('.');
        let integerPart = parts[0] || '0';
        let decimalPart = parts[1] || '';

        integerPart = integerPart.replace(/\D/g, '');
        integerPart = integerPart.slice(0, this.maxInteger);
        integerPart = integerPart.replace(/^0+/, '') || '0';

        let displayInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSep);

        let result = (isNegative ? '-' : '') + displayInteger;

        if (this.decimalPlaces > 0) {
            decimalPart = decimalPart.replace(/\D/g, '').slice(0, this.decimalPlaces);

            if (decimalPart || keepTrailingDecimal) {
                result += this.decimalSep + decimalPart;
            }
        }
        return result;
    }

    _formatAndSync(value, opts = {}) {
        const { caretDigits = null, forceAfterDecimal = false, keepTrailingDecimal = false } = opts;

        const raw = this._displayToRaw(value);
        const display = this._rawToDisplay(raw, keepTrailingDecimal);

        console.log('Formatting:', { value, raw, display, keepTrailingDecimal }); // DEBUG

        this.input.value = display;
        if (this.hidden) {
            let cleanRaw = raw.replace(/^(-?)0+(?=\d)/, '$1');
            if (cleanRaw === '-') cleanRaw = '';
            this.hidden.value = cleanRaw;
        }

        if (forceAfterDecimal && this.decimalPlaces > 0) {
            const decimalPos = display.indexOf(this.decimalSep);
            if (decimalPos >= 0) {
                console.log('Setting cursor after decimal:', decimalPos + 1); // DEBUG
                setTimeout(() => this.input.setSelectionRange(decimalPos + 1, decimalPos + 1), 0);
            }
        } else if (caretDigits !== null) {
            const pos = this._posForDigits(display, caretDigits);
            console.log('Setting cursor at digits:', caretDigits, 'pos:', pos); // DEBUG
            setTimeout(() => this.input.setSelectionRange(pos, pos), 0);
        }

        this._prevDisplay = display;
        this._prevRaw = raw;

        return { raw, display };
    }

    _onInput(e) {
        const currentValue = this.input.value;
        console.log('onInput:', { currentValue, prevDisplay: this._prevDisplay, inputType: e.inputType, data: e.data }); // DEBUG

        if (currentValue === this._prevDisplay) {
            console.log('Value unchanged, skipping'); // DEBUG
            return;
        }

        const cursorPos = this.input.selectionStart ?? currentValue.length;
        const digitsBefore = this._digitsBefore(currentValue, cursorPos);

        const justTypedDecimal = !!(e &&
            e.inputType === 'insertText' &&
            (e.data === this.decimalSep || e.data === '.' || e.data === ','));

        console.log('justTypedDecimal:', justTypedDecimal); // DEBUG

        const currentRaw = this._displayToRaw(currentValue);
        const hadDecimal = this._prevRaw.includes('.');
        const hasDecimal = currentRaw.includes('.');
        const newDecimal = !hadDecimal && hasDecimal;

        const shouldMoveToDecimal = justTypedDecimal || newDecimal;

        console.log('shouldMoveToDecimal:', shouldMoveToDecimal); // DEBUG

        this._formatAndSync(currentValue, {
            caretDigits: digitsBefore,
            forceAfterDecimal: shouldMoveToDecimal,
            keepTrailingDecimal: justTypedDecimal
        });
    }

    _onPaste(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text') || '';
        console.log('onPaste:', pastedText); // DEBUG
        this._formatAndSync(pastedText, { caretDigits: null });
    }

    // Public API
    getValue() {
        return this._displayToRaw(this.input.value);
    }

    setValue(value) {
        this._formatAndSync(String(value ?? ''), { caretDigits: null });
    }

    clear() {
        this._formatAndSync('', { caretDigits: null });
    }

    static formatThousands(n, sep = '.') {
        if (n == null || n === '') return '';
        const s = String(n).replace(/^-/, '');
        const neg = String(n).startsWith('-') ? '-' : '';
        const p = s.split('.')[0].replace(/\D/g, '') || '0';
        return neg + p.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    }
}