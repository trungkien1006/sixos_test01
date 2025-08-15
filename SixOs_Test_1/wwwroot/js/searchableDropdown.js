class SearchableDropdown {
  constructor(containerId, inputId, dropdownId, hiddenInputId, options, onChange, disabled = false) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.dropdown = document.getElementById(dropdownId);
    this.hiddenInput = document.getElementById(hiddenInputId);
    this.options = options;
    this.onChange = onChange;
    this.disabled = disabled;
    this.isOpen = false;
    this.highlightedIndex = 0;
    this.searchTerm = '';
    this.selectedValue = '';
      this.init();
  }
  init() {
    // Set initial state
    if (this.disabled) {
      this.input.disabled = true;
    }
    // Add event listeners
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));
    this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!this.container.contains(e.target)) {
        this.closeDropdown();
      }
    });
  }
  handleInput(e) {
    if (this.disabled) return;
    this.searchTerm = e.target.value;
    this.selectedValue = '';
    this.hiddenInput.value = '';
    this.openDropdown();
    this.highlightedIndex = 0;
    this.renderDropdown();
  }
  handleFocus() {
    if (this.disabled) return;
    this.openDropdown();
  }
  handleKeyDown(e) {
    if (this.disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.openDropdown();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.getFilteredOptions().length - 1);
        this.renderDropdown();
        this.scrollToHighlighted();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.highlightedIndex = Math.max(0, this.highlightedIndex - 1);
        this.renderDropdown();
        this.scrollToHighlighted();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.isOpen) {
          const options = this.getFilteredOptions();
          if (options.length > 0 && this.highlightedIndex >= 0) {
            this.selectOption(options[this.highlightedIndex]);
          }
        } else {
          this.openDropdown();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.closeDropdown();
        break;
    }
  }

    getFilteredOptions() {
        const term = this.searchTerm.toLowerCase();
        return this.options.filter(option =>
            option.name.toLowerCase().includes(term) ||
            option.code.toLowerCase().includes(term)
        );
    }

  openDropdown() {
    if (this.disabled) return;
    this.isOpen = true;
    this.renderDropdown();
  }
  closeDropdown() {
    this.isOpen = false;
    this.dropdown.classList.add('hidden');
  }

    renderDropdown() {
        if (!this.isOpen) {
            this.dropdown.classList.add('hidden');
            return;
        }

        const filteredOptions = this.getFilteredOptions();

        if (filteredOptions.length === 0) {
            this.dropdown.innerHTML = '<div class="dropdown-item text-gray-500">Không có kết quả</div>';
        } else {
            const searchTerm = this.searchTerm || '';

            // Escape các ký tự đặc biệt để regex không bị lỗi
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            let searchRegex = null;
            if (escapedTerm.length > 0) {
                searchRegex = new RegExp(`(${escapedTerm})`, 'gi');
            }

            this.dropdown.innerHTML = filteredOptions.map((option, index) => {
                const isHighlighted = index === this.highlightedIndex;
                const isSelected = option.id === this.selectedValue;

                let highlightedName = option.name;
                let highlightedCode = option.code;

                // Chỉ highlight khi có searchTerm
                if (searchRegex) {
                    highlightedName = option.name.replace(
                        searchRegex,
                        '<span class="match-highlight">$1</span>'
                    );
                    highlightedCode = option.code.replace(
                        searchRegex,
                        '<span class="match-highlight">$1</span>'
                    );
                }

                return `
                <div class="dropdown-item ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}" 
                    data-value="${option.id}">
                    <span> ${highlightedName} </span> <span class="text-gray-500">[${highlightedCode}]</span>
                </div>
            `;
            }).join('');

            // Gán sự kiện click + hover
            const items = this.dropdown.querySelectorAll('.dropdown-item');
            items.forEach((item, idx) => {
                item.addEventListener('click', () => {
                    this.selectOption(filteredOptions[idx]);
                });
                item.addEventListener('mouseenter', () => {
                    this.highlightedIndex = idx;
                    this.dropdown.querySelectorAll('.dropdown-item').forEach(el => {
                        el.classList.remove('highlighted');
                    });
                    item.classList.add('highlighted');
                });
            });
        }

        this.dropdown.classList.remove('hidden');
    }



  scrollToHighlighted() {
    if (!this.isOpen) return;
    const highlightedItem = this.dropdown.querySelector('.highlighted');
    if (highlightedItem) {
      highlightedItem.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }
    selectOption(option) {
        this.selectedValue = option.name; // Giá trị thực sự lưu
        this.hiddenInput.value = option.name; // Lưu vào input hidden để submit
        this.input.value = option.name; // Hiển thị tên tỉnh
        this.searchTerm = '';
        this.closeDropdown();

        if (typeof this.onChange === 'function') {
            this.onChange(option.name);
        }
    }

  getValue() {
    return this.selectedValue;
  }
  setValue(value) {
    if (this.options.includes(value)) {
      this.selectedValue = value;
      this.hiddenInput.value = value;
      this.input.value = value;
    }
  }
  setOptions(options) {
    this.options = options;
    if (this.isOpen) {
      this.renderDropdown();
    }
  }
  enable() {
    this.disabled = false;
      this.input.disabled = false;
      this.input.classList.remove('input-disable')
  }
  disable() {
    this.disabled = true;
      this.input.disabled = true;
      this.input.classList.add('input-disable')
    this.closeDropdown();
  }
}