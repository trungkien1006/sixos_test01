class CurrencyMask {
    constructor(input, opts = {}) {
        if (typeof input === 'string') input = document.getElementById(input);
        this.input = input;
        this.maxDigits = opts.maxDigits || 12;
        this.prefix = opts.prefix || '';
        this.suffix = opts.suffix || '';
        this.allowNegative = opts.allowNegative ?? false;
        this.hiddenInput = opts.hiddenInput || null;

        // prevent default input behavior and handle manually
        this.input.addEventListener('keydown', this._onKeyDown.bind(this));
        this.input.addEventListener('paste', this._onPaste.bind(this));
        this.input.addEventListener('blur', this._onBlur.bind(this));

        // set input attributes
        this.input.setAttribute('inputmode', 'numeric');
        this.input.setAttribute('autocomplete', 'off');
        this.input.setAttribute('spellcheck', 'false');

        // format initial value
        this._formatInput();
    }

    _formatNumber(numStr) {
        if (!numStr || numStr === '') return '';

        // clean: only digits and minus
        let cleaned = String(numStr).replace(/[^\d-]/g, '');

        // handle negative
        let isNegative = false;
        if (this.allowNegative && cleaned.startsWith('-')) {
            isNegative = true;
            cleaned = cleaned.substring(1);
        }

        if (!cleaned || cleaned === '0') return isNegative ? '-0' : '0';

        // remove leading zeros
        cleaned = cleaned.replace(/^0+/, '') || '0';

        // limit digits
        if (cleaned.length > this.maxDigits) {
            cleaned = cleaned.substring(0, this.maxDigits);
        }

        // add thousand separators
        const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return (isNegative ? '-' : '') + formatted;
    }

    _extractRawNumber(value) {
        return (value || '').replace(/[^\d-]/g, '');
    }

    _formatInput() {
        const raw = this._extractRawNumber(this.input.value);
        const formatted = this._formatNumber(raw);
        this.input.value = formatted;

        if (this.hiddenInput) {
            this.hiddenInput.value = raw.replace(/^-?0*/, '') || '';
        }
    }

    _onKeyDown(e) {
        // allow navigation keys
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab', 'Enter', 'Escape'];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
            // for backspace and delete, handle manually to maintain formatting
            if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                this._handleBackspaceDelete(e.key);
            }
            return;
        }

        // handle digits
        if (/^\d$/.test(e.key)) {
            e.preventDefault();
            this._insertDigit(e.key);
            return;
        }

        // handle minus
        if (this.allowNegative && e.key === '-') {
            e.preventDefault();
            this._toggleNegative();
            return;
        }

        // block everything else
        e.preventDefault();
    }

    _insertDigit(digit) {
        const currentValue = this.input.value;
        const caretPos = this.input.selectionStart;
        const endPos = this.input.selectionEnd;

        // get raw number without formatting
        const raw = this._extractRawNumber(currentValue);

        // check digit limit
        const currentDigits = raw.replace(/[^\d]/g, '');
        if (currentDigits.length >= this.maxDigits) {
            return; // don't add more digits
        }

        // find where in the raw number to insert
        let insertPos = 0;
        let formattedPos = 0;

        // count digits before caret position
        for (let i = 0; i < caretPos && i < currentValue.length; i++) {
            if (/\d/.test(currentValue[i])) {
                insertPos++;
            }
        }

        // handle negative
        let isNegative = raw.startsWith('-');
        let rawDigits = raw.replace(/[^\d]/g, '');

        // insert digit at correct position
        const beforeInsert = rawDigits.substring(0, insertPos);
        const afterInsert = rawDigits.substring(insertPos);
        const newRawDigits = beforeInsert + digit + afterInsert;

        // format and update
        const newRaw = (isNegative ? '-' : '') + newRawDigits;
        const formatted = this._formatNumber(newRaw);
        this.input.value = formatted;

        // update hidden input
        if (this.hiddenInput) {
            this.hiddenInput.value = newRaw.replace(/^-?0*/, '') || '';
        }

        // calculate new caret position
        let newCaretPos = 0;
        let digitCount = 0;
        const targetDigits = insertPos + 1;

        for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {
                digitCount++;
                if (digitCount === targetDigits) {
                    newCaretPos = i + 1;
                    break;
                }
            }
        }

        if (digitCount < targetDigits) {
            newCaretPos = formatted.length;
        }

        setTimeout(() => {
            this.input.setSelectionRange(newCaretPos, newCaretPos);
        }, 0);
    }

    _handleBackspaceDelete(key) {
        const currentValue = this.input.value;
        const caretPos = this.input.selectionStart;
        const endPos = this.input.selectionEnd;

        if (caretPos !== endPos) {
            // has selection - delete selected digits
            let newValue = '';
            let digitCount = 0;

            for (let i = 0; i < currentValue.length; i++) {
                if (i < caretPos || i >= endPos) {
                    newValue += currentValue[i];
                } else if (/\d/.test(currentValue[i])) {
                    // skip selected digits
                }
            }

            const raw = this._extractRawNumber(newValue);
            const formatted = this._formatNumber(raw);
            this.input.value = formatted;

            if (this.hiddenInput) {
                this.hiddenInput.value = raw.replace(/^-?0*/, '') || '';
            }

            setTimeout(() => {
                this.input.setSelectionRange(caretPos, caretPos);
            }, 0);
            return;
        }

        // no selection - delete one character
        let targetPos = caretPos;
        if (key === 'Backspace') {
            targetPos = Math.max(0, caretPos - 1);
        }

        // find digit to delete
        let digitIndex = -1;
        let digitCount = 0;

        for (let i = 0; i <= targetPos && i < currentValue.length; i++) {
            if (/\d/.test(currentValue[i])) {
                if (key === 'Backspace' && i < caretPos) {
                    digitIndex = digitCount;
                } else if (key === 'Delete' && i >= caretPos) {
                    digitIndex = digitCount;
                    break;
                }
                digitCount++;
            }
        }

        if (digitIndex >= 0) {
            const raw = this._extractRawNumber(currentValue);
            const isNegative = raw.startsWith('-');
            let rawDigits = raw.replace(/[^\d]/g, '');

            // remove digit at index
            rawDigits = rawDigits.substring(0, digitIndex) + rawDigits.substring(digitIndex + 1);

            const newRaw = (isNegative && rawDigits ? '-' : '') + rawDigits;
            const formatted = this._formatNumber(newRaw);
            this.input.value = formatted;

            if (this.hiddenInput) {
                this.hiddenInput.value = newRaw.replace(/^-?0*/, '') || '';
            }

            // set caret position
            let newCaretPos = 0;
            let newDigitCount = 0;

            for (let i = 0; i < formatted.length; i++) {
                if (/\d/.test(formatted[i])) {
                    if (newDigitCount === digitIndex) {
                        newCaretPos = i;
                        break;
                    }
                    newDigitCount++;
                }
                newCaretPos = i + 1;
            }

            setTimeout(() => {
                this.input.setSelectionRange(newCaretPos, newCaretPos);
            }, 0);
        }
    }

    _toggleNegative() {
        const raw = this._extractRawNumber(this.input.value);
        let newRaw;

        if (raw.startsWith('-')) {
            newRaw = raw.substring(1);
        } else if (raw && raw !== '0') {
            newRaw = '-' + raw;
        } else {
            return; // don't toggle for empty or zero
        }

        const formatted = this._formatNumber(newRaw);
        this.input.value = formatted;

        if (this.hiddenInput) {
            this.hiddenInput.value = newRaw.replace(/^-?0*/, '') || '';
        }
    }

    _onPaste(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const digits = pastedText.replace(/\D/g, '');

        if (digits) {
            const limitedDigits = digits.substring(0, this.maxDigits);
            const formatted = this._formatNumber(limitedDigits);
            this.input.value = formatted;

            if (this.hiddenInput) {
                this.hiddenInput.value = limitedDigits;
            }
        }
    }

    _onBlur() {
        this._formatInput();
    }

    // Public methods
    getValue() {
        return this._extractRawNumber(this.input.value).replace(/^-?0*/, '') || '';
    }

    getFormattedValue() {
        return this.input.value;
    }

    setValue(value) {
        const raw = this._extractRawNumber(String(value));
        const formatted = this._formatNumber(raw);
        this.input.value = formatted;

        if (this.hiddenInput) {
            this.hiddenInput.value = raw.replace(/^-?0*/, '') || '';
        }
    }

    clear() {
        this.input.value = '';
        if (this.hiddenInput) {
            this.hiddenInput.value = '';
        }
    }

    static formatCurrency(number, opts = {}) {
        const instance = new CurrencyMask(document.createElement('input'), opts);
        return instance._formatNumber(String(number));
    }

    static parseCurrency(formatted) {
        const cleaned = (formatted || '').replace(/[^\d-]/g, '');
        return cleaned.replace(/^-?0*/, '') || '';
    }
}