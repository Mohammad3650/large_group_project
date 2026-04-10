import dingSound from '../../assets/Dashboard/ding.mp3';

/**
 * Plays the ding sound when the user completes a task.
 */
function playDing() {
    const ding = new Audio(dingSound);
    ding.volume = 0.3;
    ding.currentTime = 0;
    return audio;
}

function playDing() {
    const ding = createDingAudio();
    ding.play().catch(() => {});
}


export default playDing;
