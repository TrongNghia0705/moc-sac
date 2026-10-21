/**
 * MỘC SẮC - KHUNG TRANH TIỂU CẢNH
 * Theme Manager: Light / Dark Mode & Logo Switching
 */

const THEME_STORAGE_KEY = 'mocsac_theme';
const LOGO_LIGHT = 'assets/logo-light.png';
const LOGO_DARK = 'assets/logo-dark.png';

export function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const brandLogoImg = document.getElementById('brand-logo');
  const themeTextSpan = document.getElementById('theme-text');
  const themeIconSvg = document.getElementById('theme-icon');

  // Check saved theme or default to 'light' as required
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';

  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    if (brandLogoImg) {
      brandLogoImg.src = theme === 'dark' ? LOGO_DARK : LOGO_LIGHT;
      brandLogoImg.alt = theme === 'dark' ? 'Mộc Sắc Logo (Dark Mode)' : 'Mộc Sắc Logo (Light Mode)';
    }

    if (themeTextSpan) {
      themeTextSpan.textContent = theme === 'dark' ? 'Bật chế độ sáng' : 'Bật chế độ tối';
    }

    if (themeIconSvg) {
      if (theme === 'dark') {
        // Sun icon for switching to light
        themeIconSvg.innerHTML = `
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        `;
      } else {
        // Moon icon for switching to dark
        themeIconSvg.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        `;
      }
    }

    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }
}
