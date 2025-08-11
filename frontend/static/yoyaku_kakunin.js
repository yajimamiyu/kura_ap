document.addEventListener('DOMContentLoaded', () => {
    const yoyakuDataListBody = document.getElementById('yoyaku-data-list');

    const renderYoyakuData = () => {
        fetch('/get_yoyaku_data')
            .then(response => response.json())
            .then(data => {
                yoyakuDataListBody.innerHTML = ''; // Clear existing data

                if (data.result === 'success') {
                    data.yoyaku_data.forEach(record => {
                        const tr = document.createElement('tr');

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

                        yoyakuDataListBody.appendChild(tr);
                    });
                } else {
                    console.error('Error fetching yoyaku data:', data.message);
                }
            })
            .catch(error => console.error('Error fetching yoyaku data:', error));
    };

    renderYoyakuData();
});