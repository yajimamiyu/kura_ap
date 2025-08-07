document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const signupButton = document.getElementById('signup-button');
    
    // index.htmlで使ったものと同じGASのURL
    const gasUrl = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec';

    signupButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = 'hogosha';

        if (!username || !password) {
            alert('ユーザーネームとパスワードを入力してください');
            return;
        }

        // 元々のバックエンドへの登録処理
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
                // ▼▼▼ 追加 ▼▼▼
                // 登録成功時にスプレッドシートにもデータを送信
                fetch(gasUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                }).catch(err => console.error('GAS Error:', err)); // エラーはコンソールに出力するだけ
                // ▲▲▲ 追加ここまで ▲▲▲

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
