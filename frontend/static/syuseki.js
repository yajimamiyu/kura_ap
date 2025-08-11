document.addEventListener('DOMContentLoaded', () => {
    const syusekiListContainer = document.getElementById('syuseki-list-container');
    const reservationFilter = document.getElementById('reservation-filter');
    const attendanceFilter = document.getElementById('attendance-filter'); // New reference
    let allReservationsData = []; // Store all fetched data for filtering

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

    const renderTable = (dataToRender) => {
        if (dataToRender && dataToRender.length > 0) {
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
                tr.dataset.rowIndex = i; // Store original row index for updates

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
    };

    const fetchSyusekiList = async () => {
        try {
            const response = await fetch('/api/get_all_yoyaku');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result && result.result === 'success' && Array.isArray(result.data)) {
                allReservationsData = result.data; // Use the nested 'data' array
            } else {
                throw new Error(result.message || '取得したデータの形式が正しくありません。');
            }

            const data = allReservationsData; // For subsequent processing

            // Populate filter dropdown
            if (data && data.length > 1) { // data.length > 1 because first row is header
                // Clear existing options except "すべて表示"
                reservationFilter.innerHTML = '<option value="all">すべて表示</option>';
                
                // Assuming Name is rowData[0], Grade is rowData[1], Date is rowData[2], Subject is rowData[3], Time is rowData[4]
                // Combine: 名前 - 学年 - 日付 - 教科 - 時間
                for (let i = 1; i < data.length; i++) {
                    const rowData = data[i];
                    const combinedText = `${rowData[0] || ''} - ${rowData[1] || ''} - ${formatDate(rowData[2])} - ${rowData[3] || ''} - ${formatTime(rowData[4])}`;
                    const option = document.createElement('option');
                    option.value = i; // Use row index as value
                    option.textContent = combinedText;
                    reservationFilter.appendChild(option);
                }
            }

            applyFilters(); // Apply filters after fetching data
            
        } catch (error) {
            console.error('Error fetching syuseki list:', error);
            syusekiListContainer.innerHTML = `<p>予約データの取得中にエラーが発生しました: ${error.message}</p>`;
        }
    };

    // Function to send attendance update to backend
    const updateAttendance = async (rowIndex, status) => {
        const rowData = allReservationsData[rowIndex];

        try {
            const response = await fetch('/api/update_attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'update_attendance', 
                    rowIndex: rowIndex, 
                    status: status,
                    rowData: rowData // Add the full row data
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.result === 'success') {
                console.log('Attendance updated successfully:', result.message);
                // Optionally, provide user feedback
                alert(result.message || '出席状況を更新しました！');
                // Re-fetch and re-render to show updated status
                fetchSyusekiList(); 
            } else {
                console.error('Failed to update attendance:', result.message);
                alert('出席状況の更新に失敗しました: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            alert('出席状況の更新中にエラーが発生しました。');
        }
    };

    // Function to apply filters and render table
    const applyFilters = () => {
        const selectedReservationIndex = reservationFilter.value;

        let filteredData = [allReservationsData[0]]; // Always include header

        for (let i = 1; i < allReservationsData.length; i++) {
            const rowData = allReservationsData[i];
            const reservationMatch = (selectedReservationIndex === 'all' || parseInt(selectedReservationIndex) === i);

            if (reservationMatch) { // Only consider reservation filter
                filteredData.push(rowData);
            }
        }
        renderTable(filteredData);
    };

    // Filter table based on dropdown selection
    reservationFilter.addEventListener('change', applyFilters);
    // attendanceFilter.addEventListener('change', applyFilters); // Removed event listener

    fetchSyusekiList();

    const saveFilterButton = document.getElementById('save-filter-button');
    if (saveFilterButton) {
        saveFilterButton.addEventListener('click', async () => {
            const selectedReservationIndex = reservationFilter.value;
            const selectedAttendanceStatus = attendanceFilter.value;

            // Get currently displayed data (which is already filtered)
            const currentTableRows = Array.from(syusekiListContainer.querySelectorAll('tbody tr'));
            const dataToSave = [allReservationsData[0]]; // Include header
            currentTableRows.forEach(row => {
                const rowIndex = parseInt(row.dataset.rowIndex);
                dataToSave.push(allReservationsData[rowIndex]);
            });

            try {
                const response = await fetch('/api/save_filtered_data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'save_filtered_data',
                        reservationFilter: selectedReservationIndex,
                        attendanceFilter: selectedAttendanceStatus,
                        filteredData: dataToSave
                    })
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.result === 'success') {
                    alert('フィルターされたデータを新しいシートに保存しました！');
                } else {
                    alert('データの保存に失敗しました: ' + result.message);
                }
            } catch (error) {
                console.error('Error saving filtered data:', error);
                alert('フィルターされたデータの保存中にエラーが発生しました。' + error.message);
            }
        });
    }
});
