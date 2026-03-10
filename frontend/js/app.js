/**
 * EduPilot — App Entry Point
 *
 * Runs on every page. Handles auth guard and navbar init.
 * Currently pages are served directly by FastAPI as static files,
 * so this is loaded per-page via <script src="/static/js/app.js">.
 *
 * TODO: when JWT auth is implemented, uncomment the guard below.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── Auth guard (enable once JWT login is wired up) ──
    // const publicPages = ['/pages/login.html', '/pages/register.html'];
    // const isPublic = publicPages.some(p => window.location.pathname.endsWith(p));
    // if (!isPublic && !localStorage.getItem('ep_access_token')) {
    //     window.location.href = '/pages/login.html';
    //     return;
    // }

    // ── Active nav link ──
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href').split('/').pop() === current)
            link.classList.add('current');
    });

});