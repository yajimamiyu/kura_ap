document.addEventListener('DOMContentLoaded', () => {
    const attendanceListContainer = document.getElementById('attendance-list-container');

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}月${day}日`;
        } catch (e) {
            return dateString; // In case of invalid date format
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            const date = new Date(timeString);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (e) {
            return timeString; // In case of invalid time format
        }
    };

    const fetchAttendanceList = async () => {
        try {
            const response = await fetch('/api/get_attendance_data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            
            // The actual data is nested in the 'data' property from GAS
            const data = result.data || [];

            if (result.result === 'success' && data.length > 1) { // More than just a header row
                const table = document.createElement('table');
                const header = data[0];
                const rows = data.slice(1);

                let tableHTML = '<thead><tr>';
                header.forEach(cell => {
                    tableHTML += `<th>${cell}</th>`;
                });
                tableHTML += '</tr></thead><tbody>';

                rows.forEach(rowData => {
                    tableHTML += '<tr>';
                    // Assuming the column order is: Name, Grade, Date, Subject, Time, Status
                    tableHTML += `<td>${rowData[0] || ''}</td>`; // 名前
                    tableHTML += `<td>${rowData[1] || ''}</td>`; // 学年
                    tableHTML += `<td>${formatDate(rowData[2])}</td>`; // 日付
                    tableHTML += `<td>${rowData[3] || ''}</td>`; // 教科
                    tableHTML += `<td>${formatTime(rowData[4])}</td>`; // 時間
                    tableHTML += `<td>${rowData[5] || ''}</td>`; // 出席状況
                    tableHTML += '</tr>';
                });

                tableHTML += '</tbody>';
                table.innerHTML = tableHTML;
                attendanceListContainer.innerHTML = '';
                attendanceListContainer.appendChild(table);
            } else if (data.length <= 1) {
                attendanceListContainer.innerHTML = '<p>出席データがありません。</p>';
            } else {
                throw new Error(result.message || 'データの読み込みに失敗しました。');
            }
        } catch (error) {
            console.error('Error fetching attendance list:', error);
            attendanceListContainer.innerHTML = `<p>データの取得中にエラーが発生しました: ${error.message}</p>`;
        }
    };

    fetchAttendanceList();
});
