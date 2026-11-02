/**
 * Grade9 v4.0 — Public Synthetic HTML Alpha Preview Script
 * Offline-first, client-side only. Zero remote network calls.
 * Learner reasoning is kept local in sessionStorage and never persisted remotely.
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

// Practice Step-by-Step Gate with Reasoning Requirement
function initPracticeGate() {
    const optionButtons = document.querySelectorAll('.practice-options .btn-option');
    const reasoningInput = document.getElementById('learner-reasoning');
    const submitBtn = document.getElementById('btn-submit-answer');
    const hintBtn = document.getElementById('btn-hint');
    const hintPanel = document.getElementById('panel-hint');
    const solutionPanel = document.getElementById('panel-solution');
    const validationMessage = document.getElementById('validation-message');

    let selectedValue = null;

    if (optionButtons.length > 0) {
        optionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                optionButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedValue = btn.getAttribute('data-value');
                clearValidation();
            });
        });
    }

    if (hintBtn && hintPanel) {
        hintBtn.addEventListener('click', () => {
            const isHidden = !hintPanel.classList.contains('active');
            if (isHidden) {
                hintPanel.classList.add('active');
                hintBtn.textContent = 'Hide Physical Hint';
            } else {
                hintPanel.classList.remove('active');
                hintBtn.textContent = 'Show Physical Hint';
            }
        });
    }

    function clearValidation() {
        if (validationMessage) {
            validationMessage.textContent = '';
            validationMessage.style.display = 'none';
        }
    }

    function showValidation(msg, isError = true) {
        if (validationMessage) {
            validationMessage.textContent = msg;
            validationMessage.style.display = 'block';
            validationMessage.style.color = isError ? '#b91c1c' : '#15803d';
            validationMessage.style.marginTop = '8px';
            validationMessage.style.fontWeight = '600';
        }
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (!selectedValue) {
                showValidation('Please select an answer option first.');
                return;
            }

            const reasoning = reasoningInput ? reasoningInput.value.trim() : '';
            if (reasoning.length < 10) {
                showValidation('Reasoning Gate: Please write your brief physical reasoning before submitting (minimum 10 characters).');
                if (reasoningInput) reasoningInput.focus();
                return;
            }

            // Valid submission: reveal worked solution
            if (solutionPanel) {
                solutionPanel.classList.add('active');
            }

            // Record completion in local sessionStorage
            try {
                const stored = JSON.parse(sessionStorage.getItem('grade9_alpha_progress') || '{}');
                stored.practiceCompleted = true;
                stored.selectedAnswer = selectedValue;
                stored.timestamp = new Date().toISOString();
                sessionStorage.setItem('grade9_alpha_progress', JSON.stringify(stored));
            } catch (e) {
                // Ignore storage errors in restrictive environments
            }

            if (selectedValue === 'correct') {
                showValidation('Physical assertion verified! Mechanical Energy is conserved.', false);
            } else {
                showValidation('Review the worked derivation below to analyze the work-energy relations.', false);
            }
        });
    }
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
        const practiceDone = !!progressData.practiceCompleted;

        const lessonStatusEl = document.getElementById('status-wpe-lesson');
        const practiceStatusEl = document.getElementById('status-wpe-practice');
        const summaryEl = document.getElementById('progress-summary-text');

        if (lessonStatusEl) {
            lessonStatusEl.textContent = lessonVisited ? 'Completed / Visited' : 'Not Started';
            lessonStatusEl.className = lessonVisited ? 'badge badge-active' : 'badge badge-hold';
        }

        if (practiceStatusEl) {
            practiceStatusEl.textContent = practiceDone ? 'Submitted & Reviewed' : 'Not Started';
            practiceStatusEl.className = practiceDone ? 'badge badge-active' : 'badge badge-hold';
        }

        if (summaryEl) {
            if (practiceDone && lessonVisited) {
                summaryEl.textContent = 'Alpha Pilot WPE Module completed in current local session.';
            } else if (lessonVisited || practiceDone) {
                summaryEl.textContent = 'Alpha Pilot WPE Module partially explored in current local session.';
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
