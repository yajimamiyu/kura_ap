document.addEventListener('DOMContentLoaded', () => {
    // 簡単なログインチェック
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'hogosha') {
        window.location.href = '/login_hogosha';
        return;
    }

    const addNewStudentButton = document.getElementById('add-new-student');
    const editExistingStudentButton = document.getElementById('edit-existing-student');
    const goToReservationButton = document.getElementById('go-to-reservation');
    const studentListBody = document.getElementById('student-list'); // tbodyのID

    const currentMonthYearHeader = document.getElementById('current-month-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const calendarBody = document.getElementById('calendar-body');

    let currentCalendarDate = new Date(); // カレンダーの表示月を管理

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
                studentListBody.innerHTML = '';
                students.forEach(student => {
                    const tr = document.createElement('tr');

                    const lastNameTd = document.createElement('td');
                    lastNameTd.textContent = student.last_name;
                    tr.appendChild(lastNameTd);

                    const firstNameTd = document.createElement('td');
                    firstNameTd.textContent = student.first_name;
                    tr.appendChild(firstNameTd);

                    const schoolTd = document.createElement('td');
                    schoolTd.textContent = student.school || '';
                    tr.appendChild(schoolTd);

                    const gradeTd = document.createElement('td');
                    gradeTd.textContent = student.grade || '';
                    tr.appendChild(gradeTd);

                    studentListBody.appendChild(tr);
                });
            });
    };

    // カレンダーに予約を表示する関数（修正版）
    const renderCalendarReservations = async (date) => {
        currentMonthYearHeader.textContent = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
        calendarBody.innerHTML = '';

        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const startDay = firstDayOfMonth.getDay(); // 0:日, 1:月, ...

        const userId = sessionStorage.getItem('user_id');
        if (!userId) {
            console.error('User ID not found in session storage.');
            return;
        }
        // 明示的にGETメソッドを指定
        const response = await fetch(`${API_BASE_URL}/reservations/by_user?user_id=${userId}`, {
            method: 'GET',
        });
        const allReservations = await response.json();

        let day = 1;
        for (let i = 0; i < 6; i++) { // 最大6週
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) { // 7日間
                const cell = document.createElement('td');
                if (i === 0 && j < startDay) {
                    // 前月の日付
                    cell.classList.add('other-month');
                } else if (day > lastDayOfMonth.getDate()) {
                    // 次月の日付
                    cell.classList.add('other-month');
                } else {
                    // 今月の日付
                    const currentDay = new Date(date.getFullYear(), date.getMonth(), day);

                    // JSTでcurrentDayの日付文字列を作成
                    const y = currentDay.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric' });
                    const m = currentDay.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: '2-digit' });
                    const d = currentDay.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', day: '2-digit' });
                    const currentDayString = `${y}-${m}-${d}`;

                    const dailyReservations = allReservations.filter(res => {
                        const resDate = new Date(res.reservation_date);
                        const resY = resDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric' });
                        const resM = resDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: '2-digit' });
                        const resD = resDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', day: '2-digit' });
                        const resDateString = `${resY}-${resM}-${resD}`;
                        return resDateString === currentDayString;
                    });

                    // 日付を表示
                    cell.textContent = day;

                    if (dailyReservations.length > 0) {
                        const ul = document.createElement('ul');
                        ul.style.fontSize = '0.8em';
                        ul.style.marginTop = '5px';
                        dailyReservations.forEach(res => {
                            const li = document.createElement('li');
                            li.textContent = `${res.reservation_time} ${res.last_name} ${res.first_name} (${res.subject})`;
                            ul.appendChild(li);
                        });
                        cell.appendChild(ul);
                    }
                    day++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
            if (day > lastDayOfMonth.getDate()) break;
        }
    };

    // 生徒を削除する関数（未使用だが残す）
    const deleteStudent = (studentId) => {
        fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'DELETE',
        })
        .then(() => {
            renderStudents();
        })
        .catch(error => console.error('Error deleting student:', error));
    };

    addNewStudentButton.addEventListener('click', () => {
        window.location.href = '/manage_student';
    });

    editExistingStudentButton.addEventListener('click', () => {
        window.location.href = '/select_student_to_edit';
    });

    goToReservationButton.addEventListener('click', () => {
        window.location.href = '/reservation';
    });

    prevMonthButton.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendarReservations(currentCalendarDate);
    });

    nextMonthButton.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendarReservations(currentCalendarDate);
    });

    // 初期表示
    renderStudents();
    renderCalendarReservations(currentCalendarDate);
});