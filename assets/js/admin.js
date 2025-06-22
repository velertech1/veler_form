// assets/js/admin.js
export function initializeDashboardCharts() {
    // El contenido de esta función con los datos y la creación de las gráficas se mantiene igual.
    const solicitudesData = { labels: ['Persona', 'Empresa', 'Grupo'], datasets: [{ label: 'Número de Solicitudes', data: [120, 45, 17], backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(75, 192, 192, 0.7)'], borderColor: ['#36a2eb', '#ff6384', '#4bc0c0'], borderWidth: 1 }] };
    const generoData = { labels: ['Femenino', 'Masculino'], datasets: [{ data: [78, 104], backgroundColor: ['#ff9f40', '#9966ff'], hoverOffset: 4 }] };
    const nuevosClientesData = { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], datasets: [{ label: 'Nuevos Clientes', data: [15, 22, 18, 25, 32, 28], fill: true, borderColor: '#4bc0c0', backgroundColor: 'rgba(75, 192, 192, 0.1)', tension: 0.3 }] };
    const ctxBar = document.getElementById('solicitudesPorTipoChart');
    if (ctxBar) new Chart(ctxBar, { type: 'bar', data: solicitudesData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
    const ctxDoughnut = document.getElementById('distribucionGeneroChart');
    if (ctxDoughnut) new Chart(ctxDoughnut, { type: 'doughnut', data: generoData, options: { responsive: true, maintainAspectRatio: false } });
    const ctxLine = document.getElementById('nuevosClientesChart');
    if (ctxLine) new Chart(ctxLine, { type: 'line', data: nuevosClientesData, options: { responsive: true, maintainAspectRatio: false } });
}