document.addEventListener('DOMContentLoaded', () => {
    // 簡単なログインチェック
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'user') {
        window.location.href = 'login_index.html';
        return;
    }

    const upcomingReservationsList = document.getElementById('upcoming-reservations-list');
    const subjectFilter = document.getElementById('subject-filter');

    // 今後の予約リストを取得して表示する関数
    const renderUpcomingReservations = async () => {
        try {
            const response = await fetch(`http://localhost:5001/reservations/all`);
            const reservations = await response.json();

            upcomingReservationsList.innerHTML = '';
            const today = new Date();
            const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD 形式

            const selectedSubject = subjectFilter.value;

            const filteredReservations = reservations.filter(reservation => {
                const reservationDateString = new Date(reservation.reservation_date).toISOString().split('T')[0];
                const isToday = reservationDateString === todayString;
                const isSubjectMatch = selectedSubject === 'all' || reservation.subject === selectedSubject;
                return isToday && isSubjectMatch;
            });

            // 時間でソート
            filteredReservations.sort((a, b) => {
                const timeA = new Date(`1970/01/01 ${a.reservation_time}`);
                const timeB = new Date(`1970/01/01 ${b.reservation_time}`);
                return timeA - timeB;
            });

            for (const reservation of filteredReservations) {
                const tr = document.createElement('tr');

                const studentNameTd = document.createElement('td');
                studentNameTd.textContent = `${reservation.last_name} ${reservation.first_name}`;
                tr.appendChild(studentNameTd);

                const dateTd = document.createElement('td');
                const date = new Date(reservation.reservation_date);
                dateTd.textContent = `${date.getMonth() + 1}月${date.getDate()}日`;
                tr.appendChild(dateTd);

                const subjectTd = document.createElement('td');
                subjectTd.textContent = reservation.subject;
                tr.appendChild(subjectTd);

                const timeTd = document.createElement('td');
                timeTd.textContent = reservation.reservation_time;
                tr.appendChild(timeTd);

                // 出欠ボタンの追加
                const attendanceStatusTd = document.createElement('td');
                const presentButton = document.createElement('button');
                presentButton.textContent = '◯';
                presentButton.classList.add('status-button');
                presentButton.dataset.studentId = reservation.student_id;
                presentButton.dataset.recordDate = reservation.reservation_date;
                presentButton.dataset.status = 'present';

                const absentButton = document.createElement('button');
                absentButton.textContent = '✕';
                absentButton.classList.add('status-button');
                absentButton.dataset.studentId = reservation.student_id;
                absentButton.dataset.recordDate = reservation.reservation_date;
                absentButton.dataset.status = 'absent';

                // 既存の出欠状況を取得してボタンをハイライト
                const attendanceResponse = await fetch(`http://localhost:5001/attendance?student_id=${reservation.student_id}&date=${reservation.reservation_date}`);
                const existingAttendance = await attendanceResponse.json();

                if (existingAttendance && existingAttendance.status) {
                    if (existingAttendance.status === 'present') {
                        presentButton.classList.add('present');
                    } else if (existingAttendance.status === 'absent') {
                        absentButton.classList.add('absent');
                    }
                }

                presentButton.addEventListener('click', markAttendance);
                absentButton.addEventListener('click', markAttendance);

                attendanceStatusTd.appendChild(presentButton);
                attendanceStatusTd.appendChild(absentButton);
                tr.appendChild(attendanceStatusTd);

                upcomingReservationsList.appendChild(tr);
            }
        }
        catch (error) {
            console.error('Error fetching upcoming reservations:', error);
        }
    };

    // 出欠をマークする関数
    const markAttendance = async (event) => {
        const button = event.target;
        const studentId = button.dataset.studentId;
        const recordDate = button.dataset.recordDate;
        const status = button.dataset.status;

        try {
            const response = await fetch('http://localhost:5001/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student_id: studentId, record_date: recordDate, status: status }),
            });
            const data = await response.json();
            alert(data.message);
            renderUpcomingReservations(); // 状態を更新
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert('出欠の記録中にエラーが発生しました。');
        }
    };

    subjectFilter.addEventListener('change', renderUpcomingReservations);

    // 初期表示
    renderUpcomingReservations();
});