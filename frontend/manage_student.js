document.addEventListener('DOMContentLoaded', () => {
    // 簡単なログインチェック
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'hogosha') {
        window.location.href = 'login_hogosha.html';
        return;
    }

    const studentIdInput = document.getElementById('student-id');
    const lastNameInput = document.getElementById('last-name');
    const firstNameInput = document.getElementById('first-name');
    const schoolInput = document.getElementById('school');
    const gradeInput = document.getElementById('grade');
    const saveStudentButton = document.getElementById('save-student');

    // URLから生徒IDを取得（編集モードの場合）
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (studentId) {
        // 編集モード：生徒情報を読み込む
        fetch(`${API_BASE_URL}/students/${studentId}`)
            .then(response => response.json())
            .then(student => {
                studentIdInput.value = student.id;
                lastNameInput.value = student.last_name;
                firstNameInput.value = student.first_name;
                schoolInput.value = student.school;
                gradeInput.value = student.grade;
            })
            .catch(error => console.error('Error fetching student for edit:', error));
    }

    // 生徒を追加または更新する関数
    const saveStudent = () => {
        const currentStudentId = studentIdInput.value;
        const lastName = lastNameInput.value.trim();
        const firstName = firstNameInput.value.trim();
        const school = schoolInput.value.trim();
        const grade = gradeInput.value.trim();

        if (!lastName || !firstName) {
            alert('苗字と名前は必須です。');
            return;
        }

        const studentData = { last_name: lastName, first_name: firstName, school: school, grade: grade };

        if (currentStudentId) {
            // 更新
            fetch(`${API_BASE_URL}/students/${currentStudentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                window.location.href = 'hogosha.html'; // 一覧ページに戻る
            })
            .catch(error => console.error('Error updating student:', error));
        } else {
            // 新規追加
            const userId = sessionStorage.getItem('user_id');
            if (!userId) {
                alert('ユーザーIDが見つかりません。再度ログインしてください。');
                return;
            }
            const newStudentData = { ...studentData, user_id: userId };
            fetch(`${API_BASE_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newStudentData),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                window.location.href = 'hogosha.html'; // 一覧ページに戻る
            })
            .catch(error => console.error('Error adding student:', error));
        }
    };

    saveStudentButton.addEventListener('click', saveStudent);
});
