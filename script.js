const engine = document.querySelector("#audio-engine");
const buttons = document.querySelectorAll(".audio-button");
const visualizer = document.querySelector("#production-visualizer");
const visualizerContext = visualizer?.getContext("2d");

let audioContext;
let analyser;
let sourceNode;
let frequencyData;
let smoothedSpectrum;
let visualizerFrame;
let idleTick = 0;

function setButtonIcon(button, iconName) {
  const icon = button.querySelector("svg");
  if (!icon || !window.lucide) return;
  icon.outerHTML = `<i data-lucide="${iconName}"></i>`;
  window.lucide.createIcons();
}

function resetButtons() {
  buttons.forEach((button) => {
    button.classList.remove("is-playing");
    setButtonIcon(button, "play");
  });
}

function sizeVisualizer() {
  if (!visualizer || !visualizerContext) return;
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(visualizer.clientWidth * ratio));
  const height = Math.max(1, Math.floor(visualizer.clientHeight * ratio));
  if (visualizer.width !== width || visualizer.height !== height) {
    visualizer.width = width;
    visualizer.height = height;
  }
}

function drawVisualizer() {
  if (!visualizer || !visualizerContext) return;
  sizeVisualizer();
  const width = visualizer.width;
  const height = visualizer.height;
  const active = Boolean(analyser && !engine.paused);

  visualizerContext.clearRect(0, 0, width, height);

  // Draw Grid
  visualizerContext.save();
  visualizerContext.strokeStyle = "rgba(255, 255, 255, 0.05)";
  for (let i = 0; i <= 10; i++) {
    const x = (width / 10) * i;
    visualizerContext.beginPath(); visualizerContext.moveTo(x, 0); visualizerContext.lineTo(x, height); visualizerContext.stroke();
    const y = (height / 10) * i;
    visualizerContext.beginPath(); visualizerContext.moveTo(0, y); visualizerContext.lineTo(width, y); visualizerContext.stroke();
  }
  visualizerContext.restore();

  if (active) {
    analyser.getByteFrequencyData(frequencyData);
  } else {
    idleTick += 0.01;
  }

  // Draw Trace
  visualizerContext.save();
  visualizerContext.strokeStyle = active ? "#ff7900" : "rgba(255, 255, 255, 0.2)";
  visualizerContext.lineWidth = 3;
  visualizerContext.beginPath();
  for (let i = 0; i < 100; i++) {
    const x = (width / 100) * i;
    const val = active ? frequencyData[i] / 255 : (0.2 + Math.sin(idleTick + i * 0.1) * 0.1);
    const y = height * 0.5 - (val * height * 0.4);
    if (i === 0) visualizerContext.moveTo(x, y); else visualizerContext.lineTo(x, y);
  }
  visualizerContext.stroke();
  visualizerContext.restore();

  visualizerFrame = requestAnimationFrame(drawVisualizer);
}

async function setupAudio() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      sourceNode = audioContext.createMediaElementSource(engine);
      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch (e) {
      console.warn("Visualizer failed (likely local file). Audio only mode.");
    }
  }
  if (audioContext?.state === 'suspended') await audioContext.resume();
  if (!visualizerFrame) drawVisualizer();
}

buttons.forEach((button) => {
  button.addEventListener("click", async () => {
    const source = button.dataset.audio;
    const isCurrent = engine.getAttribute("src") === source;

    if (isCurrent && !engine.paused) {
      engine.pause();
      button.classList.remove("is-playing");
      setButtonIcon(button, "play");
      return;
    }

    resetButtons();
    engine.src = source;
    
    await setupAudio();

    engine.play().then(() => {
      button.classList.add("is-playing");
      setButtonIcon(button, "pause");
    }).catch(err => {
      console.error("Playback failed:", err);
      alert("Please click anywhere on the page first, then try again.");
    });
  });
});

engine.addEventListener("ended", resetButtons);

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const recipient = "vipreetbeats@gmail.com";
  const subject = encodeURIComponent(`Project Request: ${form.service.value}`);
  const body = encodeURIComponent(`Artist: ${form.name.value}\nEmail: ${form.email.value}`);
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});

window.lucide?.createIcons();
drawVisualizer();
