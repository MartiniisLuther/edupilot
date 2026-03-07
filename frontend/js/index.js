/**
 * EduPilot — Dashboard JS (index.js)
 *
 * 1. Live clock
 * 2. Active nav link
 * 3. Account dropdown
 * 4. Mobile sidebar
 * 5. Modal open/close
 * 6. Task checkbox toggle
 */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);


/* ── 1. LIVE CLOCK ───────────────────────────── */

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function updateClock() {
    const now = new Date();

    const dayEl = $('#clockDay');
    if (dayEl) dayEl.textContent = DAYS[now.getDay()];

    const dateEl = $('#clockDate');
    if (dateEl) {
        const d = String(now.getDate()).padStart(2, '0');
        dateEl.textContent = `${d} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    }

    const timeEl = $('#clockTime');
    if (timeEl) {
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${h}:${m}`;
    }
}

updateClock();
setInterval(updateClock, 1000);


/* ── 2. ACTIVE NAV LINK ──────────────────────── */

function setActiveNavLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link').forEach((link) => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === current) link.classList.add('current');
    });
}
setActiveNavLink();


/* ── 3. ACCOUNT DROPDOWN ─────────────────────── */

const gradCapBtn      = $('#gradCapBtn');
const accountDropdown = $('#accountDropdown');

gradCapBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    accountDropdown.classList.toggle('is-open');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#accountWrapper')) {
        accountDropdown?.classList.remove('is-open');
    }
});


/* ── 4. MOBILE SIDEBAR ───────────────────────── */

const hamburgerBtn  = $('#hamburgerBtn');
const mobileSidebar = $('#mobileSidebar');

hamburgerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileSidebar.classList.toggle('is-open');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#mobileSidebar') && !e.target.closest('#hamburgerBtn')) {
        mobileSidebar?.classList.remove('is-open');
    }
});


/* ── 5. MODAL ────────────────────────────────── */

function openModal(modalEl)  { modalEl?.classList.add('is-open');    modalEl?.setAttribute('aria-hidden','false'); }
function closeModal(modalEl) { modalEl?.classList.remove('is-open'); modalEl?.setAttribute('aria-hidden','true'); }

const taskModal = $('#taskModal');

$('#addTaskBtn')?.addEventListener('click',  () => openModal(taskModal));
$('#closeModalBtn')?.addEventListener('click', () => closeModal(taskModal));
$('#cancelModalBtn')?.addEventListener('click',() => closeModal(taskModal));
taskModal?.addEventListener('click', (e) => { if (e.target === taskModal) closeModal(taskModal); });
document.addEventListener('keydown', (e)  => { if (e.key === 'Escape') closeModal(taskModal); });

$('#saveModalBtn')?.addEventListener('click', () => {
    const name   = $('#taskName')?.value.trim();
    const course = $('#taskCourse')?.value.trim();
    const due    = $('#taskDue')?.value;
    if (!name) { $('#taskName')?.focus(); return; }

    // TODO: POST /api/tasks — for now just log
    console.log('New task:', { name, course, due });
    closeModal(taskModal);
    $('#taskName').value = '';
    $('#taskCourse').value = '';
    $('#taskDue').value = '';
});


/* ── 6. TASK CHECKBOX TOGGLE ─────────────────── */

/*
   Toggles the done state on task items.
   Works for both hardcoded items and dynamically added ones.
*/
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.task-item__check');
    if (!btn) return;

    const item = btn.closest('.task-item');
    const isDone = item.classList.toggle('task-item--done');
    btn.classList.toggle('task-item__check--checked', isDone);

    const nameEl = item.querySelector('.task-item__name');
    const subEl  = item.querySelector('.task-item__sub');

    if (isDone) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        if (subEl) subEl.textContent = subEl.textContent.replace('due', 'done');
    } else {
        btn.innerHTML = '';
        // TODO: restore original sub text from data attribute when wired to API
    }
});