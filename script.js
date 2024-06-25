document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const department = document.getElementById('department').value;
    const email = document.getElementById('email').value;

    fetch('http://127.0.0.1:3000/api/verifyAccess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ department, email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.accessGranted) {
            // Redirect to the corresponding department page with email as query parameter
            window.location.href = `${department}.html?email=${encodeURIComponent(email)}`;
        } else {
            alert('Access denied');
        }
    })
    .catch(error => console.error('Error verifying access:', error));
});
