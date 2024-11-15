let audioContext;
let analyser;
let targetFrequency = null;
let isTuning = false;

async function startTuning() {
    if (!navigator.mediaDevices.getUserMedia) {
        alert("Seu navegador não suporta acesso ao microfone.");
        return;
    }

    // Inicializar o contexto de áudio e o analisador de frequência
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    // Acessar o microfone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    isTuning = true;
    updateTuner();
}

function setTargetFrequency(frequency) {
    targetFrequency = frequency;
    document.getElementById("indicator").style.left = "50%";
}

function updateTuner() {
    if (!isTuning) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = detectFrequency(buffer, audioContext.sampleRate);

    if (frequency && targetFrequency) {
        const difference = frequency - targetFrequency;
        const indicatorPosition = 50 + (difference / targetFrequency) * 100;

        // Limita o indicador para ficar dentro do visualizador
        document.getElementById("indicator").style.left = Math.min(100, Math.max(0, indicatorPosition)) + "%";
    }

    requestAnimationFrame(updateTuner);
}

function detectFrequency(buffer, sampleRate) {
    let bestCorrelation = 0;
    let bestOffset = -1;
    let rms = 0;

    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.01) return null;

    let lastCorrelation = 1;
    for (let offset = 0; offset < buffer.length; offset++) {
        let correlation = 0;

        for (let i = 0; i < buffer.length - offset; i++) {
            correlation += buffer[i] * buffer[i + offset];
        }
        correlation = correlation / (buffer.length - offset);
        if (correlation > 0.9 && correlation > lastCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        } else if (correlation < 0.9) {
            break;
        }
        lastCorrelation = correlation;
    }

    if (bestOffset === -1) return null;

    return sampleRate / bestOffset;
}
