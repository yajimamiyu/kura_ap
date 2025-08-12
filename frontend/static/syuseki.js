document.addEventListener('DOMContentLoaded', () => {
    const syusekiListContainer = document.getElementById('syuseki-list-container');
    const reservationFilter = document.getElementById('reservation-filter');
    const attendanceFilter = document.getElementById('attendance-filter');
    let allReservationsData = []; // Store all fetched data for filtering

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

            for (let i = 1; i < dataToRender.length; i++) {
                const rowData = dataToRender[i];
                const tr = document.createElement('tr');
                // Find the original index from the full dataset
                const originalIndex = allReservationsData.findIndex(originalRow => JSON.stringify(originalRow) === JSON.stringify(rowData));
                tr.dataset.originalIndex = originalIndex;

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

            const data = allReservationsData;

            if (data && data.length > 1) {
                reservationFilter.innerHTML = '<option value="all">すべて表示</option>';
                for (let i = 1; i < data.length; i++) {
                    const rowData = data[i];
                    const combinedText = `${rowData[0] || ''} - ${rowData[1] || ''} - ${formatDate(rowData[2])} - ${rowData[3] || ''} - ${formatTime(rowData[4])}`;
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = combinedText;
                    reservationFilter.appendChild(option);
                }
            }

            applyFilters();
            
        } catch (error) {
            console.error('Error fetching syuseki list:', error);
            syusekiListContainer.innerHTML = `<p>予約データの取得中にエラーが発生しました: ${error.message}</p>`;
        }
    };

    const updateAttendance = async (rowIndex, status) => {
  let rowData = [...allReservationsData[rowIndex]];

  if (rowData.length < 6) {
    rowData[5] = status;
  } else {
    rowData[5] = status;
  }

  console.log("送信データ:", { action: 'update_attendance', rowIndex, status, rowData });

  try {
    const response = await fetch('/api/update_attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_attendance',
        rowIndex: rowIndex,
        status: status,
        rowData: rowData
      })
    });
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    const result = await response.json();
    if (result.result === 'success') {
      alert('更新成功: ' + result.message);
    } else {
      throw new Error(result.message || '更新失敗');
    }
  } catch (error) {
    console.error('Error updating attendance:', error);
    alert('出席状況の更新に失敗しました: ' + error.message);
  }
};


    const applyFilters = () => {
        const selectedReservationIndex = reservationFilter.value;
        let filteredData = [allReservationsData[0]];

        if (selectedReservationIndex === 'all') {
            filteredData = allReservationsData;
        } else {
            filteredData.push(allReservationsData[selectedReservationIndex]);
        }
        renderTable(filteredData);
    };

    reservationFilter.addEventListener('change', applyFilters);

    const saveFilterButton = document.getElementById('save-filter-button');
    if (saveFilterButton) {
        saveFilterButton.addEventListener('click', async () => {
            const selectedReservationIndex = reservationFilter.value;
            const selectedAttendanceStatus = attendanceFilter.value;

            const currentTableRows = Array.from(syusekiListContainer.querySelectorAll('tbody tr'));
            const dataToSave = [allReservationsData[0]];
            currentTableRows.forEach(row => {
                const originalIndex = parseInt(row.dataset.originalIndex);
                if (!isNaN(originalIndex)) {
                    dataToSave.push(allReservationsData[originalIndex]);
                }
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

    fetchSyusekiList();
});
