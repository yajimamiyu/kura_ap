document.addEventListener('DOMContentLoaded', () => {
    const yoyakuDataListBody = document.getElementById('yoyaku-data-list');
    const saveButton = document.getElementById('save-attendance');

    const renderYoyakuData = () => {
        fetch('/get_yoyaku_data')
            .then(response => response.json())
            .then(data => {
                yoyakuDataListBody.innerHTML = ''; // Clear existing data

                if (data.result === 'success') {
                    data.yoyaku_data.forEach(record => {
                        const tr = document.createElement('tr');
                        // Store original data for saving
                        tr.dataset.name = record.name;
                        tr.dataset.grade = record.grade;
                        tr.dataset.date = record.date;
                        tr.dataset.subject = record.subject;
                        tr.dataset.time = record.time;

                        const nameTd = document.createElement('td');
                        nameTd.textContent = record.name;
                        tr.appendChild(nameTd);

                        const gradeTd = document.createElement('td');
                        gradeTd.textContent = record.grade;
                        tr.appendChild(gradeTd);

                        const dateTd = document.createElement('td');
                        dateTd.textContent = record.date;
                        tr.appendChild(dateTd);

                        const subjectTd = document.createElement('td');
                        subjectTd.textContent = record.subject;
                        tr.appendChild(subjectTd);

                        const timeTd = document.createElement('td');
                        timeTd.textContent = record.time;
                        tr.appendChild(timeTd);

                        const statusTd = document.createElement('td');
                        const select = document.createElement('select');
                        select.innerHTML = `
                            <option value="">選択してください</option>
                            <option value="出席">出席</option>
                            <option value="欠席">欠席</option>
                        `;
                        statusTd.appendChild(select);
                        tr.appendChild(statusTd);

                        yoyakuDataListBody.appendChild(tr);
                    });
                } else {
                    console.error('Error fetching yoyaku data:', data.message);
                }
            })
            .catch(error => console.error('Error fetching yoyaku data:', error));
    };

    saveButton.addEventListener('click', () => {
        const attendanceRecords = [];
        const rows = yoyakuDataListBody.querySelectorAll('tr');

        rows.forEach(row => {
            const status = row.querySelector('select').value;

            if (status) { // Only include rows where a status is selected
                attendanceRecords.push({
                    studentName: row.dataset.name,
                    grade: row.dataset.grade,
                    date: row.dataset.date,
                    subject: row.dataset.subject,
                    time: row.dataset.time,
                    status: status
                });
            }
        });

        if (attendanceRecords.length > 0) {
            fetch('/add_attendance_from_yoyaku', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({ 
                    action: 'add_attendance_from_yoyaku', 
                    attendance: attendanceRecords
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    alert('出欠データを保存しました。');
                    renderYoyakuData(); // Refresh the data
                } else {
                    alert('保存に失敗しました: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error saving attendance data:', error);
                alert('保存中にエラーが発生しました。');
            });
        }
    });

    renderYoyakuData();
});