let statusChart = null;
let priorityChart = null;

export function getWeeklyTasks(tasks) {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    return tasks.filter(t => new Date(t.createdAt) >= weekAgo);
}

export function getCompletedTasks(tasks) {
    return tasks.filter(t => t.completed);
}

export function getCompletionRate(tasks) {
    if (!tasks.length) return 0;

    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
}

export function getFocusHours(tasks) {
    const totalMinutes = tasks.reduce((sum, t) => {
        return sum + (t.focusTimeMinutes || 0);
    }, 0);

    return (totalMinutes / 60).toFixed(1);
}

export function renderKPIs(tasks) {
    const completedEl = document.getElementById("kpi-completed");
    const rateEl = document.getElementById("kpi-rate");

    if (!completedEl || !rateEl) return;

    const completed = tasks.filter(task => task.completed).length;
    const rate = tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0;

    completedEl.innerText = completed;
    rateEl.innerText = rate + "%";
}

export function renderAnalytics(tasks) {
    renderStatusChart(tasks);
    renderPriorityChart(tasks);
    renderInsights(tasks);
    renderFocusWidget(tasks);
}

function renderStatusChart(tasks) {
    const statusChartEl = document.getElementById("statusChart");

    if (!statusChartEl) return;

    const completed = tasks.filter(t => t.completed).length;

    const pending = tasks.filter(t => !t.completed).length;

    const ctx = statusChartEl.getContext("2d");

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: ["Completed", "Pending"],

            datasets: [{

                data: [completed, pending],

                backgroundColor: ["#2ecc71", "#e74c3c"],

                hoverOffset: 6

            }]

        },

        options: {

            cutout: 80,

            responsive: true,

            maintainAspectRatio: false

        }

    });
}
function renderPriorityChart(tasks) {
    const high = tasks.filter(task => task.priority === "high").length;
    const medium = tasks.filter(task => task.priority === "medium").length;
    const low = tasks.filter(task => task.priority === "low").length;
    const canvas = document.getElementById("priorityChart");

    if (!canvas) return;

    if (priorityChart) {
        priorityChart.destroy();
    }

    priorityChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: ["High", "Medium", "Low"],

            datasets: [{

                label: "Tasks",

                data: [high, medium, low],

                backgroundColor: [
                    "#ef4444",
                    "#f59e0b",
                    "#22c55e"
                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }

            }

        }

    });

}
function renderInsights(tasks) {

    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    const completionRate =
        tasks.length === 0
            ? 0
            : Math.round((completed / tasks.length) * 100);

    const highPriorityPending = tasks.filter(task =>
        task.priority === "High" && !task.completed
    ).length;

    let message = "";

    if (completionRate >= 80) {
        message = "Excellent productivity! Keep the momentum going.";
    }
    else if (completionRate >= 60) {
        message = "You're making steady progress. Finish a few more tasks today.";
    }
    else if (completionRate >= 40) {
        message = "You're halfway there. Try completing your high-priority tasks first.";
    }
    else {
        message = "Focus on completing a few important tasks to build momentum.";
    }

    document.getElementById("analytics-insights").innerHTML = `
        <div class="insight-item">
            <span>🎯 Completion Rate</span>
            <strong>${completionRate}%</strong>
        </div>

        <div class="insight-item">
            <span>✅ Completed Tasks</span>
            <strong>${completed}</strong>
        </div>

        <div class="insight-item">
            <span>📌 Pending Tasks</span>
            <strong>${pending}</strong>
        </div>

        <div class="insight-item">
            <span>🔥 High Priority Remaining</span>
            <strong>${highPriorityPending}</strong>
        </div>

        <div class="insight-message">
            💡 ${message}
        </div>
    `;
}
function renderFocusWidget(tasks) {

    const pendingHigh = tasks.filter(t =>
        !t.completed && t.priority === "High"
    ).length;

    let recommendation;

    if (pendingHigh >= 5) {
        recommendation = `
            <h4>🔥 Deep Focus Needed</h4>
            <p>You have several high-priority tasks. Schedule a 60-minute focus session.</p>
        `;
    }
    else if (pendingHigh >= 2) {
        recommendation = `
            <h4>📚 Stay on Track</h4>
            <p>A 30-minute focus session should help you finish your important tasks.</p>
        `;
    }
    else {
        recommendation = `
            <h4>🎉 You're Doing Great</h4>
            <p>No urgent workload detected. Keep maintaining your progress!</p>
        `;
    }

    document.getElementById("focus-widget").innerHTML = recommendation;
}

