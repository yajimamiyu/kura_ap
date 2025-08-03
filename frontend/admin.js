document.addEventListener('DOMContentLoaded', () => {
    // 簡単なログインチェック
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'admin') {
        window.location.href = 'login_admin.html';
        return;
    }

    const viewAllReservationsButton = document.getElementById('view-all-reservations');
    const upcomingReservationsList = document.getElementById('upcoming-reservations-list');

    // 今後の予約リストを取得して表示する関数 (admin用)
    const renderUpcomingReservations = async () => {
        try {
            const response = await fetch(`http://localhost:5001/reservations/all`);
            const reservations = await response.json();

            upcomingReservationsList.innerHTML = '';
            const today = new Date();
            const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD 形式

            const filteredReservations = reservations.filter(reservation => {
                const reservationDateString = new Date(reservation.reservation_date).toISOString().split('T')[0];
                return reservationDateString === todayString;
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

                // 出欠状況を取得して表示
                const attendanceStatusTd = document.createElement('td');
                const attendanceResponse = await fetch(`http://localhost:5001/attendance?student_id=${reservation.student_id}&date=${reservation.reservation_date}`);
                const existingAttendance = await attendanceResponse.json();

                if (existingAttendance && existingAttendance.status) {
                    attendanceStatusTd.textContent = existingAttendance.status === 'present' ? '出席' : '欠席';
                } else {
                    attendanceStatusTd.textContent = '未記録';
                }
                tr.appendChild(attendanceStatusTd);

                upcomingReservationsList.appendChild(tr);
            }
        }
        catch (error) {
            console.error('Error fetching upcoming reservations:', error);
        }
    };

    viewAllReservationsButton.addEventListener('click', () => {
        window.location.href = 'all_reservations.html';
    });

    // 初期表示
    renderUpcomingReservations();
});
