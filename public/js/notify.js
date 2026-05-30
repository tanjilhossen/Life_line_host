(function () {
    const TYPE_CONFIG = {
        success: {
            title: 'সফল হয়েছে',
            icon: '✓',
            colors: {
                bar1: '#10b981', // emerald-500
                bar2: '#14b8a6', // teal-500
                btn: '#059669', // emerald-600
                btnGlow: 'rgba(5, 150, 105, 0.2)'
            }
        },
        error: {
            title: 'সমস্যা হয়েছে',
            icon: '!',
            colors: {
                bar1: '#dc2626', // red-600
                bar2: '#f43f5e', // rose-500
                btn: '#dc2626', // red-600
                btnGlow: 'rgba(220, 38, 38, 0.2)'
            }
        },
        warning: {
            title: 'সতর্কতা',
            icon: '!',
            colors: {
                bar1: '#f59e0b', // amber-500
                bar2: '#f97316', // orange-500
                btn: '#d97706', // amber-600
                btnGlow: 'rgba(217, 119, 6, 0.2)'
            }
        },
        info: {
            title: 'নোটিশ',
            icon: 'i',
            colors: {
                bar1: '#2563eb', // blue-600
                bar2: '#06b6d4', // cyan-500
                btn: '#2563eb', // blue-600
                btnGlow: 'rgba(37, 99, 235, 0.2)'
            }
        }
    };

    // Dynamically inject essential styling to make popups & toasts self-contained
    function injectStyles() {
        if (document.getElementById('lifelineNotifyStyles')) return;
        const style = document.createElement('style');
        style.id = 'lifelineNotifyStyles';
        style.textContent = `
            #lifelinePopupRoot {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                background-color: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                padding: 24px;
                font-family: 'Hind Siliguri', 'Inter', system-ui, -apple-system, sans-serif;
            }
            #lifelinePopupRoot.flex {
                display: flex;
            }
            .ll-popup-card {
                width: 100%;
                max-width: 440px;
                background: #ffffff;
                border-radius: 28px;
                box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
                overflow: hidden;
                transform: translateY(20px) scale(0.95);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
                opacity: 0;
            }
            .ll-popup-card.show {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            .ll-popup-bar {
                height: 8px;
                background: linear-gradient(90deg, var(--bar-color-1, #3b82f6), var(--bar-color-2, #06b6d4));
            }
            .ll-popup-body {
                padding: 36px 28px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .ll-popup-icon {
                width: 68px;
                height: 68px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 22px;
                background: linear-gradient(135deg, var(--bar-color-1, #3b82f6), var(--bar-color-2, #06b6d4));
                font-size: 34px;
                color: #ffffff;
                font-weight: 900;
                margin-bottom: 24px;
                box-shadow: 0 10px 20px -5px rgba(29, 78, 216, 0.3);
            }
            .ll-popup-title {
                font-size: 24px;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 12px 0;
                line-height: 1.2;
            }
            .ll-popup-desc {
                font-size: 15.5px;
                color: #475569;
                line-height: 1.6;
                margin: 0 0 28px 0;
                white-space: pre-line;
            }
            .ll-popup-btn {
                width: 100%;
                border: none;
                border-radius: 18px;
                padding: 15px 24px;
                font-size: 16px;
                font-weight: 700;
                color: #ffffff;
                background: var(--btn-color, #1e40af);
                cursor: pointer;
                box-shadow: 0 4px 12px var(--btn-glow, rgba(30, 64, 175, 0.2));
                transition: all 0.2s ease;
                outline: none;
            }
            .ll-popup-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px var(--btn-glow, rgba(30, 64, 175, 0.35));
            }
            .ll-popup-btn:active {
                transform: translateY(0);
            }

            #lifelineToastContainer {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 100000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
                max-width: 400px;
                pointer-events: none;
                font-family: 'Hind Siliguri', 'Inter', system-ui, -apple-system, sans-serif;
            }
            .ll-toast {
                pointer-events: auto;
                width: 100%;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(15, 23, 42, 0.08);
                border-radius: 20px;
                box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04);
                display: flex;
                overflow: hidden;
                position: relative;
                transform: translateX(120%);
                opacity: 0;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
            }
            .ll-toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            .ll-toast-accent {
                width: 6px;
                background: linear-gradient(180deg, var(--bar-color-1, #3b82f6), var(--bar-color-2, #06b6d4));
            }
            .ll-toast-body {
                padding: 18px 20px;
                display: flex;
                align-items: center;
                gap: 16px;
                flex-grow: 1;
            }
            .ll-toast-icon {
                width: 40px;
                height: 40px;
                border-radius: 12px;
                background: linear-gradient(135deg, var(--bar-color-1, #3b82f6), var(--bar-color-2, #06b6d4));
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 800;
                flex-shrink: 0;
                box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
            }
            .ll-toast-content {
                flex-grow: 1;
            }
            .ll-toast-title {
                font-size: 15px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 2px;
            }
            .ll-toast-desc {
                font-size: 13.5px;
                color: #475569;
                line-height: 1.5;
            }
            .ll-toast-close {
                border: none;
                background: none;
                color: #94a3b8;
                font-size: 22px;
                font-weight: 300;
                cursor: pointer;
                padding: 12px 16px;
                align-self: center;
                transition: color 0.15s ease;
            }
            .ll-toast-close:hover {
                color: #475569;
            }
            .ll-toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--bar-color-1, #3b82f6), var(--bar-color-2, #06b6d4));
                width: 100%;
                transform-origin: left;
            }
            @media (max-width: 480px) {
                #lifelineToastContainer {
                    top: auto;
                    bottom: 24px;
                    right: 16px;
                    left: 16px;
                    max-width: none;
                }
                .ll-toast {
                    transform: translateY(120%);
                }
                .ll-toast.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    function ensurePopupRoot() {
        injectStyles();
        let root = document.getElementById('lifelinePopupRoot');
        if (!root) {
            root = document.createElement('div');
            root.id = 'lifelinePopupRoot';
            document.body.appendChild(root);
        }
        return root;
    }

    function ensureToastContainer() {
        injectStyles();
        let container = document.getElementById('lifelineToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'lifelineToastContainer';
            document.body.appendChild(container);
        }
        return container;
    }

    function showPopup(message, type = 'info', options = {}) {
        const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
        const root = ensurePopupRoot();
        const title = options.title || config.title;
        const buttonText = options.buttonText || 'ঠিক আছে';

        root.innerHTML = `
            <div class="ll-popup-card" style="--bar-color-1: ${config.colors.bar1}; --bar-color-2: ${config.colors.bar2}; --btn-color: ${config.colors.btn}; --btn-glow: ${config.colors.btnGlow};" role="dialog" aria-modal="true">
                <div class="ll-popup-bar"></div>
                <div class="ll-popup-body">
                    <div class="ll-popup-icon">
                        ${config.icon}
                    </div>
                    <h2 class="ll-popup-title">${title}</h2>
                    <p class="ll-popup-desc">${String(message)}</p>
                    <button type="button" class="ll-popup-btn">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;

        const card = root.querySelector('.ll-popup-card');
        const closeBtn = root.querySelector('button');
        
        root.className = 'flex';

        requestAnimationFrame(() => {
            card.classList.add('show');
            closeBtn.focus();
        });

        return new Promise((resolve) => {
            let closed = false;

            function close() {
                if (closed) return;
                closed = true;
                card.classList.remove('show');
                setTimeout(() => {
                    root.className = '';
                    root.innerHTML = '';
                    resolve();
                }, 200);
            }

            closeBtn.addEventListener('click', close);
            root.addEventListener('click', (event) => {
                if (event.target === root) close();
            });
            document.addEventListener('keydown', function onKeyDown(event) {
                if (event.key === 'Escape') {
                    document.removeEventListener('keydown', onKeyDown);
                    close();
                }
            });
        });
    }

    function showToast(message, type = 'info', duration = 3500) {
        const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
        const container = ensureToastContainer();
        const title = config.title;

        const toast = document.createElement('div');
        toast.className = 'll-toast';
        toast.style.cssText = `--bar-color-1: ${config.colors.bar1}; --bar-color-2: ${config.colors.bar2};`;
        toast.innerHTML = `
            <div class="ll-toast-accent"></div>
            <div class="ll-toast-body">
                <div class="ll-toast-icon">
                    ${config.icon}
                </div>
                <div class="ll-toast-content">
                    <div class="ll-toast-title">${title}</div>
                    <div class="ll-toast-desc">${message}</div>
                </div>
            </div>
            <button class="ll-toast-close" type="button">×</button>
            <div class="ll-toast-progress"></div>
        `;

        container.appendChild(toast);

        // Slide in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        const closeBtn = toast.querySelector('.ll-toast-close');
        const progressBar = toast.querySelector('.ll-toast-progress');

        // Progress bar animation
        progressBar.style.transition = `transform ${duration}ms linear`;
        progressBar.style.transform = 'scaleX(1)';
        requestAnimationFrame(() => {
            progressBar.style.transform = 'scaleX(0)';
        });

        let closed = false;
        function closeToast() {
            if (closed) return;
            closed = true;
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }

        closeBtn.addEventListener('click', closeToast);
        const timer = setTimeout(closeToast, duration);

        return {
            close: () => {
                clearTimeout(timer);
                closeToast();
            }
        };
    }

    window.showPopup = showPopup;
    window.showToast = showToast;
    window.alert = (message) => showPopup(message, 'info');
})();
