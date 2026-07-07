document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-menu');
    const menu = document.getElementById('mobile-menu');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        menu.classList.toggle('hidden');
    });

    // Close menu when a link inside is clicked (optional)
    menu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
});
