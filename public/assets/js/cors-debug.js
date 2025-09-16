// CORS Debug Helper - Add this temporarily to test CORS issues
function testCORS() {
    console.log('Testing CORS with Railway backend...');
    
    fetch('https://hot-impex-production.up.railway.app/api/health', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'omit'
    })
    .then(response => {
        console.log('CORS test response status:', response.status);
        if (response.ok) {
            return response.json();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    })
    .then(data => {
        console.log('✅ CORS test successful:', data);
    })
    .catch(error => {
        console.error('❌ CORS test failed:', error);
        console.log('This indicates a CORS configuration issue in Railway');
    });
}

// Auto-run on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Running CORS debug test...');
    testCORS();
});