document.addEventListener('DOMContentLoaded', () => {
    const syusekiListContainer = document.getElementById('syuseki-list-container');

    const fetchSyusekiList = async () => { // Renamed function
        try {
            const response = await fetch('/api/get_all_yoyaku'); // Still fetching all yoyaku data
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.length > 0) {
                // ヘッダー行をスキップしてデータを表示
                const table = document.createElement('table');
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>名前</th>
                            <th>学年</th>
                            <th>日付</th>
                            <th>教科</th>
                            <th>時間</th>
                            <th>出席</th>
                            <th>操作</th> <!-- New column header for save button -->
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;
                const tbody = table.querySelector('tbody');

                // 最初の行はヘッダーと仮定してスキップ
                for (let i = 1; i < data.length; i++) {
                    const rowData = data[i];
                    const tr = document.createElement('tr');
                    tr.dataset.rowIndex = i; // Store original row index for updates

                    // 日付のフォーマット関数
                    const formatDate = (dateString) => {
                        if (!dateString) return '';
                        try {
                            const date = new Date(dateString);
                            // 月は0から始まるため+1
                            const month = date.getMonth() + 1;
                            const day = date.getDate();
                            return `${month}月${day}日`;
                        } catch (e) {
                            console.error("Error parsing date:", dateString, e);
                            return dateString; // パース失敗時は元の文字列を返す
                        }
                    };

                    // 時間のフォーマット関数
                    const formatTime = (timeString) => {
                        if (!timeString) return '';
                        try {
                            const date = new Date(timeString);
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${hours}:${minutes}`;
                        } catch (e) {
                            console.error("Error parsing time:", timeString, e);
                            return timeString; // パース失敗時は元の文字列を返す
                        }
                    };

                    // データの列数に合わせて調整してください
                    // 例: [名前, 学年, 日付, 教科, 時間, 出席状況] の順でデータが返されると仮定
                    // rowData[5] が出席状況のデータと仮定
                    const attendanceStatus = rowData[5] || ''; // Assuming attendance status is in the 6th column (index 5)

                    tr.innerHTML = `
                        <td>${rowData[0] || ''}</td>
                        <td>${rowData[1] || ''}</td>
                        <td>${formatDate(rowData[2])}</td>
                        <td>${rowData[3] || ''}</td>
                        <td>${formatTime(rowData[4])}</td>
                        <td>
                            <select class="attendance-select">
                                <option value="">選択してください</option>
                                <option value="出席" ${attendanceStatus === '出席' ? 'selected' : ''}>出席</option>
                                <option value="欠席" ${attendanceStatus === '欠席' ? 'selected' : ''}>欠席</option>
                            </select>
                        </td>
                        <td>
                            <button class="save-attendance-button">保存</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                }
                syusekiListContainer.innerHTML = ''; // 読み込み中... をクリア
                syusekiListContainer.appendChild(table);

                // Add event listeners for save buttons
                document.querySelectorAll('.save-attendance-button').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const row = event.target.closest('tr');
                        const rowIndex = row.dataset.rowIndex;
                        const selectedStatus = row.querySelector('.attendance-select').value;
                        // Call a function to update attendance in the backend
                        await updateAttendance(rowIndex, selectedStatus);
                    });
                });

            } else {
                syusekiListContainer.innerHTML = '<p>予約データがありません。</p>';
            }
        } catch (error) {
            console.error('Error fetching syuseki list:', error);
            syusekiListContainer.innerHTML = '<p>予約データの取得中にエラーが発生しました。</p>';
        }
    };

    // Function to send attendance update to backend
    const updateAttendance = async (rowIndex, status) => {
        try {
            const response = await fetch('/api/update_attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rowIndex: rowIndex, status: status })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.result === 'success') {
                console.log('Attendance updated successfully:', result.message);
                // Optionally, provide user feedback
            } else {
                console.error('Failed to update attendance:', result.message);
                // Optionally, provide user feedback
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            // Optionally, provide user feedback
        }
    };

    fetchSyusekiList(); // Renamed function call
});