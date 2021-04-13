'use strict'

{
    const btn = document.getElementById('btn');
    const timer = document.getElementById('timer');
    const results = document.getElementById('results');
    const targetSec = 5;

    let targetTime;
    let timeoutId;

    function countDown() {
        const now = Date.now();
        if (targetTime < now) {
            timer.textContent = 'Failed.';
            stop_to_reset();
            return;
        }

        const remaining = new Date(targetTime - now);
        const s = String(remaining.getSeconds()).padStart(2, '0');
        const ms = String(remaining.getMilliseconds()).padStart(3, '0');
        timer.textContent = `${s}.${ms}`;

        timeoutId = setTimeout(() => {
            countDown();
        }, 10);
    }

    function start_to_stop() {
        btn.classList.remove('start');
        btn.classList.add('stop');
        btn.textContent = 'stop';
    }

    function stop_to_reset() {
        btn.classList.remove('stop');
        btn.classList.add('reset');
        btn.textContent = 'reset';
    }

    function reset_to_start() {
        btn.classList.remove('reset');
        btn.classList.add('start');
        btn.textContent = 'start';
    }

    function initTimer() {
        timer.textContent = '05.000';
    }

    initTimer();

    btn.addEventListener('click', () => {
        if (btn.classList.contains('start')) {
            start_to_stop();

            targetTime = new Date();
            targetTime.setSeconds(targetTime.getSeconds() + targetSec);
            countDown();
        } else if (btn.classList.contains('stop')) {
            stop_to_reset();

            clearTimeout(timeoutId);
        } else {
            reset_to_start();

            const result = document.createElement('li');
            result.textContent = timer.textContent;
            results.insertBefore(result, results.firstChild);

            initTimer();
        }
    });
}