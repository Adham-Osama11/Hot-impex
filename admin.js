// Admin Dashboard JavaScript

// Dark Mode Functionality for Admin Dashboard
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        html.classList.add('dark');
        updateDarkModeToggle(true);
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDarkMode = html.classList.toggle('dark');
    
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeToggle(isDarkMode);
    
    // Trigger animation
    html.style.transition = 'background 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        html.style.transition = '';
    }, 300);
}

function updateDarkModeToggle(isDarkMode) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        const sunIcon = toggle.querySelector('.sun-icon');
        const moonIcon = toggle.querySelector('.moon-icon');
        
        if (isDarkMode) {
            sunIcon.style.opacity = '0';
            moonIcon.style.opacity = '1';
        } else {
            sunIcon.style.opacity = '1';
            moonIcon.style.opacity = '0';
        }
    }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
});

// Admin Dashboard specific functionality can be added here
// For now, just the theme toggle is implemented
