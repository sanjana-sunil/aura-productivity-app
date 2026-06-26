// analytics.js

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