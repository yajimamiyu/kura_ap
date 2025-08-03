document.addEventListener('DOMContentLoaded', () => {
    // 簡単なログインチェック
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'hogosha') {
        window.location.href = 'login_hogosha.html';
        return;
    }

    const studentList = document.getElementById('student-list');

    // 生徒リストを取得して表示する関数
    const renderStudents = () => {
        const userId = sessionStorage.getItem('user_id');
        if (!userId) {
            console.error('User ID not found in session storage.');
            return;
        }
        fetch(`${API_BASE_URL}/students?user_id=${userId}`)
            .then(response => response.json())
            .then(students => {
                studentList.innerHTML = '';
                students.forEach(student => {
                    const li = document.createElement('li');
                    li.textContent = `${student.last_name} ${student.first_name} (${student.school || ''} ${student.grade || ''})`;

                    const editButton = document.createElement('button');
                    editButton.textContent = '編集';
                    editButton.addEventListener('click', () => {
                        window.location.href = `manage_student.html?id=${student.id}`;
                    });

                    li.appendChild(editButton);
                    studentList.appendChild(li);
                });
            });
    };

    // 初期表示
    renderStudents();
});
