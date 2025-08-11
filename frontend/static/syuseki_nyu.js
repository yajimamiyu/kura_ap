document.addEventListener('DOMContentLoaded', () => {
    const attendanceListBody = document.getElementById('attendance-list');
    const saveButton = document.getElementById('save-attendance');

    const renderAttendance = () => {
        // The GET request no longer needs a username
        fetch('/get_attendance')
            .then(response => response.json())
            .then(data => {
                attendanceListBody.innerHTML = ''; // Clear existing data

                if (data.result === 'success') {
                    data.attendance.forEach(record => {
                        const tr = document.createElement('tr');
                        // Store data needed for saving in data-* attributes
                        tr.dataset.studentName = record.studentName;
                        tr.dataset.date = record.date;
                        const originalStatus = `${record.subject} ${record.time}`;
                        tr.dataset.originalStatus = originalStatus;

                        const studentNameTd = document.createElement('td');
                        studentNameTd.textContent = record.studentName;
                        tr.appendChild(studentNameTd);

                        const dateTd = document.createElement('td');
                        dateTd.textContent = record.date;
                        tr.appendChild(dateTd);

                        const oldStatusTd = document.createElement('td');
                        oldStatusTd.textContent = originalStatus;
                        tr.appendChild(oldStatusTd);

                        const newStatusTd = document.createElement('td');
                        const select = document.createElement('select');
                        select.innerHTML = `
                            <option value="">選択してください</option>
                            <option value="出席">出席</option>
                            <option value="欠席">欠席</option>
                            <option value="遅刻">遅刻</option>
                        `;
                        newStatusTd.appendChild(select);
                        tr.appendChild(newStatusTd);

                        attendanceListBody.appendChild(tr);
                    });
                } else {
                    console.error('Error fetching attendance data:', data.message);
                }
            })
            .catch(error => console.error('Error fetching attendance data:', error));
    };

    saveButton.addEventListener('click', () => {
        const updatedData = [];
        const rows = attendanceListBody.querySelectorAll('tr');

        rows.forEach(row => {
            const newStatus = row.querySelector('select').value;

            if (newStatus) { // Only include rows where a new status is selected
                updatedData.push({
                    studentName: row.dataset.studentName,
                    date: row.dataset.date,
                    original_status: row.dataset.originalStatus,
                    status: newStatus
                });
            }
        });

        if (updatedData.length > 0) {
            // The POST request no longer sends a username
            fetch('/update_attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({ 
                    action: 'update_attendance', 
                    attendance: updatedData
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    alert('出席データを保存しました。');
                    renderAttendance(); // Refresh the data
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

    renderAttendance();
});