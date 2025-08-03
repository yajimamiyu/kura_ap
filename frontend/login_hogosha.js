document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');

    loginButton.addEventListener('click', () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        fetch('http://localhost:5001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role: 'hogosha' }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Login successful') {
                sessionStorage.setItem('loggedIn', 'hogosha');
                sessionStorage.setItem('user_id', data.user_id);
                window.location.href = 'hogosha.html';
            } else {
                alert('ユーザーネームまたはパスワードが違います');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('ログイン中にエラーが発生しました。');
        });
    });
});