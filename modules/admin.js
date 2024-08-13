function filterActivities() {
    const filter = document.getElementById('userFilter').value;
    axios.post('/admin/filter', { prefix: filter })
        .then(response => {
            const activities = response.data;
            const tbody = document.getElementById('activityTableBody');
            tbody.innerHTML = '';
            activities.forEach(activity => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(activity.datetime).toLocaleString()}</td>
                    <td>${activity.username}</td>
                    <td>${activity.type}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error(error));
}