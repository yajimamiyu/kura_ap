document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const signupButton = document.getElementById('signup-button');

    signupButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = 'hogosha'; // 保護者用は役割を固定

        if (!username || !password) {
            alert('ユーザーネームとパスワードを入力してください');
            return;
        }

        fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User created successfully') {
                alert('登録が完了しました。ログインページに移動します。');
                window.location.href = 'login_hogosha.html';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('登録中にエラーが発生しました。');
        });
    });
});
