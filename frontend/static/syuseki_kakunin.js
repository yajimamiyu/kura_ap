document.addEventListener('DOMContentLoaded', () => {
    const attendanceDataListBody = document.getElementById('attendance-data-list');

    const renderAttendanceData = () => {
        fetch('/get_attendance')
            .then(response => response.json())
            .then(data => {
                attendanceDataListBody.innerHTML = ''; // Clear existing data

                if (data.result === 'success') {
                    data.attendance.forEach(record => {
                        const tr = document.createElement('tr');

                        const studentNameTd = document.createElement('td');
                        studentNameTd.textContent = record.studentName;
                        tr.appendChild(studentNameTd);

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
                        statusTd.textContent = record.status; // Assuming 'status' now contains '出欠'
                        tr.appendChild(statusTd);

                        attendanceDataListBody.appendChild(tr);
                    });
                } else {
                    console.error('Error fetching attendance data:', data.message);
                }
            })
            .catch(error => console.error('Error fetching attendance data:', error));
    };

    renderAttendanceData();
});