document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservation-form');
    const tableBody = document.getElementById('upcoming-reservations-list');
    const subjectFilter = document.getElementById('subject-filter');
    const gasUrl = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec';

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

        const dataToExport = [{
            studentName: newReservation.name,
            date: newReservation.date,
            subject: newReservation.subject,
            time: newReservation.time
        }];

        fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors', // CORSエラーを回避するために必要
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToExport)
        })
        .then(() => {
             alert('予約を追加し、スプレッドシートにエクスポートしました。');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('エクスポート中にエラーが発生しました。');
        });
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
