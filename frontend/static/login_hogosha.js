document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');

    loginButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert('ユーザーネームとパスワードを入力してください');
            return;
        }

        // app.pyの新しいエンドポイントにPOSTリクエストを送信
        fetch(`${API_BASE_URL}/login_hogosha_gas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                alert('ログインに成功しました。');
                window.location.href = 'hogosha.html';
            } else {
                alert(data.message || 'ログインに失敗しました。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('ログイン中にエラーが発生しました。');
        });
    });
});
