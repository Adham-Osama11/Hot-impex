document.addEventListener('DOMContentLoaded', function() {
    // --- THEME MANAGEMENT ---
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

        const applyTheme = (isDark) => {
        html.classList.toggle('dark', isDark);
        updateThemeToggleIcon(isDark);
        updateChartsTheme(isDark);
    };    const updateThemeToggleIcon = (isDark) => {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('svg');
        if (!icon) return;

        if (isDark) {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;
            themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;
            themeToggle.setAttribute('title', 'Switch to dark mode');
        }
    };

    const toggleTheme = () => {
        const isCurrentlyDark = html.classList.contains('dark');
        const newIsDark = !isCurrentlyDark;
        localStorage.setItem('darkMode', newIsDark.toString());
        applyTheme(newIsDark);
    };

    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('darkMode');
        const isDark = savedTheme !== null ? savedTheme === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(isDark);
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
            applyTheme(e.matches);
        }
    });

    // --- MOBILE SIDEBAR ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const floatingSidebar = document.getElementById('floating-sidebar');

    if (mobileMenuToggle && mobileOverlay && floatingSidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            floatingSidebar.classList.toggle('open');
            mobileOverlay.classList.toggle('hidden');
            document.body.style.overflow = floatingSidebar.classList.contains('open') ? 'hidden' : '';
        });

        mobileOverlay.addEventListener('click', () => {
            floatingSidebar.classList.remove('open');
            mobileOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                floatingSidebar.classList.remove('open');
                mobileOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    // --- SIDEBAR NAVIGATION ---
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSections = document.querySelectorAll('.admin-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const activeClasses = ['opacity-100'];
            const inactiveClasses = ['opacity-50'];

            sidebarLinks.forEach(l => {
                l.classList.remove(...activeClasses);
                l.classList.add(...inactiveClasses);
            });
            
            link.classList.add(...activeClasses);
            link.classList.remove(...inactiveClasses);
            
            adminSections.forEach(section => section.classList.add('hidden'));
            
            const targetSectionId = link.getAttribute('data-section') + '-section';
            const targetElement = document.getElementById(targetSectionId);
            if (targetElement) {
                targetElement.classList.remove('hidden');
            }

            const sectionTitle = link.textContent.trim();
            const headerTitle = document.querySelector('main h1');
            if (headerTitle) {
                headerTitle.textContent = sectionTitle === 'Dashboard' ? 'Dashboard Overview' : sectionTitle + ' Management';
            }

            if (window.innerWidth < 1024 && floatingSidebar.classList.contains('open')) {
                floatingSidebar.classList.remove('open');
                mobileOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    });

    // --- UI ANIMATIONS ---
    const cards = document.querySelectorAll('.admin-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-4px) scale(1.02)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
    });

    const statsNumbers = document.querySelectorAll('.admin-card .text-3xl');
    statsNumbers.forEach((stat, index) => {
        setTimeout(() => {
            stat.style.opacity = '0';
            stat.style.transform = 'translateY(20px)';
            stat.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            requestAnimationFrame(() => {
                stat.style.opacity = '1';
                stat.style.transform = 'translateY(0)';
            });
        }, index * 150);
    });

    // --- INITIALIZE EVERYTHING ---
    initializeTheme();
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
});

// --- CHART MANAGEMENT ---
let salesChartInstance = null;
let categoryChartInstance = null;
let revenueChartInstance = null;

function getChartOptions(isDark) {
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#f3f4f6' : '#374151';
    return {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
            x: { grid: { display: false }, ticks: { color: textColor } }
        }
    };
}

function getDoughnutChartOptions(isDark) {
    const textColor = isDark ? '#f3f4f6' : '#374151';
    return {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 20, usePointStyle: true, color: textColor }
            }
        }
    };
}

function initializeCharts() {
    const isDark = document.documentElement.classList.contains('dark');
    
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        salesChartInstance = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Sales',
                    data: [1200, 1900, 3000, 2500, 2200, 3000, 4500],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: getChartOptions(isDark)
        });
    }

    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Bio', 'Limited', 'Kids'],
                datasets: [{
                    data: [35, 25, 25, 15],
                    backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(13, 148, 136, 0.8)', 'rgba(249, 115, 22, 0.8)'],
                    borderWidth: 0
                }]
            },
            options: getDoughnutChartOptions(isDark)
        });
    }

    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChartInstance = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [5000, 7500, 6000, 9000, 11000, 10000],
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: getChartOptions(isDark)
        });
    }
}

function updateChartsTheme(isDark) {
    if (salesChartInstance) {
        salesChartInstance.options = getChartOptions(isDark);
        salesChartInstance.update();
    }
    if (categoryChartInstance) {
        categoryChartInstance.options = getDoughnutChartOptions(isDark);
        categoryChartInstance.update();
    }
    if (revenueChartInstance) {
        revenueChartInstance.options = getChartOptions(isDark);
        revenueChartInstance.update();
    }
}
