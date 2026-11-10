/**
 * MỘC SẮC - KHUNG TRANH TIỂU CẢNH
 * Product Multi-Angle Showcase Gallery & Lightbox Module
 */

export function initProductGallery() {
  const thumbBtns = document.querySelectorAll('.product-thumb-btn');
  const mainBox = document.getElementById('showcase-main-box');
  const mainImg = document.getElementById('product-main-img');
  const zoomBtn = document.getElementById('showcase-zoom-btn');
  const currentViewTag = document.getElementById('current-view-tag');

  // Lightbox elements
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  // Thumbnail Click Handler
  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetImgId = btn.getAttribute('data-target-img');
      const newSrc = btn.getAttribute('data-src');
      const labelText = btn.getAttribute('data-label');

      if (!targetImgId || !newSrc) return;

      const targetImg = document.getElementById(targetImgId);
      if (!targetImg) return;

      // Tìm tag hiển thị tên góc nhìn
      const container = btn.closest('.showcase-card') || document;
      const viewTag = container.querySelector('.product-view-tag') || currentViewTag;

      // Bỏ active ở các thumb khác
      const parentStrip = btn.closest('.showcase-thumbs-strip') || btn.closest('.product-thumbs-strip');
      if (parentStrip) {
        parentStrip.querySelectorAll('.product-thumb-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
      }

      // Kích hoạt thumbnail được click
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Cập nhật nhãn góc nhìn
      if (viewTag && labelText) {
        viewTag.textContent = labelText;
      }

      // Hiệu ứng mượt mà khi đổi ảnh thật
      targetImg.style.opacity = '0.35';
      targetImg.style.transform = 'scale(0.985)';

      setTimeout(() => {
        targetImg.src = newSrc;
        targetImg.style.transform = 'scale(1)';
        targetImg.style.opacity = '1';
      }, 140);
    });
  });

  // Lightbox Logic
  function openLightbox(src, captionText) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) {
      lightboxCaption.textContent = captionText || 'Khung Tranh 3D Tiệm Cà Phê Thanh Xuân - Mộc Sắc';
    }
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mainBox) {
    mainBox.addEventListener('click', (e) => {
      // Tránh trigger khi bấm các nút nổi nếu có
      if (e.target.closest('.product-badge')) return;
      const src = mainImg ? mainImg.src : '';
      const caption = currentViewTag ? `Tiệm Cà Phê Thanh Xuân – ${currentViewTag.textContent}` : '';
      if (src) openLightbox(src, caption);
    });
  }

  if (zoomBtn) {
    zoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = mainImg ? mainImg.src : '';
      const caption = currentViewTag ? `Tiệm Cà Phê Thanh Xuân – ${currentViewTag.textContent}` : '';
      if (src) openLightbox(src, caption);
    });
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      // Đóng khi click ngoài hình
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
  }

  // Đóng bằng phím Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}
