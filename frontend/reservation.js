document.addEventListener('DOMContentLoaded', () => {
    // 簡単なログインチェック
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'hogosha') {
        window.location.href = 'login_hogosha.html';
        return;
    }

    const studentSelect = document.getElementById('student-select');
    const reservationDateInput = document.getElementById('reservation-date');
    const subjectSelect = document.getElementById('subject-select');
    const timeSelect = document.getElementById('time-select');
    const submitReservationButton = document.getElementById('submit-reservation');

    // 生徒リストを動的に取得してセレクトボックスに表示
    const fetchStudents = () => {
        const userId = sessionStorage.getItem('user_id');
        if (!userId) {
            console.error('User ID not found in session storage.');
            return;
        }
        fetch(`${API_BASE_URL}/students?user_id=${userId}`)
            .then(response => response.json())
            .then(students => {
                studentSelect.innerHTML = '<option value="">生徒を選択してください</option>';
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.last_name} ${student.first_name}`;
                    studentSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching students:', error));
    };

    // 予約を送信する関数
    const submitReservation = () => {
        const studentId = studentSelect.value;
        const reservationDate = reservationDateInput.value;
        const subject = subjectSelect.value;
        const reservationTime = timeSelect.value;

        if (!studentId || !reservationDate || !subject || !reservationTime) {
            alert('すべての項目を入力してください。');
            return;
        }

        const reservationData = {
            student_id: studentId,
            reservation_date: reservationDate,
            subject: subject,
            reservation_time: reservationTime
        };

        fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === 'Reservation created successfully') {
                // フォームをクリア
                studentSelect.value = '';
                reservationDateInput.value = '';
                subjectSelect.value = '';
                timeSelect.value = '';
            }
        })
        .catch(error => {
            console.error('Error submitting reservation:', error);
            alert('予約中にエラーが発生しました。');
        });
    };

    submitReservationButton.addEventListener('click', submitReservation);

    // 初期表示
    fetchStudents();
});