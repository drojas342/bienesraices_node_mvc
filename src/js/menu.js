document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-menu-app');
    const menu = document.getElementById('mobile-menu-app');

    if (!btn || !menu) return;

    const abrir = () => {
        menu.classList.remove('hidden');
        menu.classList.add('flex');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = '✕';
    };

    const cerrar = () => {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '☰';
    };

    btn.addEventListener('click', () => {
        const expandido = btn.getAttribute('aria-expanded') === 'true';
        expandido ? cerrar() : abrir();
    });

    menu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') cerrar();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) cerrar();
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) cerrar();
    });
});