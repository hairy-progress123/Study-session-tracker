/**
 * Main application logic linking UI to API and Timer
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Determine if on dashboard
    if (!document.getElementById('timerDisplay')) return;

    // Load initial data
    updateDateDisplay();
    await refreshDashboard();

    // Initialize notification sound
    const notificationSound = new Audio('/static/sounds/notification.mp3');

    // DOM Elements
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const endBtn = document.getElementById('endBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerStatus = document.getElementById('timerStatus');
    const completionModal = document.getElementById('completionModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Timer UI Callback
    function onTimerTick(elapsedMs, isRunning) {
        timerDisplay.textContent = Timer.formatTime(elapsedMs);

        if (isRunning) {
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            endBtn.classList.remove('hidden');
            timerStatus.textContent = 'Session in progress... Focus!';
            timerStatus.style.color = 'var(--success)';

            // Pulse effect
            document.querySelector('.timer-display').style.textShadow = '0 0 15px rgba(102, 126, 234, 0.4)';
        } else if (elapsedMs > 0) {
            // Paused
            startBtn.classList.remove('hidden');
            startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            pauseBtn.classList.add('hidden');
            endBtn.classList.remove('hidden');
            timerStatus.textContent = 'Paused';
            timerStatus.style.color = 'var(--warning)';

            document.querySelector('.timer-display').style.textShadow = 'none';
        } else {
            // Reset state
            resetUI();
        }
    }

    function resetUI() {
        startBtn.classList.remove('hidden');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        startBtn.classList.add('btn-glow');
        pauseBtn.classList.add('hidden');
        endBtn.classList.add('hidden');
        timerDisplay.textContent = '00:00:00';
        timerStatus.textContent = 'Ready to focus?';
        timerStatus.style.color = 'var(--text-secondary)';
        document.querySelector('.timer-display').style.textShadow = 'none';
    }

    // Initialize Timer
    Timer.init(onTimerTick);

    // Event Listeners
    startBtn.addEventListener('click', () => {
        startBtn.classList.remove('btn-glow');
        Timer.start();
    });

    pauseBtn.addEventListener('click', () => {
        Timer.pause();
    });

    endBtn.addEventListener('click', async () => {
        // Confirmation if session is very short
        if (Timer.getCurrentElapsedMs() < 60000) {
            if (!confirm("This session is less than a minute. Are you sure you want to end and save it?")) {
                return;
            }
        }

        endBtn.disabled = true;
        endBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const sessionData = await Timer.stop();

            if (sessionData && sessionData.duration_seconds > 0) {
                // Save to backend
                await API.saveSession(sessionData);

                // Play sound
                try { notificationSound.play(); } catch (e) { }

                // Show modal
                document.getElementById('modalTimeLogged').textContent = Timer.formatTime(sessionData.duration_seconds * 1000);

                // Random motivational message
                const messages = [
                    "Great job staying focused!",
                    "Every minute counts. Well done!",
                    "You're one step closer to your goals.",
                    "Awesome productivity!",
                    "Take a well-deserved break now."
                ];
                document.getElementById('motivationalMessage').textContent = messages[Math.floor(Math.random() * messages.length)];

                completionModal.classList.add('show');

                // Refresh data
                await refreshDashboard();
            }
        } catch (error) {
            console.error('Error ending session:', error);
            alert('There was a problem saving your session. Please check your connection.');
        } finally {
            endBtn.disabled = false;
            resetUI();
        }
    });

    closeModalBtn.addEventListener('click', () => {
        completionModal.classList.remove('show');
    });

    // Refresh dashboard data
    async function refreshDashboard() {
        const stats = await API.getStats();
        if (stats) {
            document.getElementById('todayHours').innerHTML = `${stats.today_hours}<span class="unit">h</span>`;
            document.getElementById('totalHours').innerHTML = `${stats.total_hours}<span class="unit">h</span>`;
            document.getElementById('streakCount').innerHTML = `${stats.streak}<span class="unit"> days</span>`;

            // Update progress bar
            const progressPercent = Math.min(100, Math.round((stats.today_hours / stats.daily_goal) * 100));
            document.getElementById('dailyProgressBar').style.width = `${progressPercent}%`;
            document.getElementById('dailyGoalProgress').textContent = `${progressPercent}%`;

            // Update graph
            StudyChart.render(stats.weekly_labels, stats.weekly_data);
        }

        const sessions = await API.getSessions();
        if (sessions) {
            renderHistory(sessions);
        }
    }

    function renderHistory(sessions) {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';

        if (sessions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No sessions found. Start studying!</td></tr>';
            return;
        }

        sessions.slice(0, 10).forEach(session => {
            const row = document.createElement('tr');

            const dateStr = new Date(session.start_time).toLocaleDateString();
            const startStr = new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endStr = new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const durationStr = Timer.formatTime(session.duration_seconds * 1000);

            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${startStr}</td>
                <td>${endStr}</td>
                <td><span style="font-family: 'Outfit', monospace; font-weight: 500">${durationStr}</span></td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="deleteSession(${session.id})">
                        <i class="fas fa-trash text-danger"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', options);
    }
});

// Global reference for table inline action
window.deleteSession = async function (id) {
    if (confirm('Are you sure you want to delete this session?')) {
        const success = await API.deleteSession(id);
        if (success) {
            window.location.reload(); // Quickest way to refresh everything
        } else {
            alert('Failed to delete session.');
        }
    }
};
