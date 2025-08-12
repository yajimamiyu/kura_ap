document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-attendance');
    const gasUrl = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec';

    saveBtn.addEventListener('click', () => {
        const table = document.getElementById('attendance-table');
        const rows = table.querySelectorAll('tbody tr');

        const dataToExport = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const studentName = cells[0].textContent.trim();
            const grade = cells[1].textContent.trim();
            const date = cells[2].textContent.trim();
            const subject = cells[3].textContent.trim();
            const time = cells[4].textContent.trim();
            const statusSelect = cells[5].querySelector('select');
            const status = statusSelect ? statusSelect.value : '';

            dataToExport.push({
                action: 'add_syuseki',
                studentName,
                grade,
                date,
                subject,
                time,
                status
            });
        });

        fetch(gasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(dataToExport)
        })
        .then(() => {
            alert('出席データをスプレッドシートに追加しました。');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('出席データ追加中にエラーが発生しました。');
        });
    });
});

