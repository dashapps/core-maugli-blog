// Автоматически добавляет класс для анимации InfoCard при появлении в viewport
export function animateInfoCardsOnView() {
  if (typeof window === 'undefined') return;
  const cards = document.querySelectorAll('.info-card-fade-in');
  if (!('IntersectionObserver' in window) || !cards.length) return;

  const observer = new window.IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('info-card-fade-in--active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => observer.observe(card));
}

// Для автоинициализации на всех страницах, если нужно:
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', animateInfoCardsOnView);
}
