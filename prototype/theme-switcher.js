/**
 * Theme Switcher Widget
 * Floating button that opens theme selection panel
 * Usage: Include this file in any page after styles.css
 */

(function() {
    'use strict';

    // Create theme switcher HTML
    const themeSwitcherHTML = `
        <div id="theme-switcher" class="theme-switcher">
            <button class="theme-switcher__trigger" id="themeSwitcherTrigger" aria-label="Change theme" title="Change Theme">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            </button>

            <div class="theme-switcher__panel" id="themeSwitcherPanel">
                <div class="theme-switcher__header">
                    <h3>Choose Theme</h3>
                    <button class="theme-switcher__close" id="themeSwitcherClose">×</button>
                </div>
                <div class="theme-switcher__grid">
                    <button class="theme-option" data-theme="light">
                        <div class="theme-option__preview theme-option__preview--light">
                            <div class="theme-option__preview-bar"></div>
                            <div class="theme-option__preview-content">
                                <div class="theme-option__preview-block"></div>
                                <div class="theme-option__preview-block"></div>
                            </div>
                        </div>
                        <div class="theme-option__name">Light</div>
                        <div class="theme-option__check">✓</div>
                    </button>

                    <button class="theme-option" data-theme="dark">
                        <div class="theme-option__preview theme-option__preview--dark">
                            <div class="theme-option__preview-bar"></div>
                            <div class="theme-option__preview-content">
                                <div class="theme-option__preview-block"></div>
                                <div class="theme-option__preview-block"></div>
                            </div>
                        </div>
                        <div class="theme-option__name">Dark</div>
                        <div class="theme-option__check">✓</div>
                    </button>

                    <button class="theme-option" data-theme="ultradark">
                        <div class="theme-option__preview theme-option__preview--ultradark">
                            <div class="theme-option__preview-bar"></div>
                            <div class="theme-option__preview-content">
                                <div class="theme-option__preview-block"></div>
                                <div class="theme-option__preview-block"></div>
                            </div>
                        </div>
                        <div class="theme-option__name">Ultra Dark</div>
                        <div class="theme-option__check">✓</div>
                    </button>

                    <button class="theme-option" data-theme="emerald-trust">
                        <div class="theme-option__preview theme-option__preview--emerald">
                            <div class="theme-option__preview-bar"></div>
                            <div class="theme-option__preview-content">
                                <div class="theme-option__preview-block"></div>
                                <div class="theme-option__preview-block"></div>
                            </div>
                        </div>
                        <div class="theme-option__name">Emerald Trust</div>
                        <div class="theme-option__check">✓</div>
                    </button>

                    <button class="theme-option" data-theme="quantum-violet">
                        <div class="theme-option__preview theme-option__preview--quantum">
                            <div class="theme-option__preview-bar"></div>
                            <div class="theme-option__preview-content">
                                <div class="theme-option__preview-block"></div>
                                <div class="theme-option__preview-block"></div>
                            </div>
                        </div>
                        <div class="theme-option__name">Quantum Violet</div>
                        <div class="theme-option__check">✓</div>
                    </button>

                    <button class="theme-option" data-theme="copper-balance">
                        <div class="theme-option__preview theme-option__preview--copper">
                            <div class="theme-option__preview-bar"></div>
                            <div class="theme-option__preview-content">
                                <div class="theme-option__preview-block"></div>
                                <div class="theme-option__preview-block"></div>
                            </div>
                        </div>
                        <div class="theme-option__name">Copper Balance</div>
                        <div class="theme-option__check">✓</div>
                    </button>

                    <button class="theme-option" data-theme="regal-portfolio">
                        <div class="theme-option__preview theme-option__preview--regal">
                            <div class="theme-option__preview-bar"></div>
                            <div class="theme-option__preview-content">
                                <div class="theme-option__preview-block"></div>
                                <div class="theme-option__preview-block"></div>
                            </div>
                        </div>
                        <div class="theme-option__name">Regal Portfolio</div>
                        <div class="theme-option__check">✓</div>
                    </button>

                    <button class="theme-option" data-theme="carbon-edge">
                        <div class="theme-option__preview theme-option__preview--carbon">
                            <div class="theme-option__preview-bar"></div>
                            <div class="theme-option__preview-content">
                                <div class="theme-option__preview-block"></div>
                                <div class="theme-option__preview-block"></div>
                            </div>
                        </div>
                        <div class="theme-option__name">Carbon Edge</div>
                        <div class="theme-option__check">✓</div>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .theme-switcher__trigger {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--accent);
            border: none;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 1500;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .theme-switcher__trigger:hover {
            transform: scale(1.1) rotate(45deg);
            box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
        }

        .theme-switcher__panel {
            position: fixed;
            bottom: 96px;
            right: 24px;
            width: 360px;
            max-height: 600px;
            background: var(--bg-card);
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid var(--border);
            z-index: 1500;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: all 0.3s ease;
        }

        .theme-switcher__panel.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        .theme-switcher__header {
            padding: 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .theme-switcher__header h3 {
            margin: 0;
            font-size: 18px;
            color: var(--text);
        }

        .theme-switcher__close {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--bg);
            border: none;
            color: var(--text);
            font-size: 24px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .theme-switcher__close:hover {
            background: var(--bg-hover);
            color: var(--accent);
        }

        .theme-switcher__grid {
            padding: 16px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            max-height: 480px;
            overflow-y: auto;
        }

        .theme-option {
            background: var(--bg);
            border: 2px solid var(--border);
            border-radius: 12px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .theme-option:hover {
            border-color: var(--accent);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .theme-option.active {
            border-color: var(--accent);
            background: linear-gradient(135deg, rgba(var(--accent-rgb, 52, 152, 219), 0.1), var(--bg));
        }

        .theme-option__preview {
            width: 100%;
            aspect-ratio: 16/10;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .theme-option__preview-bar {
            height: 20%;
            width: 100%;
        }

        .theme-option__preview-content {
            padding: 4px;
            display: flex;
            gap: 4px;
            height: 80%;
        }

        .theme-option__preview-block {
            flex: 1;
            border-radius: 4px;
        }

        /* Light Theme Preview */
        .theme-option__preview--light {
            background: #f5f7fa;
        }

        .theme-option__preview--light .theme-option__preview-bar {
            background: #3498db;
        }

        .theme-option__preview--light .theme-option__preview-block {
            background: #ffffff;
        }

        /* Dark Theme Preview */
        .theme-option__preview--dark {
            background: #1a1d2e;
        }

        .theme-option__preview--dark .theme-option__preview-bar {
            background: #507bfc;
        }

        .theme-option__preview--dark .theme-option__preview-block {
            background: #252938;
        }

        /* Ultra Dark Theme Preview */
        .theme-option__preview--ultradark {
            background: #0a0e1a;
        }

        .theme-option__preview--ultradark .theme-option__preview-bar {
            background: #507bfc;
        }

        .theme-option__preview--ultradark .theme-option__preview-block {
            background: #121829;
        }

        /* Emerald Theme Preview */
        .theme-option__preview--emerald {
            background: #0a1e14;
        }

        .theme-option__preview--emerald .theme-option__preview-bar {
            background: #10b981;
        }

        .theme-option__preview--emerald .theme-option__preview-block {
            background: #142e23;
        }

        /* Quantum Theme Preview */
        .theme-option__preview--quantum {
            background: #14111f;
        }

        .theme-option__preview--quantum .theme-option__preview-bar {
            background: #8b5cf6;
        }

        .theme-option__preview--quantum .theme-option__preview-block {
            background: #1e1829;
        }

        /* Copper Theme Preview */
        .theme-option__preview--copper {
            background: #1a1310;
        }

        .theme-option__preview--copper .theme-option__preview-bar {
            background: #f97316;
        }

        .theme-option__preview--copper .theme-option__preview-block {
            background: #2a1f1a;
        }

        /* Regal Theme Preview */
        .theme-option__preview--regal {
            background: #14111a;
        }

        .theme-option__preview--regal .theme-option__preview-bar {
            background: #a855f7;
        }

        .theme-option__preview--regal .theme-option__preview-block {
            background: #1e1825;
        }

        /* Carbon Theme Preview */
        .theme-option__preview--carbon {
            background: #0f1419;
        }

        .theme-option__preview--carbon .theme-option__preview-bar {
            background: #06b6d4;
        }

        .theme-option__preview--carbon .theme-option__preview-block {
            background: #1a2028;
        }

        .theme-option__name {
            font-size: 13px;
            font-weight: 600;
            color: var(--text);
            text-align: center;
        }

        .theme-option__check {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--accent);
            color: white;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
        }

        .theme-option.active .theme-option__check {
            display: flex;
        }

        @media (max-width: 768px) {
            .theme-switcher__panel {
                width: calc(100vw - 48px);
                right: 24px;
                left: 24px;
            }

            .theme-switcher__grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);

    // Inject HTML
    document.addEventListener('DOMContentLoaded', function() {
        document.body.insertAdjacentHTML('beforeend', themeSwitcherHTML);

        // Get elements
        const trigger = document.getElementById('themeSwitcherTrigger');
        const panel = document.getElementById('themeSwitcherPanel');
        const close = document.getElementById('themeSwitcherClose');
        const themeOptions = document.querySelectorAll('.theme-option');

        // Set active theme
        const currentTheme = localStorage.getItem('theme') || 'light';
        themeOptions.forEach(option => {
            if (option.dataset.theme === currentTheme) {
                option.classList.add('active');
            }
        });

        // Toggle panel
        trigger.addEventListener('click', () => {
            panel.classList.toggle('active');
        });

        // Close panel
        close.addEventListener('click', () => {
            panel.classList.remove('active');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
                panel.classList.remove('active');
            }
        });

        // Handle theme selection
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                
                // Update active state
                themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Apply theme
                document.documentElement.className = theme;
                localStorage.setItem('theme', theme);

                // Close panel after short delay
                setTimeout(() => {
                    panel.classList.remove('active');
                }, 300);
            });
        });
    });
})();
