document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Smooth Scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Reveal on Scroll (IntersectionObserver) ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((el, i) => el.dataset.revealIndex = i);
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.revealIndex * 100;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------- Stat Counters ---------- */
  const statElements = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.target || 0;
        const duration = 2000;
        let start = null;
        const step = timestamp => {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const value = Math.min(Math.floor((progress / duration) * target), target);
          el.textContent = value;
          if (progress < duration) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target;
          }
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  statElements.forEach(el => counterObserver.observe(el));

  /* ---------- Navbar Behaviour ---------- */
  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;
  const navHandler = () => {
    const currentY = window.scrollY;
    // shrink & backdrop blur after 80px
    if (currentY > 80) {
      navbar.classList.add('shrink');
    } else {
      navbar.classList.remove('shrink');
    }
    // hide on scroll down, show on scroll up
    if (currentY > lastScrollY && currentY > 120) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScrollY = currentY;
  };
  window.addEventListener('scroll', navHandler);

  /* ---------- Hamburger Menu Toggle ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  /* ---------- Gallery Lightbox ---------- */
  const galleryImages = Array.from(document.querySelectorAll('.gallery-grid img'));
  if (galleryImages.length) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.9);display:flex;align-items:center;
      justify-content:center;opacity:0;visibility:hidden;
      transition:opacity .3s ease;
      z-index:1000;
    `;
    const img = document.createElement('img');
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position:absolute;top:20px;right:30px;font-size:2rem;
      background:none;color:#fff;border:none;cursor:pointer;
    `;
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.style.cssText = `
      position:absolute;left:30px;top:50%;transform:translateY(-50%);
      background:none;color:#fff;border:none;font-size:2rem;cursor:pointer;
    `;
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.style.cssText = `
      position:absolute;right:30px;top:50%;transform:translateY(-50%);
      background:none;color:#fff;border:none;font-size:2rem;cursor:pointer;
    `;
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    document.body.appendChild(overlay);

    let currentIdx = 0;
    const openLightbox = idx => {
      currentIdx = idx;
      img.src = galleryImages[currentIdx].src;
      overlay.style.visibility = 'visible';
      overlay.style.opacity = '1';
    };
    const closeLightbox = () => {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    };
    const showPrev = () => {
      currentIdx = (currentIdx - 1 + galleryImages.length) % galleryImages.length;
      img.src = galleryImages[currentIdx].src;
    };
    const showNext = () => {
      currentIdx = (currentIdx + 1) % galleryImages.length;
      img.src = galleryImages[currentIdx].src;
    };

    galleryImages.forEach((image, i) => {
      image.style.cursor = 'pointer';
      image.addEventListener('click', () => openLightbox(i));
    });
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (overlay.style.visibility !== 'visible') return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  /* ---------- Form Validation & Success Message ---------- */
  const contactSection = document.getElementById('contact');
  const form = contactSection ? contactSection.querySelector('form') : null;
  if (form) {
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.style.cssText = `
      opacity:0;transition:opacity .5s ease;
      color:var(--primary);margin-top:1rem;
    `;
    form.parentNode.insertBefore(successMsg, form.nextSibling);

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      const required = form.querySelectorAll('[required]');
      required.forEach(inp => {
        inp.classList.remove('invalid');
        if (!inp.value.trim()) {
          valid = false;
          inp.classList.add('invalid');
        } else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)) {
          valid = false;
          inp.classList.add('invalid');
        }
      });
      if (valid) {
        // Simulate async submit
        setTimeout(() => {
          form.reset();
          successMsg.textContent = 'Thank you! Your message has been sent.';
          successMsg.style.opacity = '1';
        }, 300);
      } else {
        successMsg.textContent = 'Please correct the highlighted fields.';
        successMsg.style.opacity = '1';
      }
    });
  }
});