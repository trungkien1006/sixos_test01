class DateMask {
    constructor(input, opts = {}) {
        if (typeof input === 'string') input = document.getElementById(input);
        this.input = input;
        this.showPlaceholder = opts.showPlaceholder ?? true; // true -> shows dd-MM-yyyy when empty
        this.hiddenInput = opts.hiddenInput ?? null; // optional hidden input[type=hidden|date]
        this.template = 'dd-MM-yyyy';
        // internal array of chars length 10 (including dashes)
        this.chars = this.template.split(''); // ['d','d','-','M','M','-','y','y','y','y']
        this.dashPositions = [2, 5];
        // bind
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onSelectStart = this._onSelectStart.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onPaste = this._onPaste.bind(this);
        this._onBlur = this._onBlur.bind(this);

        // init attributes & listeners
        this.input.setAttribute('maxlength', '10');
        this.input.setAttribute('inputmode', 'numeric');
        this.input.setAttribute('autocomplete', 'off');
        this.input.setAttribute('spellcheck', 'false');

        // important: intercept pointerdown BEFORE browser selection
        this.input.addEventListener('pointerdown', this._onPointerDown, { passive: false });
        this.input.addEventListener('selectstart', this._onSelectStart);
        this.input.addEventListener('focus', this._onFocus);
        this.input.addEventListener('keydown', this._onKeyDown);
        this.input.addEventListener('paste', this._onPaste);
        this.input.addEventListener('blur', this._onBlur);

        this._render();
    }

    // render value based on chars array
    _render() {
        this.input.value = this.chars.join('');
        // update hidden ISO if valid date
        if (this.hiddenInput) {
            const iso = this.getISO();
            this.hiddenInput.value = iso || '';
        }
    }

    // utility: map caret/display pos -> next editable index (0..9)
    _caretToIndex(pos) {
        if (pos <= 0) return 0;
        if (pos <= 1) return pos;
        if (pos === 2) return 2; // on dash -> treat as after pos1
        if (pos <= 4) return pos - 1;
        if (pos === 5) return 4;
        if (pos <= 9) return pos - 2;
        return 8;
    }
    _indexToCaret(idx) {
        // idx 0..7 (digits count) map to caret pos in display string
        // digit indices: 0->pos0,1->pos1,2->pos3,3->pos4,4->pos6,5->pos7,6->pos8,7->pos9
        if (idx <= 1) return idx;
        if (idx <= 3) return idx + 1;
        return idx + 2;
    }

    // find next editable digit index from caret pos
    _nextDigitIndexFromCaret(caret) {
        // compute digit index (0..8) where to insert next digit
        // we treat digits indices 0..7 (8 digits)
        const mapping = [0, 1, 2, 3, 4, 5, 6, 7]; // conceptual
        // convert caret to digitIndex
        const pos = caret;
        let idx;
        if (pos <= 1) idx = pos;
        else if (pos <= 4) idx = pos - 1;
        else idx = pos - 2;
        // clamp 0..8 (but digits only 0..7)
        idx = Math.max(0, Math.min(7, idx));
        // find first position >= idx that is placeholder or digit (we allow overwrite)
        return idx;
    }

    // prevent browser selection by pointerdown; compute caret pos
    _onPointerDown(e) {
        e.preventDefault(); // prevent browser from selecting
        this.input.focus();
        // compute approximate caret position based on click X
        const rect = this.input.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        // approximate char index 0..9
        const approx = Math.floor((clickX / rect.width) * 10);
        const digitIdx = this._caretToIndex(approx);
        const caretPos = this._indexToCaret(digitIdx);
        // schedule setSelectionRange after focus
        setTimeout(() => {
            try { this.input.setSelectionRange(caretPos, caretPos); }
            catch (e) { }
        }, 0);
    }

    _onSelectStart(e) {
        // stop default selection to avoid selecting whole template
        e.preventDefault();
    }

    _onFocus(e) {
        // place caret at first placeholder char (leftmost placeholder) or just after last entered digit
        // find leftmost non-digit placeholder (d/M/y)
        const s = this.chars.join('');
        // find first position that's letter (not digit and not '-')
        let pos = s.search(/[dMy]/i);
        if (pos === -1) {
            // all filled => caret at end
            pos = s.length;
        }
        setTimeout(() => {
            try { this.input.setSelectionRange(pos, pos); } catch (_) { }
        }, 0);
    }

    _onKeyDown(e) {
        const allowedNav = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
        if (allowedNav.includes(e.key)) return; // allow navigation
        if (e.ctrlKey || e.metaKey) return; // allow ctrl combos
        // digits
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const caret = this.input.selectionStart;
            // compute insert index (digit index 0..7)
            const idx = this._caretToIndex(caret);
            // find the real char position in chars array for this digit index
            const charPos = this._digitIndexToCharPos(idx);
            // put digit into charPos (overwrite)
            this.chars[charPos] = e.key;
            // move caret to next editable position
            const nextDigitIdx = Math.min(7, idx + 1);
            const nextCaret = this._indexToCaret(nextDigitIdx);
            this._render();
            setTimeout(() => this.input.setSelectionRange(nextCaret, nextCaret), 0);
            return;
        }
        // Backspace: delete previous digit (replace with placeholder)
        if (e.key === 'Backspace') {
            e.preventDefault();
            const caret = this.input.selectionStart;
            let idx = this._caretToIndex(caret);
            if (this._isOnDash(caret)) {
                // if caret on dash, move left one
                idx = Math.max(0, idx - 1);
            } else {
                // if caret >0, delete previous
                if (caret === 0) { return; }
                if (caret === this.template.length) { idx = 7; } // at end
                else idx = Math.max(0, idx - 1);
            }
            const charPos = this._digitIndexToCharPos(idx);
            this.chars[charPos] = this._placeholderCharForPos(charPos);
            this._render();
            const newCaret = this._indexToCaret(idx);
            setTimeout(() => this.input.setSelectionRange(newCaret, newCaret), 0);
            return;
        }
        // Delete key: delete at caret
        if (e.key === 'Delete') {
            e.preventDefault();
            const caret = this.input.selectionStart;
            const idx = this._caretToIndex(caret);
            const charPos = this._digitIndexToCharPos(idx);
            this.chars[charPos] = this._placeholderCharForPos(charPos);
            this._render();
            setTimeout(() => this.input.setSelectionRange(this._indexToCaret(idx), this._indexToCaret(idx)), 0);
            return;
        }
        // block other keys
        e.preventDefault();
    }

    // map digit index (0..7) to char position in chars array (0..9)
    _digitIndexToCharPos(digitIdx) {
        // mapping: digitIdx 0->0,1->1,2->3,3->4,4->6,5->7,6->8,7->9
        if (digitIdx <= 1) return digitIdx;
        if (digitIdx <= 3) return digitIdx + 1;
        return digitIdx + 2;
    }

    _isOnDash(caretPos) {
        return this.dashPositions.includes(caretPos);
    }

    _placeholderCharForPos(pos) {
        // return 'd','M','y' based on pos
        if (pos <= 1) return 'd';
        if (pos <= 4) return 'M';
        return 'y';
    }

    _onPaste(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        const digits = text.replace(/\D/g, '').slice(0, 8);
        for (let i = 0; i < 8; i++) {
            const charPos = this._digitIndexToCharPos(i);
            if (i < digits.length) this.chars[charPos] = digits[i];
            else this.chars[charPos] = this._placeholderCharForPos(charPos);
        }
        this._render();
    }

    _onBlur(e) {
        // optional validation: if full and invalid, clear / show error
        const digitsOnly = this.chars.filter(c => c !== '-').join('');
        if (digitsOnly.length === 8) {
            const display = this.input.value; // dd-MM-yyyy
            const dt = DateMask._parseDisplay(display);
            const errEl = document.getElementById(this.input.id + 'Error');
            if (!dt) {
                if (errEl) { errEl.textContent = 'Ngày không hợp lệ'; errEl.classList.remove('hidden'); }
            } else {
                if (errEl) errEl.classList.add('hidden');
                // update hidden input ISO
                if (this.hiddenInput) this.hiddenInput.value = DateMask._toISO(dt);
            }
        }
    }

    // return ISO or empty string
    getISO() {
        const display = this.input.value;
        const dt = DateMask._parseDisplay(display);
        return dt ? DateMask._toISO(dt) : '';
    }

    setValue(val) {
        if (!val) {
            this.chars = this.template.split('');
            this._render();
            return;
        }
        if (val instanceof Date) {
            const d = val;
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = String(d.getFullYear()).padStart(4, '0');
            const digits = dd + mm + yyyy;
            for (let i = 0; i < 8; i++) {
                const pos = this._digitIndexToCharPos(i);
                this.chars[pos] = digits[i];
            }
            this._render();
            return;
        }
        // if ISO
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const [y, m, d] = val.split('-');
            const digits = d + m + y;
            for (let i = 0; i < 8; i++) {
                this.chars[this._digitIndexToCharPos(i)] = digits[i];
            }
            this._render();
            return;
        }
        // dd-MM-yyyy-ish
        const digits = String(val).replace(/\D/g, '').slice(0, 8);
        for (let i = 0; i < 8; i++) {
            const pos = this._digitIndexToCharPos(i);
            this.chars[pos] = digits[i] || this._placeholderCharForPos(pos);
        }
        this._render();
    }

    static _toISO(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    static _parseDisplay(display) {
        if (!display) return null;
        const s = display.replace(/\//g, '-').trim(); // convert / to - if any
        const parts = s.split('-');
        if (parts.length !== 3) return null;
        const D = Number(parts[0]), M = Number(parts[1]), Y = Number(parts[2]);
        if (!Number.isInteger(D) || !Number.isInteger(M) || !Number.isInteger(Y)) return null;
        const dt = new Date(Y, M - 1, D);
        if (dt.getFullYear() !== Y || dt.getMonth() !== M - 1 || dt.getDate() !== D) return null;
        return dt;
    }
}