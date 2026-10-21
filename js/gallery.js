/**
 * MỘC SẮC - KHUNG TRANH TIỂU CẢNH
 * Product Multi-Angle Gallery Module
 */

export function initProductGallery() {
  const thumbBtns = document.querySelectorAll('.product-thumb-btn');

  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetImgId = btn.getAttribute('data-target-img');
      const newSrc = btn.getAttribute('data-src');
      const labelText = btn.getAttribute('data-label');
      const viewMode = btn.getAttribute('data-view-mode') || 'front';

      if (!targetImgId || !newSrc) return;

      const mainImg = document.getElementById(targetImgId);
      if (!mainImg) return;

      // Tìm container chứa card hiện tại
      const card = btn.closest('.product-card');
      const viewTag = card?.querySelector('.product-view-tag');

      // Bỏ active ở các thumb cùng card
      const parentStrip = btn.closest('.product-thumbs-strip');
      if (parentStrip) {
        parentStrip.querySelectorAll('.product-thumb-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
      }

      // Đặt active cho nút hiện tại
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Cập nhật text nhãn góc xem
      if (viewTag && labelText) {
        viewTag.textContent = labelText;
      }

      // Hiệu ứng chuyển ảnh mượt mà
      mainImg.style.opacity = '0.3';
      mainImg.style.transform = 'scale(0.98)';

      setTimeout(() => {
        mainImg.src = newSrc;
        
        // Tạo visual angle hiệu ứng phối cảnh theo góc xem
        if (viewMode === 'angle') {
          mainImg.style.transform = 'perspective(900px) rotateY(-6deg) scale(1.02)';
          mainImg.style.filter = 'contrast(1.03)';
        } else if (viewMode === 'desk') {
          mainImg.style.transform = 'perspective(900px) rotateX(4deg) scale(1.01)';
          mainImg.style.filter = 'saturate(1.08) brightness(0.98)';
        } else {
          mainImg.style.transform = 'none';
          mainImg.style.filter = 'none';
        }

        mainImg.style.opacity = '1';
      }, 140);
    });
  });
}
