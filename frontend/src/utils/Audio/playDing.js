import dingSound from '../../assets/Dashboard/ding.mp3';

/**
 * Plays the ding sound when the user completes a task.
 */
function CreateDingAudio() {
    const audio = new Audio(dingSound);
    audio.volume = 0.3;
    audio.currentTime = 0;
    return audio;
}

function playDing() {
    const ding = createDingAudio();
    ding.play().catch(() => {});
}


export default playDing;
