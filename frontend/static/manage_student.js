document.addEventListener('DOMContentLoaded', () => {
    // 簡単なログインチェック
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'hogosha') {
        window.location.href = '/login_hogosha';
        return;
    }

    const lastNameInput = document.getElementById('last-name');
    const firstNameInput = document.getElementById('first-name');
    const schoolInput = document.getElementById('school');
    const gradeInput = document.getElementById('grade');
    const saveStudentButton = document.getElementById('save-student');

    // 生徒を追加する関数（スプレッドシートにのみ保存）
    const saveStudent = () => {
        const lastName = lastNameInput.value.trim();
        const firstName = firstNameInput.value.trim();
        const school = schoolInput.value.trim();
        const grade = gradeInput.value.trim();

        if (!lastName || !firstName) {
            alert('苗字と名前は必須です。');
            return;
        }

        const studentData = { last_name: lastName, first_name: firstName, school: school, grade: grade };

        // Google Apps ScriptのウェブアプリURL
        const gasUrl = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec'; // あなたのGASウェブアプリURL

        // GASに生徒データを送信
        fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
        })
        .then(() => {
            alert('生徒情報をスプレッドシートに保存しました。');
            window.location.href = '/hogosha'; // 一覧ページに戻る
        })
        .catch(error => {
            console.error('Error saving student to GAS:', error);
            alert('生徒情報の保存中にエラーが発生しました。');
        });
    };

    saveStudentButton.addEventListener('click', saveStudent);
});

    saveStudentButton.addEventListener('click', saveStudent);
});
