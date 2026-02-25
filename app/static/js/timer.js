/**
 * Timer Module
 * Handles stopwatch logic, persisting state across page reloads using localStorage
 */

const Timer = {
    state: {
        isRunning: false,
        startTime: null,     // ISO string when session actually started
        accumulatedTime: 0,  // ms accumulated before current running period (for pauses)
        lastResumeTime: null // Date object when timer was last started/resumed
    },
    intervalId: null,
    onTickCallback: null,

    init(onTick) {
        this.onTickCallback = onTick;
        this.loadState();

        if (this.state.isRunning) {
            this.startTicker();
        } else {
            // Just update UI once if paused but has accumulated time
            this.tick();
        }
    },

    loadState() {
        const savedState = localStorage.getItem('studyTimerState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.state.isRunning = parsed.isRunning;
                this.state.startTime = parsed.startTime;
                this.state.accumulatedTime = parsed.accumulatedTime || 0;
                this.state.lastResumeTime = parsed.lastResumeTime ? new Date(parsed.lastResumeTime) : null;
            } catch (e) {
                console.error("Failed to parse timer state");
                this.resetState();
            }
        }
    },

    saveState() {
        localStorage.setItem('studyTimerState', JSON.stringify({
            isRunning: this.state.isRunning,
            startTime: this.state.startTime,
            accumulatedTime: this.state.accumulatedTime,
            lastResumeTime: this.state.lastResumeTime ? this.state.lastResumeTime.toISOString() : null
        }));
    },

    clearState() {
        localStorage.removeItem('studyTimerState');
    },

    resetState() {
        this.state = {
            isRunning: false,
            startTime: null,
            accumulatedTime: 0,
            lastResumeTime: null
        };
        this.saveState();
    },

    start() {
        if (this.state.isRunning) return;

        const now = new Date();

        if (!this.state.startTime) {
            // First time starting this session
            this.state.startTime = now.toISOString();
        }

        this.state.lastResumeTime = now;
        this.state.isRunning = true;
        this.saveState();
        this.startTicker();
    },

    pause() {
        if (!this.state.isRunning) return;

        const now = new Date();
        // Calculate newly accumulated time
        const addedTime = now - this.state.lastResumeTime;
        this.state.accumulatedTime += addedTime;

        this.state.isRunning = false;
        this.state.lastResumeTime = null;
        this.saveState();
        this.stopTicker();
        this.tick(); // Force one last tick to update UI
    },

    async stop() {
        if (this.state.startTime === null) return null; // Didn't even start

        // Pause to stop ticking and calculate final accumulated time
        this.pause();

        const sessionData = {
            start_time: this.state.startTime,
            end_time: new Date().toISOString(),
            duration_seconds: Math.floor(this.state.accumulatedTime / 1000)
        };

        this.resetState();
        this.clearState();

        // If duration is less than a minute, maybe we don't save it, but we'll save it anyway for accuracy
        return sessionData;
    },

    startTicker() {
        if (this.intervalId) clearInterval(this.intervalId);

        // Tick immediately, then every second
        this.tick();
        this.intervalId = setInterval(() => this.tick(), 1000);
    },

    stopTicker() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    getCurrentElapsedMs() {
        let total = this.state.accumulatedTime;
        if (this.state.isRunning && this.state.lastResumeTime) {
            total += (new Date() - this.state.lastResumeTime);
        }
        return total;
    },

    tick() {
        if (this.onTickCallback) {
            const elapsedMs = this.getCurrentElapsedMs();
            this.onTickCallback(elapsedMs, this.state.isRunning);
        }
    },

    // Format milliseconds into HH:MM:SS
    formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }
};
