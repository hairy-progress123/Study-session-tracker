/**
 * Chart Integration Module
 * Handles rendering and updating the weekly activity chart using Chart.js
 */

const StudyChart = {
    instance: null,

    /**
     * Initialize or update the weekly chart
     * @param {Array<string>} labels - Day labels (e.g., ['Mon', 'Tue', ...])
     * @param {Array<number>} data - Hours studied per day
     */
    render(labels, data) {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        // Determine colors based on active theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#718096';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

        // Use a gradient for the bar fill
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.9)'); // var(--primary)
        gradient.addColorStop(1, 'rgba(66, 153, 225, 0.9)'); // var(--info)

        const hoverGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        hoverGradient.addColorStop(0, 'rgba(102, 126, 234, 1)');
        hoverGradient.addColorStop(1, 'rgba(66, 153, 225, 1)');

        if (this.instance) {
            // Update existing chart
            this.instance.data.labels = labels;
            this.instance.data.datasets[0].data = data;

            // Update colors in case theme changed
            this.instance.options.scales.x.ticks.color = textColor;
            this.instance.options.scales.y.ticks.color = textColor;
            this.instance.options.scales.x.grid.color = gridColor;
            this.instance.options.scales.y.grid.color = gridColor;

            this.instance.update();
            return;
        }

        // Create new chart
        this.instance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Hours Studied',
                    data: data,
                    backgroundColor: gradient,
                    hoverBackgroundColor: hoverGradient,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: isDark ? '#f8fafc' : '#2d3748',
                        bodyColor: isDark ? '#94a3b8' : '#718096',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return `${context.parsed.y.toFixed(2)} hours`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            padding: 10
                        },
                        border: { display: false }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            padding: 10
                        },
                        border: { display: false }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    },

    /**
     * Force refresh the chart colors when theme changes
     */
    refreshTheme() {
        if (!this.instance) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#718096';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

        this.instance.options.scales.x.ticks.color = textColor;
        this.instance.options.scales.y.ticks.color = textColor;
        this.instance.options.scales.x.grid.color = gridColor;
        this.instance.options.scales.y.grid.color = gridColor;

        this.instance.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        this.instance.options.plugins.tooltip.titleColor = isDark ? '#f8fafc' : '#2d3748';
        this.instance.options.plugins.tooltip.bodyColor = isDark ? '#94a3b8' : '#718096';

        this.instance.update();
    }
};

// Listen for theme toggle to update chart
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            // Give CSS variables a tiny bit of time to apply
            setTimeout(() => StudyChart.refreshTheme(), 50);
        });
    }
});
