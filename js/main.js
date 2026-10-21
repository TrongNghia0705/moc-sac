/**
 * MỘC SẮC - KHUNG TRANH TIỂU CẢNH
 * Main Application Bootstrapper
 */

import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initOrder } from './order.js';
import { initFAQ } from './faq.js';
import { initTracking } from './tracking.js';
import { initProductGallery } from './gallery.js';

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('has-js');

  // Initialize Core Modules
  initTheme();
  initNavigation();
  initProductGallery();
  initOrder();
  initTracking();
  initFAQ();

  // Scroll Reveal Animations
  const animatedElements = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window && animatedElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    animatedElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    animatedElements.forEach(el => el.classList.add('is-visible'));
  }
});
