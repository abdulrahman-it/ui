(() => {
    'use strict';

    /* ──────────────────────────────────────
       STATE
    ────────────────────────────────────── */
    let currentLang = 'ar';
    let isDark = false;
    let resendTimer = null;

    // Define OTP inputs globally within the closure
    var otpInputs = Array.from(document.querySelectorAll('.otp-box'));

    /* ──────────────────────────────────────
       UTILS
    ────────────────────────────────────── */
    function showToast(message, type) {
        type = type || 'info';
        var icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
        var container = document.getElementById('toastContainer');
        var toast = document.createElement('div');
        toast.className = 'toast-item ' + type;
        toast.innerHTML = '<i class="fa-solid ' + icons[type] + '"></i><span>' + message + '</span>';
        container.appendChild(toast);
        setTimeout(function () {
            toast.style.animation = 'toastOut 0.35s ease forwards';
            setTimeout(function () { toast.remove(); }, 350);
        }, 3500);
    }

    function setButtonLoading(btn, loading) {
        var span = btn.querySelector('span');
        var labelText = span ? span.textContent : '';
        btn.disabled = loading;
        if (loading) {
            btn.innerHTML = '<span>' + labelText + '</span><span class="btn-spinner"></span>';
        } else {
            var spinners = btn.querySelectorAll('.btn-spinner');
            spinners.forEach(function (s) { s.remove(); });
            btn.disabled = false;
        }
    }

    function generateOTP() {
        return String(Math.floor(1000 + Math.random() * 9000));
    }

    /* ──────────────────────────────────────
       STEP NAVIGATION
    ────────────────────────────────────── */
    function goToStep(n) {
        document.querySelectorAll('.fp-step').forEach(function (s) { s.classList.remove('active'); });
        document.getElementById('step' + n).classList.add('active');

        var dots = document.querySelectorAll('.step-dot');
        dots.forEach(function (d, i) {
            d.classList.remove('active', 'done');
            if (i + 1 < n) d.classList.add('done');
            else if (i + 1 === n) d.classList.add('active');
        });

        // Re-trigger success animation
        if (n === 4) {
            var icon = document.getElementById('successCheckIcon');
            icon.style.transform = 'scale(0)';
            void icon.offsetWidth;
            icon.style.animation = 'none';
            void icon.offsetWidth;
            icon.style.animation = '';
        }
    }

    /* ──────────────────────────────────────
       RESEND COUNTDOWN
    ────────────────────────────────────── */
    function startResendCountdown(seconds) {
        seconds = seconds || 30;
        var resendBtn = document.getElementById('resendOtpBtn');
        if (!resendBtn) return;

        // Clear any previous timer
        if (resendTimer) { clearInterval(resendTimer); resendTimer = null; }

        resendBtn.disabled = true;
        var remaining = seconds;

        function updateLabel() {
            var text = currentLang === 'ar'
                ? ('يمكنك إعادة الإرسال بعد ' + remaining + ' ثانية')
                : ('Resend available in ' + remaining + 's');
            resendBtn.querySelector('span').textContent = text;
        }
        updateLabel();

        resendTimer = setInterval(function () {
            remaining--;
            if (remaining <= 0) {
                clearInterval(resendTimer);
                resendTimer = null;
                resendBtn.disabled = false;
                resendBtn.querySelector('span').textContent =
                    currentLang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code';
            } else {
                updateLabel();
            }
        }, 1000);
    }

    /* ──────────────────────────────────────
       STEP 1 — Send OTP (UI Only)
    ────────────────────────────────────── */
    var step1Form = document.getElementById('step1Form');
    if (step1Form) {
        step1Form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = document.getElementById('sendOtpBtn');
            if (btn) setButtonLoading(btn, true);

            setTimeout(function () {
                if (btn) setButtonLoading(btn, false);
                
                showToast(
                    currentLang === 'ar' ? 'تم إرسال رمز التحقق ✓' : 'Verification code sent ✓',
                    'success'
                );

                goToStep(2);

                setTimeout(function () {
                    var first = document.getElementById('otp1');
                    if (first) first.focus();
                }, 200);
            }, 800);
        });
    }

    /* ──────────────────────────────────────
       RESEND BUTTON (Step 2)
    ────────────────────────────────────── */
    var resendBtn = document.getElementById('resendOtpBtn');

    if (resendBtn) {
        resendBtn.addEventListener('click', function () {
            if (resendBtn.disabled) return;

            // إشعار شكلي فقط
            showToast(
                currentLang === 'ar'
                    ? 'تم إعادة إرسال الرمز ✓'
                    : 'Code resent ✓',
                'info'
            );

            // تنظيف الحقول فقط (UI)
            otpInputs.forEach(function (b) {
                b.value = '';
                b.classList.remove('filled');
            });

            var first = document.getElementById('otp1');
            if (first) first.focus();
        });
    }

    /* ──────────────────────────────────────
       STEP 2 — OTP Input behaviour (Safe Focus Logic)
    ────────────────────────────────────── */
    otpInputs.forEach(function (box, i) {
        box.addEventListener('input', function () {
            box.value = box.value.replace(/[^0-9]/g, '');
            if (box.value) {
                box.classList.add('filled');
                if (i < otpInputs.length - 1) otpInputs[i + 1].focus();
            } else {
                box.classList.remove('filled');
            }
        });

        box.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && !box.value && i > 0) {
                otpInputs[i - 1].focus();
                otpInputs[i - 1].value = '';
                otpInputs[i - 1].classList.remove('filled');
            }
        });
    });

    var step2Form = document.getElementById('step2Form');
    if (step2Form) {
        step2Form.addEventListener('submit', function (e) {
            e.preventDefault();

            var btn = document.getElementById('verifyOtpBtn');
            if (btn) setButtonLoading(btn, true);

            // ✅ UI ONLY: Immediately redirect to login on "Verify"
            setTimeout(function () {
                if (btn) setButtonLoading(btn, false);
                window.location.href = 'login.html';
            }, 800);
        });
    }

    /* ──────────────────────────────────────
       STEP 3 — Reset Password
    ────────────────────────────────────── */
    document.getElementById('step3Form').addEventListener('submit', function (e) {
        e.preventDefault();
        var pw = document.getElementById('newPassword').value;
        var cpw = document.getElementById('confirmPassword').value;

        if (pw.length < 6) {
            showToast(
                currentLang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
                'error'
            );
            return;
        }
        if (pw !== cpw) {
            showToast(
                currentLang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match',
                'error'
            );
            return;
        }

        var btn = document.getElementById('resetBtn');
        setButtonLoading(btn, true);

        setTimeout(function () {
            setButtonLoading(btn, false);
            showToast(
                currentLang === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!',
                'success'
            );
            goToStep(4);
            // Auto-redirect to login after 2 seconds
            setTimeout(function () { window.location.href = 'login.html'; }, 2000);
        }, 1400);
    });

    /* ──────────────────────────────────────
       PASSWORD SHOW / HIDE
    ────────────────────────────────────── */
    function setupToggle(toggleId, inputId) {
        var toggleEl = document.getElementById(toggleId);
        if (!toggleEl) return;
        toggleEl.addEventListener('click', function () {
            var input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                toggleEl.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                toggleEl.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }
    setupToggle('toggleNew', 'newPassword');
    setupToggle('toggleConfirm', 'confirmPassword');

    /* ──────────────────────────────────────
       DARK MODE  (persisted in localStorage)
    ────────────────────────────────────── */
    var darkBtn = document.getElementById('darkModeToggle');
    var darkIcon = darkBtn.querySelector('i');

    function applyDark(dark) {
        isDark = dark;
        document.body.classList.toggle('dark-mode', dark);
        darkIcon.classList.toggle('fa-moon', !dark);
        darkIcon.classList.toggle('fa-sun', dark);
        localStorage.setItem('fp_darkMode', dark ? '1' : '0');
    }

    // Restore saved preference on page load
    applyDark(localStorage.getItem('fp_darkMode') === '1');

    darkBtn.addEventListener('click', function () { applyDark(!isDark); });

    /* ──────────────────────────────────────
       LANGUAGE TOGGLE
    ────────────────────────────────────── */
    var langBtn = document.getElementById('langToggle');

    function applyLang(lang) {
        currentLang = lang;
        var isAr = lang === 'ar';
        document.documentElement.lang = lang;
        document.documentElement.dir = isAr ? 'rtl' : 'ltr';
        langBtn.textContent = isAr ? 'EN' : '\u0639';

        document.querySelectorAll('[data-ar]').forEach(function (el) {
            el.textContent = isAr ? el.dataset.ar : el.dataset.en;
        });
        document.querySelectorAll('[data-placeholder-ar]').forEach(function (el) {
            el.placeholder = isAr ? el.dataset.placeholderAr : el.dataset.placeholderEn;
        });
    }

    langBtn.addEventListener('click', function () {
        applyLang(currentLang === 'ar' ? 'en' : 'ar');
    });

})();
