document.addEventListener('DOMContentLoaded', () => {
    const syusekiListContainer = document.getElementById('syuseki-list-container');
    let allReservationsData = []; // Store all fetched data

    // 日付のフォーマット関数
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}月${day}日`;
        } catch (e) {
            console.error("Error parsing date:", dateString, e);
            return dateString;
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
            return timeString;
        }
    };

    const renderTable = (dataToRender) => {
        if (dataToRender && dataToRender.length > 1) { // Header + at least one row
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>名前</th>
                        <th>学年</th>
                        <th>日付</th>
                        <th>教科</th>
                        <th>時間</th>
                        <th>出席状況</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            const tbody = table.querySelector('tbody');

            // 最初の行はヘッダーと仮定してスキップ
            for (let i = 1; i < dataToRender.length; i++) {
                const rowData = dataToRender[i];
                const tr = document.createElement('tr');
                tr.dataset.originalIndex = i; // Use a clear name for the original index

                const currentStatus = rowData[5] || '未定';

                tr.innerHTML = `
                    <td>${rowData[0] || ''}</td>
                    <td>${rowData[1] || ''}</td>
                    <td>${formatDate(rowData[2])}</td>
                    <td>${rowData[3] || ''}</td>
                    <td>${formatTime(rowData[4])}</td>
                    <td>
                        <select class="attendance-select">
                            <option value="未定" ${currentStatus === '未定' ? 'selected' : ''}>未定</option>
                            <option value="出席" ${currentStatus === '出席' ? 'selected' : ''}>出席</option>
                            <option value="欠席" ${currentStatus === '欠席' ? 'selected' : ''}>欠席</option>
                            <option value="遅刻" ${currentStatus === '遅刻' ? 'selected' : ''}>遅刻</option>
                        </select>
                    </td>
                    <td><button class="save-attendance-button">保存</button></td>
                `;
                tbody.appendChild(tr);
            }
            syusekiListContainer.innerHTML = '';
            syusekiListContainer.appendChild(table);

            document.querySelectorAll('.save-attendance-button').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const row = event.target.closest('tr');
                    const originalIndex = row.dataset.originalIndex;
                    const selectedStatus = row.querySelector('.attendance-select').value;
                    await updateAttendance(originalIndex, selectedStatus);
                });
            });

        } else {
            syusekiListContainer.innerHTML = '<p>予約データがありません。</p>';
        }
    };

    const fetchSyusekiList = async () => {
        try {
            const response = await fetch('/api/get_all_yoyaku');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result && result.result === 'success' && Array.isArray(result.data)) {
                allReservationsData = result.data;
            } else {
                throw new Error(result.message || '取得したデータの形式が正しくありません。');
            }
            
            renderTable(allReservationsData); // Render the full table directly
            
        } catch (error) {
            console.error('Error fetching syuseki list:', error);
            syusekiListContainer.innerHTML = `<p>予約データの取得中にエラーが発生しました: ${error.message}</p>`;
        }
    };

    const updateAttendance = async (originalIndex, status) => {
        const rowData = allReservationsData[originalIndex];

        try {
            const response = await fetch('/api/update_attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'update_attendance', 
                    rowIndex: originalIndex, // Send original index for consistency
                    status: status,
                    rowData: rowData
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.result === 'success') {
                alert(result.message || '出席状況を更新しました！');
                fetchSyusekiList(); // Re-fetch to show the latest data
            } else {
                throw new Error(result.message || '出席状況の更新に失敗しました。');
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            alert(error.message);
        }
    };

    fetchSyusekiList();
});
