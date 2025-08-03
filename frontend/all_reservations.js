document.addEventListener('DOMContentLoaded', () => {
    // 簡単なログインチェック
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn !== 'admin') {
        window.location.href = 'login_admin.html';
        return;
    }

    const allReservationsListBody = document.getElementById('all-reservations-list'); // tbodyのID
    const monthFilter = document.getElementById('month-filter');

    let allReservationsData = []; // 全ての予約データを保持する変数

    // 全ての予約リストを取得して表示する関数
    const fetchAndRenderAllReservations = async () => {
        try {
            const response = await fetch(`http://localhost:5001/reservations/all`);
            allReservationsData = await response.json(); // データを保存
            renderFilteredReservations(); // フィルタリングして表示
        } catch (error) {
            console.error('Error fetching all reservations:', error);
        }
    };

    // フィルタリングされた予約を表示する関数
    const renderFilteredReservations = () => {
        const selectedMonth = monthFilter.value;
        let filtered = allReservationsData;

        if (selectedMonth !== 'all') {
            filtered = allReservationsData.filter(reservation => {
                const date = new Date(reservation.reservation_date);
                return (date.getMonth() + 1).toString() === selectedMonth;
            });
        }

        allReservationsListBody.innerHTML = '';
        filtered.forEach(reservation => {
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

            const schoolTd = document.createElement('td');
            schoolTd.textContent = reservation.school || '';
            tr.appendChild(schoolTd);

            const gradeTd = document.createElement('td');
            gradeTd.textContent = reservation.grade || '';
            tr.appendChild(gradeTd);

            allReservationsListBody.appendChild(tr);
        });
    };

    // イベントリスナー
    monthFilter.addEventListener('change', renderFilteredReservations);

    // 初期表示
    fetchAndRenderAllReservations();
});