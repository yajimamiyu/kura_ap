document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');

    loginButton.addEventListener('click', () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role: 'teacher' }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Login successful') {
                sessionStorage.setItem('loggedIn', 'teacher');
                sessionStorage.setItem('user_id', data.user_id);
                window.location.href = 'index.html';
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
