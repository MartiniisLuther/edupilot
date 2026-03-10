/**
 * EduPilot — Courses Page JS
 *
 * 1. Navbar: dropdown + hamburger + active link
 * 2. Filter tabs (all / active / past)
 * 3. Course modal: open (add/edit) + close + colour picker + day picker
 * 4. Delete modal: open + confirm
 * 5. Ghost card click → open add modal
 * TODO: replace demo data with GET /api/courses fetch calls
 */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);


/* ── 1. NAVBAR ───────────────────────────────── */

// Active nav link
(function () {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link').forEach(link => {
        if (link.getAttribute('href').split('/').pop() === current)
            link.classList.add('current');
    });
})();

// Account dropdown
const gradCapBtn      = $('#gradCapBtn');
const accountDropdown = $('#accountDropdown');
gradCapBtn?.addEventListener('click', e => {
    e.stopPropagation();
    accountDropdown.classList.toggle('is-open');
});
document.addEventListener('click', e => {
    if (!e.target.closest('#accountWrapper'))
        accountDropdown?.classList.remove('is-open');
});

// Mobile sidebar
const hamburgerBtn  = $('#hamburgerBtn');
const mobileSidebar = $('#mobileSidebar');
hamburgerBtn?.addEventListener('click', e => {
    e.stopPropagation();
    mobileSidebar.classList.toggle('is-open');
});
document.addEventListener('click', e => {
    if (!e.target.closest('#mobileSidebar') && !e.target.closest('#hamburgerBtn'))
        mobileSidebar?.classList.remove('is-open');
});


/* ── 2. FILTER (stats bar) ───────────────────── */

function applyFilter(filter) {
    $$('button.stats-pill[data-filter]').forEach(p => {
        const match = p.dataset.filter === filter;
        p.classList.toggle('stats-pill--active', match);
        p.setAttribute('aria-selected', match);
    });
    $$('.course-card:not(.course-card--ghost)').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
    });
}

$$('button.stats-pill[data-filter]').forEach(pill => {
    pill.addEventListener('click', () => applyFilter(pill.dataset.filter));
});

// Default to active on load
applyFilter('active');


/* ── 3. COURSE MODAL ─────────────────────────── */

const courseModal      = $('#courseModal');
const courseModalTitle = $('#courseModalTitle');

let _editingId = null;

function openCourseModal(mode = 'add', data = {}) {
    courseModalTitle.textContent = mode === 'edit' ? 'Edit Course' : 'Add Course';
    _editingId = mode === 'edit' ? (data.id || null) : null;

    // Pre-fill if editing
    $('#courseName').value      = data.name      || '';
    $('#courseCode').value      = data.code      || '';
    $('#courseCredits').value   = data.credits   || '';
    $('#courseProfessor').value = data.professor || '';
    $('#courseRoom').value      = data.room      || '';

    // Reset day buttons
    $$('.day-btn').forEach(b => b.classList.remove('day-btn--active'));
    if (data.days) {
        data.days.forEach(d => {
            const btn = $(`.day-btn[data-day="${d}"]`);
            if (btn) btn.classList.add('day-btn--active');
        });
    }

    // Reset colour swatches
    $$('.colour-swatch').forEach(s => s.classList.remove('colour-swatch--active'));
    const targetColour = data.colour || '#3B82F6';
    const swatch = $(`.colour-swatch[data-colour="${targetColour}"]`);
    if (swatch) swatch.classList.add('colour-swatch--active');

    courseModal.classList.add('is-open');
    courseModal.setAttribute('aria-hidden', 'false');
    $('#courseName').focus();
}

function closeCourseModal() {
    courseModal.classList.remove('is-open');
    courseModal.setAttribute('aria-hidden', 'true');
}

$('#addCourseBtn')?.addEventListener('click', () => openCourseModal('add'));
$('#addCourseCard')?.addEventListener('click', () => openCourseModal('add'));
$('#addCourseCard')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') openCourseModal('add');
});

$('#closeCourseModal')?.addEventListener('click', closeCourseModal);
$('#cancelCourseModal')?.addEventListener('click', closeCourseModal);
courseModal?.addEventListener('click', e => { if (e.target === courseModal) closeCourseModal(); });

// Edit button on cards
document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="edit"]');
    if (!btn) return;
    const card = btn.closest('.course-card');
    // TODO: replace with fetched course data from API
    openCourseModal('edit', {
        id:        btn.dataset.id,
        name:      card.querySelector('.course-card__name')?.textContent,
        code:      card.querySelector('.course-card__code')?.textContent,
        professor: card.querySelector('.course-card__prof')?.textContent.trim(),
        colour:    card.querySelector('.course-card__stripe')?.style.background,
    });
});

// Save
$('#saveCourseBtn')?.addEventListener('click', () => {
    const name = $('#courseName')?.value.trim();
    if (!name) { $('#courseName').focus(); return; }

    const code      = $('#courseCode')?.value.trim()      || '—';
    const credits   = $('#courseCredits')?.value           || '0';
    const professor = $('#courseProfessor')?.value.trim() || '—';
    const room      = $('#courseRoom')?.value.trim()       || '—';
    const days      = [...$$('.day-btn--active')].map(b => b.dataset.day).join(' · ') || '—';
    const timeStart = $('#courseTimeStart')?.value         || '';
    const timeEnd   = $('#courseTimeEnd')?.value           || '';
    const timeStr   = timeStart ? `${timeStart}${timeEnd ? ' – ' + timeEnd : ''}` : '—';
    const colour    = $('.colour-swatch--active')?.dataset.colour || '#0066FF';
    const semOpt    = $('#courseSemester');
    const semLabel  = semOpt?.options[semOpt.selectedIndex]?.text || 'Unknown';

    const newId     = Date.now();
    const isEditing = courseModalTitle.textContent === 'Edit Course';

    if (isEditing && _editingId) {
        // ── UPDATE existing card ──
        const card = $(`.course-card[data-id="${_editingId}"]`);
        if (card) {
            card.querySelector('.course-card__stripe').style.background = colour;
            card.querySelector('.course-card__code').textContent        = code;
            card.querySelector('.course-card__name').textContent        = name;
            card.querySelector('.course-card__name').style.color        = colour;
            card.querySelector('.course-card__prof').innerHTML =
                `<i class="fa-solid fa-user-tie"></i> ${professor}`;
            // Rebuild meta tags
            const meta = card.querySelector('.course-card__meta');
            meta.innerHTML = `
                <span class="course-meta-tag"><i class="fa-solid fa-calendar-week"></i> ${days}</span>
                <span class="course-meta-tag"><i class="fa-solid fa-clock"></i> ${timeStr}</span>
                <span class="course-meta-tag"><i class="fa-solid fa-location-dot"></i> ${room}</span>`;
            card.querySelector('.course-credits').innerHTML =
                `<i class="fa-solid fa-certificate"></i><span>${credits} credits</span>`;
        }
        _editingId = null;

    } else {
        // ── INSERT new card ──
        const ghost = $('#addCourseCard');
        const card  = document.createElement('div');
        card.className   = 'course-card';
        card.dataset.status = 'active';
        card.dataset.id     = newId;
        card.style.opacity  = '0';
        card.style.transform = 'translateY(8px)';
        card.style.transition = 'opacity 300ms, transform 300ms';

        card.innerHTML = `
            <div class="course-card__stripe" style="background:${colour};"></div>
            <div class="course-card__body">
                <div class="course-card__top">
                    <div class="course-card__code-wrap">
                        <span class="course-card__code">${code}</span>
                        <span class="course-card__status course-card__status--active">Active</span>
                    </div>
                    <div class="course-card__actions">
                        <button class="card-action" data-action="edit" data-id="${newId}" aria-label="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="card-action card-action--danger" data-action="delete" data-id="${newId}" aria-label="Remove">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h2 class="course-card__name" style="color:${colour};">${name}</h2>
                <p class="course-card__prof"><i class="fa-solid fa-user-tie"></i> ${professor}</p>
                <div class="course-card__meta">
                    <span class="course-meta-tag"><i class="fa-solid fa-calendar-week"></i> ${days}</span>
                    <span class="course-meta-tag"><i class="fa-solid fa-clock"></i> ${timeStr}</span>
                    <span class="course-meta-tag"><i class="fa-solid fa-location-dot"></i> ${room}</span>
                </div>
                <div class="course-card__footer">
                    <div class="course-credits">
                        <i class="fa-solid fa-certificate"></i>
                        <span>${credits} credits</span>
                    </div>
                    <div class="course-grade course-grade--pending">
                        <span class="course-grade__label">Grade</span>
                        <span class="course-grade__value">Pending</span>
                    </div>
                </div>
            </div>`;

        $('#coursesGrid').insertBefore(card, ghost);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                card.style.opacity   = '1';
                card.style.transform = 'translateY(0)';
            });
        });

        // If active filter is on, keep visible; if past filter hide it
        const activeFilter = $('button.stats-pill--active')?.dataset.filter;
        if (activeFilter && activeFilter !== 'all' && activeFilter !== 'active') {
            card.style.display = 'none';
        }

        updateCounts();
    }

    closeCourseModal();
});

// Day picker toggle
$$('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('day-btn--active'));
});

// Colour swatch picker
$$('.colour-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
        $$('.colour-swatch').forEach(s => s.classList.remove('colour-swatch--active'));
        swatch.classList.add('colour-swatch--active');
    });
});


/* ── Count updater ───────────────────────────── */
function updateCounts() {
    const all      = $$('.course-card:not(.course-card--ghost)').length;
    const active   = $$('.course-card[data-status="active"]').length;
    const past     = $$('.course-card[data-status="past"]').length;
    const totalEl  = $('#totalCount');
    const activeEl = $('#activeCount');
    const pastEl   = $('#pastCount');
    if (totalEl)  totalEl.textContent  = all;
    if (activeEl) activeEl.textContent = active;
    if (pastEl)   pastEl.textContent   = past;
}


/* ── 4. DELETE MODAL ─────────────────────────── */

const deleteModal = $('#deleteModal');
let pendingDeleteId = null;

function openDeleteModal(id, name) {
    pendingDeleteId = id;
    $('#deleteCourseNameLabel').textContent = name || 'this course';
    deleteModal.classList.add('is-open');
    deleteModal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
    deleteModal.classList.remove('is-open');
    deleteModal.setAttribute('aria-hidden', 'true');
    pendingDeleteId = null;
}

document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="delete"]');
    if (!btn) return;
    const card = btn.closest('.course-card');
    const name = card?.querySelector('.course-card__name')?.textContent;
    openDeleteModal(btn.dataset.id, name);
});

$('#closeDeleteModal')?.addEventListener('click', closeDeleteModal);
$('#cancelDeleteModal')?.addEventListener('click', closeDeleteModal);
deleteModal?.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

$('#confirmDeleteBtn')?.addEventListener('click', () => {
    if (!pendingDeleteId) return;
    // TODO: DELETE /api/courses/:id
    const card = $(`.course-card[data-id="${pendingDeleteId}"]`);
    if (card) {
        card.style.transition = 'opacity 250ms, transform 250ms';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => { card.remove(); updateCounts(); rebuildSemesterDropdown(); }, 260);
    }
    closeDeleteModal();
});


/* ── 5. ESCAPE KEY ───────────────────────────── */

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeCourseModal();
        closeDeleteModal();
    }
});


/* ══════════════════════════════════════════════
   ACADEMIC STRUCTURE PANEL
   ══════════════════════════════════════════════ */

/* ── Panel toggle (collapse / expand) ────────── */

const acadToggle  = $('#acadToggle');
const acadBody    = $('#acadBody');
const acadChevron = $('#acadChevron');

acadToggle?.addEventListener('click', () => {
    const isOpen = acadBody.classList.contains('acad-panel__body--open');
    acadBody.classList.toggle('acad-panel__body--open', !isOpen);
    acadBody.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
    acadChevron.classList.toggle('acad-panel__chevron--open', !isOpen);
    acadToggle.setAttribute('aria-expanded', !isOpen);
});


/* ── Year expand / collapse ───────────────────── */

document.addEventListener('click', e => {
    const expandBtn = e.target.closest('.acad-year__expand');
    if (!expandBtn) return;
    const year      = expandBtn.closest('.acad-year');
    const semList   = year?.querySelector('.acad-semesters');
    if (!semList) return;

    const isOpen = !semList.classList.contains('acad-semesters--hidden');
    semList.classList.toggle('acad-semesters--hidden', isOpen);
    expandBtn.setAttribute('aria-expanded', !isOpen);

    // Rotate the chevron icon
    const icon = expandBtn.querySelector('i');
    icon.style.transform = isOpen ? '' : 'rotate(90deg)';
    icon.style.transition = 'transform 220ms';
});


/* ── Set current semester ─────────────────────── */

function setCurrentSemester(semId) {
    // Remove current styling from all semesters
    $$('.acad-semester--current').forEach(s => {
        s.classList.remove('acad-semester--current');
        const tag = s.querySelector('.acad-semester__tag');
        if (tag) { tag.textContent = 'Done'; tag.classList.add('acad-semester__tag--done'); }
    });
    $$('.acad-year__badge').forEach(b => b.remove());

    // Apply to the target
    const target = $(`.acad-semester[data-sem-id="${semId}"]`);
    if (!target) return;
    target.classList.add('acad-semester--current');
    const tag = target.querySelector('.acad-semester__tag');
    if (tag) { tag.textContent = 'Current'; tag.classList.remove('acad-semester__tag--done'); }

    // Badge on parent year
    const year = target.closest('.acad-year');
    const yearLabel = year?.querySelector('.acad-year__label');
    if (yearLabel) {
        const badge = document.createElement('span');
        badge.className = 'acad-year__badge';
        badge.textContent = 'Current';
        yearLabel.after(badge);
    }

    // Update page subtitle badge
    const semName  = target.querySelector('.acad-semester__name')?.textContent;
    const yearName = year?.querySelector('.acad-year__label')?.textContent;
    const badge = $('#pageHeaderSub');
    if (badge && semName) {
        badge.querySelector('.current-sem-badge__text').textContent = semName;
        if (yearName) badge.querySelector('.current-sem-badge__year').textContent = yearName;
    }

    // Rebuild semester dropdown in course modal
    rebuildSemesterDropdown();

    // TODO: persist via PATCH /api/settings/current-semester
    console.log('Set current semester:', semId, semName, yearName);
}

document.addEventListener('click', e => {
    if (!e.target.closest('[data-action="set-current"]')) return;
    const btn = e.target.closest('[data-action="set-current"]');
    setCurrentSemester(btn.dataset.id);
});


/* ── Rebuild semester dropdown in Add Course modal ── */

function rebuildSemesterDropdown() {
    const select = $('#courseSemester');
    if (!select) return;
    select.innerHTML = '';
    const currentSemId = $('.acad-semester--current')?.dataset.semId;

    $$('.acad-year').forEach(year => {
        const yearLabel = year.querySelector('.acad-year__label')?.textContent;
        const isCurrent = !!year.querySelector('.acad-year__badge');
        const group     = document.createElement('optgroup');
        group.label     = isCurrent ? `${yearLabel} (Current)` : yearLabel;

        year.querySelectorAll('.acad-semester').forEach(sem => {
            const opt   = document.createElement('option');
            opt.value   = sem.dataset.semId;
            const name  = sem.querySelector('.acad-semester__name')?.textContent;
            const isCurrentSem = sem.classList.contains('acad-semester--current');
            opt.textContent = isCurrentSem ? `${name} (Current)` : name;
            if (sem.dataset.semId === currentSemId) opt.selected = true;
            group.appendChild(opt);
        });

        if (group.children.length > 0) select.appendChild(group);
    });
}

// Run once on load
rebuildSemesterDropdown();


/* ── Add Academic Year ────────────────────────── */

const addYearModal     = $('#addYearModal');
const addYearModalTitle = $('#addYearModalTitle');

function openAddYearModal() {
    $('#yearName').value = '';
    addYearModal.classList.add('is-open');
    addYearModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('#yearName').focus(), 50);
}

function closeAddYearModal() {
    addYearModal.classList.remove('is-open');
    addYearModal.setAttribute('aria-hidden', 'true');
}

$('#addYearBtn')?.addEventListener('click', openAddYearModal);
$('#closeAddYearModal')?.addEventListener('click', closeAddYearModal);
$('#cancelAddYearModal')?.addEventListener('click', closeAddYearModal);
addYearModal?.addEventListener('click', e => { if (e.target === addYearModal) closeAddYearModal(); });

$('#saveYearBtn')?.addEventListener('click', () => {
    const name = $('#yearName')?.value.trim();
    if (!name) { $('#yearName').focus(); return; }

    const newId   = Date.now();
    const yearEl  = document.createElement('div');
    yearEl.className = 'acad-year';
    yearEl.dataset.yearId = newId;
    yearEl.innerHTML = `
        <div class="acad-year__header">
            <button class="acad-year__expand" aria-expanded="true">
                <i class="fa-solid fa-chevron-right" style="transform:rotate(90deg);transition:transform 220ms;"></i>
            </button>
            <span class="acad-year__label">${name}</span>
            <div class="acad-year__actions">
                <button class="acad-action" data-action="rename-year" data-id="${newId}"><i class="fa-solid fa-pen"></i></button>
                <button class="acad-action acad-action--danger" data-action="delete-year" data-id="${newId}"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        <div class="acad-semesters" id="semesters-year-${newId}">
            <button class="add-sem-btn" data-year-id="${newId}">
                <i class="fa-solid fa-plus"></i> add semester
            </button>
        </div>`;

    $('#acadYears').insertBefore(yearEl, $('.add-year-btn'));

    // TODO: POST /api/academic-years
    console.log('Added year:', name, newId);
    closeAddYearModal();
    rebuildSemesterDropdown();
});


/* ── Add Semester ─────────────────────────────── */

const addSemModal = $('#addSemModal');
let pendingYearId = null;

function openAddSemModal(yearId) {
    pendingYearId = yearId;
    $('#semName').value = '';
    addSemModal.classList.add('is-open');
    addSemModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('#semName').focus(), 50);
}

function closeAddSemModal() {
    addSemModal.classList.remove('is-open');
    addSemModal.setAttribute('aria-hidden', 'true');
    pendingYearId = null;
}

document.addEventListener('click', e => {
    const btn = e.target.closest('.add-sem-btn');
    if (!btn) return;
    openAddSemModal(btn.dataset.yearId);
});

$('#closeAddSemModal')?.addEventListener('click', closeAddSemModal);
$('#cancelAddSemModal')?.addEventListener('click', closeAddSemModal);
addSemModal?.addEventListener('click', e => { if (e.target === addSemModal) closeAddSemModal(); });

$('#saveSemBtn')?.addEventListener('click', () => {
    const name = $('#semName')?.value.trim();
    if (!name || !pendingYearId) { $('#semName').focus(); return; }

    const semId  = `${pendingYearId}-${Date.now()}`;
    const semEl  = document.createElement('div');
    semEl.className = 'acad-semester';
    semEl.dataset.semId = semId;
    semEl.innerHTML = `
        <div class="acad-semester__dot"></div>
        <span class="acad-semester__name">${name}</span>
        <span class="acad-semester__tag acad-semester__tag--done">Done</span>
        <div class="acad-semester__actions">
            <button class="acad-action" data-action="rename-sem" data-id="${semId}"><i class="fa-solid fa-pen"></i></button>
            <button class="acad-action" data-action="set-current" data-id="${semId}"><i class="fa-solid fa-star"></i></button>
            <button class="acad-action acad-action--danger" data-action="delete-sem" data-id="${semId}"><i class="fa-solid fa-trash"></i></button>
        </div>`;

    const semList   = $(`#semesters-year-${pendingYearId}`);
    const addSemBtn = semList?.querySelector('.add-sem-btn');
    if (addSemBtn) semList.insertBefore(semEl, addSemBtn);

    // TODO: POST /api/semesters
    console.log('Added semester:', name, semId);
    closeAddSemModal();
    rebuildSemesterDropdown();
});


/* ── Rename year / semester ───────────────────── */

const renameModal = $('#renameModal');
let renameTarget  = null; // { type: 'year'|'sem', id, el }

function openRenameModal(type, id, currentName) {
    $('#renameModalTitle').textContent = type === 'year' ? 'Rename Year' : 'Rename Semester';
    $('#renameInput').value = currentName;
    renameTarget = { type, id };
    renameModal.classList.add('is-open');
    renameModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => { const inp = $('#renameInput'); inp.focus(); inp.select(); }, 50);
}

function closeRenameModal() {
    renameModal.classList.remove('is-open');
    renameModal.setAttribute('aria-hidden', 'true');
    renameTarget = null;
}

document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="rename-year"]');
    if (!btn) return;
    const year  = btn.closest('.acad-year');
    const label = year?.querySelector('.acad-year__label')?.textContent;
    openRenameModal('year', btn.dataset.id, label);
});

document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="rename-sem"]');
    if (!btn) return;
    const sem  = btn.closest('.acad-semester');
    const name = sem?.querySelector('.acad-semester__name')?.textContent;
    openRenameModal('sem', btn.dataset.id, name);
});

$('#closeRenameModal')?.addEventListener('click', closeRenameModal);
$('#cancelRenameModal')?.addEventListener('click', closeRenameModal);
renameModal?.addEventListener('click', e => { if (e.target === renameModal) closeRenameModal(); });

$('#saveRenameBtn')?.addEventListener('click', () => {
    const newName = $('#renameInput')?.value.trim();
    if (!newName || !renameTarget) return;

    if (renameTarget.type === 'year') {
        const year  = $(`.acad-year[data-year-id="${renameTarget.id}"]`);
        const label = year?.querySelector('.acad-year__label');
        if (label) label.textContent = newName;
        // Update page subtitle if this is the current year
        if (year?.querySelector('.acad-year__badge')) {
            const badge = $('#pageHeaderSub');
            if (badge) badge.querySelector('.current-sem-badge__year').textContent = newName;
        }
    } else {
        const sem  = $(`.acad-semester[data-sem-id="${renameTarget.id}"]`);
        const name = sem?.querySelector('.acad-semester__name');
        if (name) name.textContent = newName;
        // Update page subtitle if this is the current semester
        if (sem?.classList.contains('acad-semester--current')) {
            const yearName = sem.closest('.acad-year')?.querySelector('.acad-year__label')?.textContent;
            const badge = $('#pageHeaderSub');
            if (badge) {
                badge.querySelector('.current-sem-badge__text').textContent = newName;
                if (yearName) badge.querySelector('.current-sem-badge__year').textContent = yearName;
            }
        }
    }

    // TODO: PATCH /api/academic-years/:id or /api/semesters/:id
    console.log('Renamed:', renameTarget.type, renameTarget.id, '→', newName);
    closeRenameModal();
    rebuildSemesterDropdown();
});


/* ── Delete year / semester ───────────────────── */

document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="delete-year"]');
    if (!btn) return;
    const year = $(`.acad-year[data-year-id="${btn.dataset.id}"]`);
    if (!year) return;
    if (!confirm(`Remove this academic year and all its semesters?`)) return;
    year.style.transition = 'opacity 220ms';
    year.style.opacity = '0';
    setTimeout(() => { year.remove(); rebuildSemesterDropdown(); }, 230);
    // TODO: DELETE /api/academic-years/:id
});

document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="delete-sem"]');
    if (!btn) return;
    const sem = $(`.acad-semester[data-sem-id="${btn.dataset.id}"]`);
    if (!sem) return;
    if (!confirm(`Remove this semester?`)) return;
    sem.style.transition = 'opacity 220ms';
    sem.style.opacity = '0';
    setTimeout(() => { sem.remove(); rebuildSemesterDropdown(); }, 230);
    // TODO: DELETE /api/semesters/:id
});


/* ── Global Escape closes all modals ─────────── */
// (extends the existing escape listener already in the file)
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeAddYearModal();
    closeAddSemModal();
    closeRenameModal();
});