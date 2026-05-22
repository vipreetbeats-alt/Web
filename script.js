const engine = document.querySelector("#audio-engine");
const buttons = document.querySelectorAll(".audio-button");

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

buttons.forEach((button) => {
  button.addEventListener("click", () => {
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
    
    engine.play().then(() => {
      button.classList.add("is-playing");
      setButtonIcon(button, "pause");
    }).catch(err => {
      console.error("Playback failed:", err);
      alert("Please click anywhere on the page first, then try the play button again.");
    });
  });
});

engine.addEventListener("ended", resetButtons);

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.name.value;
  const email = form.email.value;
  const service = form.service.value;
  const recipient = "vipreetbeats@gmail.com";
  const subject = encodeURIComponent(`Project Request: ${service}`);
  const body = encodeURIComponent(`Artist Name: ${name}\nEmail: ${email}\nService: ${service}`);
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});

window.lucide?.createIcons();
