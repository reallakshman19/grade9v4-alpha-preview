/**
 * Grade9 v4.0 — Public Synthetic HTML Alpha Preview Script
 * Offline-first, client-side only. Zero remote network calls.
 * The controller stores only session status and selected answer, not learner reasoning text.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigationHighlight();
    initSlider();
    initPracticeGate();
    initProgress();
});

// Highlight the active page in navigation
function initNavigationHighlight() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav.top-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPage = href.split('/').pop().split('?')[0];
        const currentPage = currentPath.split('/').pop().split('?')[0] || 'index.html';
        if (linkPage === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

// Interactive Potential Energy & Work-Energy Slider
function initSlider() {
    const slider = document.getElementById('physics-slider');
    if (!slider) return;

    const valX = document.getElementById('val-x');
    const valU = document.getElementById('val-u');
    const valK = document.getElementById('val-k');
    const valV = document.getElementById('val-v');

    // System parameters: m = 1.0 kg, k = 100.0 N/m, Amplitude A = 0.50 m
    // Total Mechanical Energy E = 0.5 * k * A^2 = 0.5 * 100 * 0.25 = 12.50 J
    const m = 1.0;
    const k = 100.0;
    const E_tot = 12.50;

    function update() {
        const x = parseFloat(slider.value);
        const U = 0.5 * k * x * x;
        let K = E_tot - U;
        if (K < 0) K = 0;
        const v = Math.sqrt((2 * K) / m);

        if (valX) valX.textContent = `${x.toFixed(2)} m`;
        if (valU) valU.textContent = `${U.toFixed(2)} J`;
        if (valK) valK.textContent = `${K.toFixed(2)} J`;
        if (valV) valV.textContent = `${v.toFixed(2)} m/s`;
    }

    slider.addEventListener('input', update);
    update();
}

// Attempt/length gate only: no semantic rationale evaluation is performed.
function initPracticeGate() {
    const choices = Array.from(document.querySelectorAll('input[name="practice-answer"]'));
    const reasoningInput = document.getElementById('learner-reasoning');
    const submitBtn = document.getElementById('btn-submit-answer');
    const revealBtn = document.getElementById('btn-reveal-solution');
    const hintBtn = document.getElementById('btn-hint');
    const hintPanel = document.getElementById('panel-hint');
    const solutionPanel = document.getElementById('panel-solution');
    const validationMessage = document.getElementById('validation-message');

    function message(text, isError = true) {
        if (!validationMessage) return;
        validationMessage.textContent = text;
        validationMessage.style.display = text ? 'block' : 'none';
        validationMessage.style.color = isError ? '#b91c1c' : '#166534';
        validationMessage.style.marginTop = '8px';
        validationMessage.style.fontWeight = '600';
    }

    function concealSolution() {
        if (solutionPanel) {
            solutionPanel.hidden = true;
            solutionPanel.classList.remove('active');
        }
        if (revealBtn) {
            revealBtn.hidden = true;
            revealBtn.setAttribute('aria-expanded', 'false');
        }
    }

    choices.forEach(choice => choice.addEventListener('change', () => {
        concealSolution();
        message('');
    }));
    if (reasoningInput) reasoningInput.addEventListener('input', () => {
        concealSolution();
        message('');
    });

    if (hintBtn && hintPanel) hintBtn.addEventListener('click', () => {
        const expanded = hintPanel.classList.toggle('active');
        hintBtn.setAttribute('aria-expanded', String(expanded));
        hintBtn.textContent = expanded ? 'Hide Physical Hint' : 'Show Physical Hint';
    });

    if (submitBtn) submitBtn.addEventListener('click', () => {
        concealSolution();
        const choice = choices.find(c => c.checked);
        if (!choice) { message('Please select an answer option first.'); return; }
        const reasoning = reasoningInput ? reasoningInput.value.trim() : '';
        if (reasoning.length < 10) {
            message('Attempt-length gate: Enter at least 10 characters to record an attempt. This is not a reasoning check.');
            if (reasoningInput) reasoningInput.focus();
            return;
        }
        // Do not inspect, grade, or store the actual explanation.
        try {
            const stored = JSON.parse(sessionStorage.getItem('grade9_alpha_progress') || '{}');
            stored.practiceAttempted = true;
            stored.solutionViewed = false;
            stored.selectedAnswer = choice.value;
            stored.timestamp = new Date().toISOString();
            delete stored.practiceCompleted;
            sessionStorage.setItem('grade9_alpha_progress', JSON.stringify(stored));
        } catch (e) { /* session storage may be disabled */ }
        if (revealBtn) revealBtn.hidden = false;
        message('Attempt recorded (length requirement met). Your explanation has not been automatically graded. Select “Reveal Worked Solution” to compare your approach.', false);
    });

    if (revealBtn && solutionPanel) revealBtn.addEventListener('click', () => {
        if (revealBtn.hidden) return;
        solutionPanel.hidden = false;
        solutionPanel.classList.add('active');
        revealBtn.setAttribute('aria-expanded', 'true');
        try {
            const stored = JSON.parse(sessionStorage.getItem('grade9_alpha_progress') || '{}');
            if (stored.practiceAttempted) {
                stored.solutionViewed = true;
                sessionStorage.setItem('grade9_alpha_progress', JSON.stringify(stored));
            }
        } catch (e) { /* no persistent record required */ }
    });
}

// Progress and Session Management
function initProgress() {
    const progressStatus = document.getElementById('progress-status-display');
    const resetBtn = document.getElementById('btn-reset-progress');
    const resetFeedback = document.getElementById('reset-feedback');

    // Mark current lesson visited if on physics-wpe.html
    const currentPath = window.location.pathname;
    if (currentPath.includes('physics-wpe.html')) {
        try {
            const stored = JSON.parse(sessionStorage.getItem('grade9_alpha_progress') || '{}');
            stored.wpeLessonVisited = true;
            sessionStorage.setItem('grade9_alpha_progress', JSON.stringify(stored));
        } catch (e) {}
    }

    if (progressStatus) {
        let progressData = {};
        try {
            progressData = JSON.parse(sessionStorage.getItem('grade9_alpha_progress') || '{}');
        } catch (e) {}

        const lessonVisited = !!progressData.wpeLessonVisited;
        const practiceDone = !!progressData.practiceAttempted;

        const lessonStatusEl = document.getElementById('status-wpe-lesson');
        const practiceStatusEl = document.getElementById('status-wpe-practice');
        const summaryEl = document.getElementById('progress-summary-text');

        if (lessonStatusEl) {
            lessonStatusEl.textContent = lessonVisited ? 'Completed / Visited' : 'Not Started';
            lessonStatusEl.className = lessonVisited ? 'badge badge-active' : 'badge badge-hold';
        }

        if (practiceStatusEl) {
            practiceStatusEl.textContent = practiceDone ? 'Attempt recorded (ungraded)' : 'Not Started';
            practiceStatusEl.className = practiceDone ? 'badge badge-active' : 'badge badge-hold';
        }

        if (summaryEl) {
            if (practiceDone && lessonVisited) {
                summaryEl.textContent = 'Lesson visited and practice attempt recorded locally; no explanation was graded.';
            } else if (lessonVisited || practiceDone) {
                summaryEl.textContent = 'Alpha Pilot WPE Module partially explored locally; no grading performed.';
            } else {
                summaryEl.textContent = 'No local activity recorded in current session.';
            }
        }
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            try {
                sessionStorage.removeItem('grade9_alpha_progress');
            } catch (e) {}

            if (resetFeedback) {
                resetFeedback.style.display = 'block';
                resetFeedback.textContent = 'Local session progress cleared.';
                setTimeout(() => {
                    window.location.reload();
                }, 400);
            } else {
                window.location.reload();
            }
        });
    }
}
