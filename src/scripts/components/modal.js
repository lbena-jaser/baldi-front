// Modal dialog component

export class Modal {
  constructor(options = {}) {
    this.title = options.title || '';
    this.content = options.content || '';
    this.size = options.size || 'md';
    this.onConfirm = options.onConfirm || null;
    this.onCancel = options.onCancel || null;
    this.confirmText = options.confirmText || 'Confirm';
    this.cancelText = options.cancelText || 'Cancel';
    this.showCancel = options.showCancel !== false;
    this.element = null;
    this.isOpen = false;
  }
  
  show() {
    if (this.isOpen) {
      return;
    }
    
    this.element = this.create();
    document.body.appendChild(this.element);
    this.isOpen = true;
    
    // Animate in
    requestAnimationFrame(() => {
      this.element.querySelector('.modal-backdrop').classList.add('opacity-100');
      this.element.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
  
  hide() {
    if (!this.element || !this.isOpen) {
      return;
    }
    
    // Animate out
    this.element.querySelector('.modal-backdrop').classList.remove('opacity-100');
    this.element.querySelector('.modal-content').classList.remove('scale-100', 'opacity-100');
    
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.remove();
      }
      document.body.style.overflow = '';
      this.isOpen = false;
    }, 300);
  }
  
  create() {
    const modal = document.createElement('div');
    modal.className = 'modal-wrapper fixed inset-0 z-50 flex items-center justify-center p-4';
    
    modal.innerHTML = `
      <div class="modal-backdrop absolute inset-0 bg-black opacity-0 transition-opacity duration-300"></div>
      
      <div class="modal-content relative bg-white rounded-xl shadow-2xl transform scale-95 opacity-0 transition-all duration-300 ${this.getSizeClass()}">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-900">${this.title}</h3>
          <button class="modal-close text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="px-6 py-4 max-h-96 overflow-y-auto">
          ${this.content}
        </div>
        
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          ${this.showCancel ? `
            <button class="modal-cancel btn btn-ghost">
              ${this.cancelText}
            </button>
          ` : ''}
          <button class="modal-confirm btn btn-primary">
            ${this.confirmText}
          </button>
        </div>
      </div>
    `;
    
    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      this.handleCancel();
    });
    
    if (this.showCancel) {
      modal.querySelector('.modal-cancel').addEventListener('click', () => {
        this.handleCancel();
      });
    }
    
    modal.querySelector('.modal-confirm').addEventListener('click', () => {
      this.handleConfirm();
    });
    
    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
      this.handleCancel();
    });
    
    // Escape key
    this.handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.handleCancel();
      }
    };
    document.addEventListener('keydown', this.handleEscape);
    
    return modal;
  }
  
  handleConfirm() {
    if (this.onConfirm) {
      this.onConfirm();
    }
    this.hide();
  }
  
  handleCancel() {
    if (this.onCancel) {
      this.onCancel();
    }
    this.hide();
  }
  
  getSizeClass() {
    const sizes = {
      sm: 'w-full max-w-sm',
      md: 'w-full max-w-md',
      lg: 'w-full max-w-lg',
      xl: 'w-full max-w-xl',
      '2xl': 'w-full max-w-2xl',
    };
    
    return sizes[this.size] || sizes.md;
  }
  
  destroy() {
    document.removeEventListener('keydown', this.handleEscape);
    this.hide();
  }
}

// Helper: Confirm dialog
export function showConfirm(title, message, onConfirm) {
  const modal = new Modal({
    title,
    content: `<p class="text-gray-600">${message}</p>`,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm,
  });
  
  modal.show();
  return modal;
}

// Helper: Alert dialog
export function showAlert(title, message) {
  const modal = new Modal({
    title,
    content: `<p class="text-gray-600">${message}</p>`,
    confirmText: 'OK',
    showCancel: false,
  });
  
  modal.show();
  return modal;
}

export default Modal;