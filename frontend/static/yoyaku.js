document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('yoyaku-form');
    const gasUrl = 'https://script.google.com/macros/s/AKfycbxzDy3Rh_NHfCN7PkbfhH6pc4ne_h1iWospJQD8aB8qZuuwJKUCVhVJuysv2z4YgXXTag/exec';

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const studentName = document.getElementById('student-name').value;
        const grade = document.getElementById('grade').value;
        const date = document.getElementById('date').value;
        const subject = document.getElementById('subject').value;
        const time = document.getElementById('time-select').value;

        const dataToExport = [{
            action: 'add_yoyaku',
            studentName: studentName,
            grade: grade,
            date: date,
            subject: subject,
            time: time
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
             form.reset(); // フォームをクリア
        })
        .catch(error => {
            console.error('Error:', error);
            alert('エクスポート中にエラーが発生しました。');
        });
    });
});