(() => {
  const STORAGE_KEY = 'walace-profile-pet-v1';
  const DEFAULT_STATE = {
    name: 'Pixel',
    species: 'cat',
    happiness: 70,
    hunger: 35,
    energy: 80,
    interactions: 0,
  };
  const SPECIES = { cat: '🐱', dog: '🐶', fox: '🦊' };
  const REACTIONS = {
    cuddle: ['Purr! Adorei o carinho! 💖', 'Esse carinho melhorou meu dia! ✨', 'Fica mais um pouquinho comigo? 🐾'],
    play: ['Uau! Que brincadeira divertida! 🧶', 'Foi muito legal brincar com você!', 'Mais uma rodada depois de eu descansar? 😸'],
    snack: ['Nhac! Esse petisco estava ótimo! 🍪', 'Barriguinha feliz, obrigado!', 'Que delícia! 😋'],
    rest: ['Uma pausa gostosa. Zzz... 🌙', 'Já estou recuperando minhas energias!', 'Descansar também faz parte da aventura. ✨'],
  };

  const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

  function loadState() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        name: typeof saved.name === 'string' && saved.name.trim() ? saved.name.slice(0, 18) : DEFAULT_STATE.name,
        species: Object.hasOwn(SPECIES, saved.species) ? saved.species : DEFAULT_STATE.species,
        happiness: clamp(saved.happiness ?? DEFAULT_STATE.happiness),
        hunger: clamp(saved.hunger ?? DEFAULT_STATE.hunger),
        energy: clamp(saved.energy ?? DEFAULT_STATE.energy),
        interactions: Math.max(0, Math.floor(Number(saved.interactions) || 0)),
      };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  let state = loadState();
  const avatar = document.querySelector('#pet-avatar');
  const nameHeading = document.querySelector('#pet-name-heading');
  const nameInput = document.querySelector('#pet-name-input');
  const speciesInput = document.querySelector('#pet-species');
  const message = document.querySelector('#pet-message');
  const moodSummary = document.querySelector('#mood-summary');
  const interactionCount = document.querySelector('#interaction-count');

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      message.textContent = 'Não consegui salvar neste navegador, mas podemos continuar brincando!';
    }
  }

  function currentMood() {
    if (state.hunger >= 80) return 'Acho que está na hora de um petisco. 🍪';
    if (state.energy <= 20) return 'Estou cansadinho. Uma pausa cairia bem. 🌙';
    if (state.happiness <= 25) return 'Estou com saudade de brincar com você! 💜';
    return 'Estou feliz por te ver! ✨';
  }

  function render() {
    const emoji = SPECIES[state.species] || SPECIES.cat;
    avatar.textContent = emoji;
    avatar.setAttribute('aria-label', `${state.name}, mascote virtual`);
    nameHeading.textContent = state.name;
    nameInput.value = state.name;
    speciesInput.value = state.species;
    document.querySelector('#happy-meter').value = state.happiness;
    document.querySelector('#hunger-meter').value = state.hunger;
    document.querySelector('#energy-meter').value = state.energy;
    document.querySelector('#happy-value').textContent = `${state.happiness}%`;
    document.querySelector('#hunger-value').textContent = `${state.hunger}%`;
    document.querySelector('#energy-value').textContent = `${state.energy}%`;
    interactionCount.textContent = new Intl.NumberFormat('pt-BR').format(state.interactions);
    moodSummary.textContent = currentMood();
  }

  function animatePet(animation) {
    avatar.classList.remove('bounce', 'playful', 'snack', 'sleeping');
    void avatar.offsetWidth;
    avatar.classList.add(animation);
    window.setTimeout(() => avatar.classList.remove(animation), 850);
  }

  function randomReaction(action) {
    const messages = REACTIONS[action];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  function performAction(action) {
    if (action === 'play' && state.energy < 15) {
      message.textContent = 'Estou cansado agora. Me ajuda a descansar primeiro? 🌙';
      return;
    }

    const changes = {
      cuddle: { happiness: 15, hunger: 2, energy: -2, animation: 'bounce' },
      play: { happiness: 20, hunger: 10, energy: -16, animation: 'playful' },
      snack: { happiness: 6, hunger: -25, energy: 3, animation: 'snack' },
      rest: { happiness: 2, hunger: 4, energy: 25, animation: 'sleeping' },
    }[action];

    if (!changes) return;
    state = {
      ...state,
      happiness: clamp(state.happiness + changes.happiness),
      hunger: clamp(state.hunger + changes.hunger),
      energy: clamp(state.energy + changes.energy),
      interactions: state.interactions + 1,
    };
    message.textContent = randomReaction(action);
    animatePet(changes.animation);
    saveState();
    render();
  }

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => performAction(button.dataset.action));
  });

  document.querySelector('#name-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim().slice(0, 18);
    if (!name) {
      message.textContent = 'Escolha um nome antes de salvar. 🐾';
      nameInput.focus();
      return;
    }
    state = { ...state, name };
    message.textContent = `Pronto! Pode me chamar de ${name}. 💜`;
    saveState();
    render();
  });

  speciesInput.addEventListener('change', () => {
    state = { ...state, species: speciesInput.value };
    message.textContent = `Gostou do meu novo visual? ${SPECIES[state.species]}`;
    animatePet('bounce');
    saveState();
    render();
  });

  document.querySelector('#reset-pet').addEventListener('click', () => {
    if (!window.confirm('Quer mesmo recomeçar e apagar o progresso deste mascote neste navegador?')) return;
    state = { ...DEFAULT_STATE };
    message.textContent = 'Começamos uma nova aventura! Oi, eu sou Pixel! 🐾';
    saveState();
    render();
  });

  render();
})();
