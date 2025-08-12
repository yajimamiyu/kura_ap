document.addEventListener('DOMContentLoaded', () => {
    const yoyakuListContainer = document.getElementById('yoyaku-list-container');

    const fetchYoyakuList = async () => {
        try {
            const response = await fetch('/api/get_all_yoyaku');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseJson = await response.json();
            const data = responseJson.data;

            if (data && Array.isArray(data) && data.length > 0) {
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
                    // 例: [名前, 学年, 日付, 教科, 時間] の順でデータが返されると仮定
                    tr.innerHTML = `
                        <td>${rowData[0] || ''}</td>
                        <td>${rowData[1] || ''}</td>
                        <td>${formatDate(rowData[2])}</td>
                        <td>${rowData[3] || ''}</td>
                        <td>${formatTime(rowData[4])}</td>
                    `;
                    tbody.appendChild(tr);
                }
                yoyakuListContainer.innerHTML = ''; // 読み込み中... をクリア
                yoyakuListContainer.appendChild(table);
            } else {
                yoyakuListContainer.innerHTML = '<p>予約データがありません。</p>';
            }
        } catch (error) {
            console.error('Error fetching yoyaku list:', error);
            yoyakuListContainer.innerHTML = '<p>予約データの取得中にエラーが発生しました。</p>';
        }
    };

    fetchYoyakuList();
});