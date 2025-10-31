// Loading spinner component

let loaderElement = null;

export function showLoader(message = 'Loading...') {
  hideLoader();
  
  loaderElement = document.createElement('div');
  loaderElement.id = 'global-loader';
  loaderElement.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
  
  loaderElement.innerHTML = `
    <div class="bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4 animate-scale-in">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <p class="text-gray-700 font-medium">${message}</p>
    </div>
  `;
  
  document.body.appendChild(loaderElement);
  document.body.style.overflow = 'hidden';
}

export function hideLoader() {
  if (loaderElement) {
    loaderElement.remove();
    loaderElement = null;
    document.body.style.overflow = '';
  }
}

// Page loader (for initial page load)
export function initPageLoader() {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.className = 'fixed inset-0 z-50 flex items-center justify-center bg-white';
  
  loader.innerHTML = `
    <div class="flex flex-col items-center gap-4">
      <div class="text-4xl font-bold gradient-text">Baldi Meals</div>
      
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(loader);
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => loader.remove(), 500);
    }, 300);
  });
}

export default { showLoader, hideLoader, initPageLoader };