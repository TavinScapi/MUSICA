let metronomeInterval;

function startMetronome() {
    const bpm = document.getElementById("bpm").value;
    const interval = 60000 / bpm;

    stopMetronome();  // Para qualquer intervalo ativo antes de iniciar um novo

    metronomeInterval = setInterval(() => {
        new Audio('click-sound.mp3').play();
    }, interval);
}

function stopMetronome() {
    clearInterval(metronomeInterval);
}
