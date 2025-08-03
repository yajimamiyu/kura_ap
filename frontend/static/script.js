document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservation-form');
    const tableBody = document.getElementById('upcoming-reservations-list');
    const subjectFilter = document.getElementById('subject-filter');

    const reservations = []; // 配列で予約を管理

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('student-name').value;
        const date = document.getElementById('date').value;
        const subject = document.getElementById('subject').value;
        const time = document.getElementById('time').value;

        const newReservation = { name, date, subject, time };
        reservations.push(newReservation);
        renderReservations();
        form.reset(); // フォームをクリア
    });

    subjectFilter.addEventListener('change', () => {
        renderReservations();
    });

    function renderReservations() {
        tableBody.innerHTML = '';
        const selectedSubject = subjectFilter.value;

        reservations
            .filter(r => selectedSubject === 'all' || r.subject === selectedSubject)
            .forEach(reservation => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${reservation.name}</td>
                    <td>${reservation.date}</td>
                    <td>${reservation.subject}</td>
                    <td>${reservation.time}</td>
                    <td><input type="checkbox"></td>
                `;

                tableBody.appendChild(tr);
            });
    }
});
