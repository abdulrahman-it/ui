document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // 1. Sidebar Navigation
    // ============================================
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    const sections = document.querySelectorAll('.page-section');

    const switchSection = (targetId) => {
        // Remove active class from all links & sections
        navLinks.forEach(nl => nl.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        // Add active class to clicked link & target section
        const activeLink = Array.from(navLinks).find(link => link.getAttribute('data-target') === targetId);
        if (activeLink) activeLink.classList.add('active');
        document.getElementById(targetId)?.classList.add('active');

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================
    // Global Toast Notification System
    // ============================================
    const showToast = (message, type = 'error') => {
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        const bgColor = type === 'error' ? 'bg-danger' : 'bg-success';
        const icon = type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white ${bgColor} border-0 mt-2 fade`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center gap-2">
                    <i class="fa-solid ${icon} fs-5"></i>
                    <span class="fw-semibold">${message}</span>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onclick="this.closest('.toast').remove()"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Use Bootstrap's native logic visually without requiring bootstrap.js strictly
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (targetId) switchSection(targetId);
        });
    });

    // ============================================
    // 2. Button Simulated Behaviors
    // ============================================
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, .action-book-consultation, .action-join-session');
        if (!btn) return;

        // "احجز استشارة"
        if (btn.classList.contains('action-book-consultation') || btn.textContent.trim().includes('احجز استشارة')) {
            const basePath = window.location.pathname.includes('/student/') || window.location.pathname.includes('/consultant/') ? '../' : '';
            window.location.href = basePath + 'booking.html';
        }

        // "انضمام للجلسة"
        if (btn.classList.contains('action-join-session') || btn.textContent.trim() === 'انضمام للجلسة') {
            alert('تم الانضمام للجلسة');
        }

        // "عرض الكل" buttons
        if (btn.id === 'viewAllConsultantsBtn') {
            switchSection('consultants');
        }
        if (btn.id === 'viewAllAppointmentsBtn') {
            switchSection('appointments');
        }

        // Logout
        if (btn.id === 'logoutBtn') {
            const basePath = window.location.pathname.includes('/student/') || window.location.pathname.includes('/consultant/') ? '../' : '';
            window.location.href = basePath + 'login.html';
        }

        // "قبول" and "رفض" from Consultant Dashboard (if present)
        const text = btn.textContent.trim();
        if (text === 'قبول') {
            const row = btn.closest('tr');
            if (row) {
                const badge = row.querySelector('.badge');
                if (badge) {
                    badge.className = 'badge badge-custom badge-success';
                    badge.textContent = 'تم القبول';
                }
            }
        }
        if (text === 'رفض') {
            const row = btn.closest('tr');
            if (row) {
                const badge = row.querySelector('.badge');
                if (badge) {
                    badge.className = 'badge badge-custom badge-danger';
                    badge.textContent = 'مرفوض';
                }
            }
        }
    });

    // ============================================
    // 3. Register & Login Logic
    // ============================================
    const registerForm = document.getElementById('registerForm');
    const verifyForm = document.getElementById('verifyForm');
    const verificationStep = document.getElementById('verificationStep');
    const loginForm = document.getElementById('loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Password Validation
            const password = document.getElementById('regPassword');
            const confirm = document.getElementById('regConfirmPassword');
            
            if (password && confirm && password.value !== confirm.value) {
                showToast('كلمتا المرور غير متطابقتين!', 'error');
                return;
            }

            // Save userType to localStorage persistently
            const uType = document.querySelector('input[name="userType"]:checked');
            if (uType) {
                localStorage.setItem('userType', uType.value);
            }

            // Determine selected verification method for messaging
            const verifyMethod = document.querySelector('input[name="verifyMethod"]:checked');
            const methodText = (verifyMethod && verifyMethod.value === 'phone') ? 'رقم هاتفك' : 'بريدك الإلكتروني';

            // Simulate Loading State
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn ? btn.innerHTML : '';
            
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جاري إنشاء الحساب...';
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.9';
            }

            setTimeout(() => {
                // Smooth Form Transition
                registerForm.classList.add('fade-out');
                
                setTimeout(() => {
                    registerForm.style.display = 'none';
                    if (verificationStep) {
                        verificationStep.style.display = 'block';
                        verificationStep.classList.add('fade-in');
                        
                        // Show Success Toast
                        showToast(`تم إرسال الرمز 1234 إلى ${methodText}`, 'success');
                        
                        // Update Verification Message dynamically
                        const verifyMsg = document.getElementById('verifyMessage');
                        if (verifyMsg) verifyMsg.textContent = `تم إرسال رمز التحقق إلى ${methodText}.`;
                    }
                }, 300);

                // Revert button logic in background
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                }
            }, 1200);
        });
    }
    if (verifyForm) {
        const verifyBoxes = document.querySelectorAll('.verify-box');
        
        if (verifyBoxes.length > 0) {
            verifyBoxes.forEach((box, index) => {
                
                // Handle Input: Numbers only, one digit, auto-advance
                box.addEventListener('input', (e) => {
                    box.value = box.value.replace(/[^0-9]/g, '');
                    
                    if (box.value.length > 1) {
                        box.value = box.value.slice(0, 1);
                    }

                    if (box.value !== '' && index < verifyBoxes.length - 1) {
                        verifyBoxes[index + 1].focus();
                    }
                });

                // Handle Backspace: Move to previous when empty
                box.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        if (box.value === '' && index > 0) {
                            verifyBoxes[index - 1].focus();
                        }
                    }
                });

                // Handle Paste: Distribute pasted numeric clipboard elegantly
                box.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
                    
                    if (pasteData) {
                        for (let i = 0; i < verifyBoxes.length; i++) {
                            if (i >= index && pasteData[i - index]) {
                                verifyBoxes[i].value = pasteData[i - index];
                                
                                if (i === verifyBoxes.length - 1 || (i - index) === pasteData.length - 1) {
                                    verifyBoxes[i].focus();
                                }
                            }
                        }
                    }
                });
            });

            // Form Submission logic
            verifyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                let code = '';
                verifyBoxes.forEach(b => code += b.value);
                
                // تحقق من اكتمال الرمز
                if (code.length < verifyBoxes.length) {
                    showToast('الرجاء إدخال الرمز كاملاً المكون من 4 أرقام', 'error');
                    return;
                }

                if (code === '1234') {
                    const btn = e.target.querySelector('button');
                    if (btn) {
                        btn.innerHTML = '<i class="fa-solid fa-check"></i> تم التحقق بنجاح';
                        btn.style.backgroundColor = 'var(--accent-color)';
                        btn.style.borderColor = 'var(--accent-color)';
                        btn.style.pointerEvents = 'none';
                    }
                    
                    // تأخير بسيط لرؤية علامة الصح ثم الانتقال
                    setTimeout(() => {
                        const verifyStep = document.getElementById('verificationStep');
                        const successStep = document.getElementById('successStep');
                        if (verifyStep && successStep) {
                            verifyStep.style.display = 'none';
                            verifyStep.classList.remove('fade-in');
                            
                            successStep.style.display = 'block';
                            successStep.classList.add('fade-in');
                        }
                    }, 1000);
                } else {
                    // رمز خاطئ
                    showToast('رسالة خطأ: رمز التحقق غير صحيح!', 'error');
                    verifyBoxes.forEach(b => b.value = '');
                    verifyBoxes[0].focus();
                }
            });
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate inputs
            const emailOrPhone = document.getElementById('loginEmail');
            const password = document.getElementById('loginPassword');

            if (!emailOrPhone || !password || emailOrPhone.value.trim() === '' || password.value.trim() === '') {
                showToast('الرجاء إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور', 'error');
                return;
            }

            if (password.value !== '1234') {
                showToast('عذراً، بيانات الدخول غير صحيحة! (للتجربة: كلمة المرور هي 1234)', 'error');
                return;
            }

            const btn = e.target.querySelector('button');
            const originalText = btn ? btn.innerHTML : '';
            
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جاري تسجيل الدخول...';
                btn.style.opacity = '0.9';
                btn.style.pointerEvents = 'none';
            }

            // Decide Role-based Target Path using localStorage
            const savedUserType = localStorage.getItem('userType');
            let targetUrl = 'index.html'; // Default admin dashboard
            
            if (savedUserType === 'student') {
                targetUrl = 'student/dashboard.html';
            } else if (savedUserType === 'consultant') {
                targetUrl = 'consultant/dashboard.html';
            }

            // Show Success Notification
            showToast('تم تسجيل الدخول بنجاح! جاري التوجيه...', 'success');

            setTimeout(() => {
                const basePath = window.location.pathname.includes('/student/') || window.location.pathname.includes('/consultant/') ? '../' : '';
                window.location.href = basePath + targetUrl;
                
                // Silent revert for back button caching
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                }
            }, 1500);
        });
    }

// ============================================
// 4. Chat System
// ============================================
const chatContainers = document.querySelectorAll('.chat-container');
chatContainers.forEach(container => {
    const chatInput = container.querySelector('input[type="text"]');
    const sendBtn = container.querySelector('.chat-send-btn') || container.querySelector('.fa-paper-plane')?.closest('button');
    const messagesArea = container.querySelector('.chat-messages');

    if (chatInput && sendBtn && messagesArea) {
        const sendMessage = () => {
            const msg = chatInput.value.trim();
            if (msg) {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message message-sent';
                msgDiv.textContent = msg;
                messagesArea.appendChild(msgDiv);
                chatInput.value = '';
                messagesArea.scrollTop = messagesArea.scrollHeight;
                // Remove Empty state if exists
                const emptyState = messagesArea.querySelector('.chat-empty-state');
                if (emptyState) emptyState.remove();
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// ============================================
// 5. Profile Forms
// ============================================
const studentProfileForm = document.getElementById('studentProfileForm');
if (studentProfileForm) {
    studentProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('تم تحديث الملف الشخصي بنجاح');
    });
}

    // ============================================
    // 6. Global UX Enhancements (Dark Mode, Language, Social Logins)
    // ============================================
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                if (document.body.classList.contains('dark-mode')) {
                    icon.className = 'fa-solid fa-sun fs-5';
                } else {
                    icon.className = 'fa-solid fa-moon fs-5';
                }
            }
        });
    }

    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            if (langToggle.textContent.trim() === 'EN') {
                langToggle.textContent = 'AR';
            } else {
                langToggle.textContent = 'EN';
            }
        });
    }

    const socialBtns = document.querySelectorAll('.social-login-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('تسجيل دخول تجريبي عبر منصة خارجية', 'success');
        });
    });

    // ============================================
    // 7. Shared Navigation & Scroll Logic
    // ============================================
    
    // Professional Navigation Helper (Gloablly accessible)
    window.handleNavigation = function(url, btn) {
        if (!btn || btn.classList.contains('loading')) return;
        
        // Show loading state
        btn.classList.add('loading');
        btn.disabled = true;
        
        const span = btn.querySelector('span');
        if (span) span.textContent = 'جاري التحميل...';

        setTimeout(() => {
            document.body.classList.add('page-fade-out');
            setTimeout(() => {
                window.location.href = url;
            }, 400); 
        }, 800); 
    };

    // Consultant Selection Helper
    window.selectConsultant = function(url, btn) {
        handleNavigation(url, btn);
    };

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
