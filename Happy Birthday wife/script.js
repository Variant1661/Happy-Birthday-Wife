const app = document.getElementById("app");
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

const UNLOCK_DATE = new Date(2026, 6, 23, 0, 0, 0);
const preview = new URLSearchParams(window.location.search).get("preview") === "1";
const fastPreview = new URLSearchParams(window.location.search).get("fast") === "1";
const MIN_JOURNEY_SECONDS = fastPreview ? 20 : 300;

const storyMoments = [
  {
    title: "2018-2021: Before us, we were becoming ourselves",
    text: "Deepak went from Biomedical Engineering at SRM Chennai to sales, medical coding, Cognizant, VRCM/CorroHealth, and finally became a trainer in 2021. Dhanashree built her path from B.Pharm in Pune to Advantmed, work from home during Covid, and then CorroHealth as a medical coder."
  },
  {
    title: "Chennai: the brave move",
    text: "Dhanashree fought to convince her family, left Pune, came to a new city, stayed in a hostel, did not know Tamil, and joined CRC training. That batch became Deepak's first certification batch as a trainer."
  },
  {
    title: "The first laugh",
    text: "On the first day, after a sarcastic comment from someone else, Deepak said, \"Don't worry, I can speak English well and understand Hindi.\" Dhanashree laughed. A tiny moment, but apparently destiny likes comedy."
  },
  {
    title: "The haircut message",
    text: "A few weeks later, Deepak took one day off. Dhanashree messaged to ask why he had not come. He said he had gone for a haircut. From one simple message, the talking slowly became something more."
  },
  {
    title: "Chapati, beach, and the beginning",
    text: "After training, Deepak invited batchmates home. Dhanashree was the only girl, they cooked together, she made chapati in his kitchen, and later everyone went to the beach. After that, Deepak and Dhanashree started meeting more, talking more, and getting closer."
  },
  {
    title: "Roommates before labels",
    text: "When Dhanashree had to vacate her hostel, Deepak said his room had space. She said yes. They were not fully sure what the relationship was yet, but life quietly moved them closer."
  },
  {
    title: "Choosing each other",
    text: "Deepak used to get scared whenever Dhanashree went to Pune, afraid she might not come back. Then one day she went and returned. That gave him hope: she was choosing him too."
  },
  {
    title: "Madhya Pradesh, Hyderabad, and hard days",
    text: "They moved together for work, left before Diwali 2022, tried new jobs, started a training company, travelled to Hyderabad for a client, worked hard, got cheated, and were not paid. It hurt, but they faced it together."
  },
  {
    title: "Mumbai, Pune weekends, and the UK",
    text: "Mumbai made them stronger. Dhanashree enjoyed training, they went to Pune on weekends, met friends, ate pani puri, and enjoyed life. Deepak had once cancelled his UK plan because he feared losing her. In 2023, he tried again, and Dhanashree came to the UK five months later because being apart was not an option."
  },
  {
    title: "Families, chaos, and 16 March 2026",
    text: "They faced family worries, different states, languages, cultures, chickenpox delays, emotional talks, and big decisions. Finally, after Chennai, Madhya Pradesh, Hyderabad, Mumbai, Pune, and the UK, Deepak and Dhanashree got married on 16 March 2026. A Tamil-Marathi love story built on courage, risk, friendship, sacrifice, and choosing each other again and again."
  }
];

const state = {
  round: 0,
  answers: [],
  meter: 12,
  confetti: [],
  gameClicks: 0,
  lockedTimer: null,
  journeyStart: null,
  journeyTimer: null,
  journeyTasks: {
    story: false,
    hunt: false,
    note: false,
    pledge: false
  },
  loveNote: []
};

const rounds = [
  {
    title: "Important security question: do you hate me?",
    body: "Please answer honestly. The husband audit department is watching with snacks.",
    good: "No, obviously",
    bad: "Yes",
    trick: "run"
  },
  {
    title: "Are you absolutely sure you want to click Yes?",
    body: "Because this button has been doing cardio and is very hard to catch.",
    good: "Fine, no",
    bad: "Yes, still",
    trick: "teleport"
  },
  {
    title: "Would you trade me for unlimited biryani?",
    body: "Think carefully. I can also order biryani. This is my legal defence.",
    good: "Never",
    bad: "Maybe",
    trick: "decoys"
  },
  {
    title: "Rate my annoyingness today.",
    body: "The wrong answer is trying to escape. The correct answer has manners.",
    good: "Perfect amount",
    bad: "Too much",
    trick: "tiny"
  },
  {
    title: "Last chance: should I stop being dramatic?",
    body: "Hold the serious answer for three seconds. Spoiler: romance has other plans.",
    good: "Never stop",
    bad: "Yes, stop",
    trick: "hold"
  }
];

const diversions = [
  "Access denied. The birthday vault is still applying lipstick.",
  "Today the surprise is pretending to be a loading screen with commitment issues.",
  "A tiny committee has reviewed your request and said: come back on 23 July.",
  "This page is currently marinating in romance. Opening early may reduce flavour.",
  "The candles are in rehearsal. They refuse to perform before the big day.",
  "The flowers have union rules. No blooming before 23 July.",
  "Your husband has hidden the surprise behind several layers of nonsense.",
  "Birthday magic is charging. Please do not shake the browser.",
  "Early entry detected. Deploying distraction: imagine me looking innocent.",
  "Not yet. The cake is still learning how to be dramatic."
];

const teaseGames = [
  {
    title: "Mini game: collect 5 compliments",
    instruction: "Tap the floating compliments before they escape. Prize: absolutely nothing, but with romance.",
    type: "collect"
  },
  {
    title: "Mini game: find the real unlock button",
    instruction: "One button is honest. The others are dramatic liars.",
    type: "decoy"
  },
  {
    title: "Mini game: charge the romance meter",
    instruction: "Tap the meter button until it admits this surprise is worth waiting for.",
    type: "meter"
  },
  {
    title: "Mini game: password rehearsal",
    instruction: "Type the very secure password. Hint: the answer is cake.",
    type: "password"
  }
];

function render() {
  if (!preview && new Date() < UNLOCK_DATE) {
    renderLocked();
    return;
  }
  renderIntro();
}

function renderLocked() {
  const now = new Date();
  const diff = Math.max(0, UNLOCK_DATE - now);
  const dayIndex = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const message = diversions[dayIndex % diversions.length];
  const teaseGame = teaseGames[dayIndex % teaseGames.length];
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const minutes = Math.floor(diff / 60000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  app.innerHTML = `
    <section class="stage">
      <div class="panel question-zone">
        <p class="eyebrow">Birthday vault locked</p>
        <h2>Nice try, beautiful.</h2>
        <p>${message}</p>
        <div class="countdown" aria-label="Countdown to 23 July 2026">
          <div><strong id="countDays">${days}</strong><span>days</span></div>
          <div><strong id="countHours">${hours}</strong><span>hours</span></div>
          <div><strong id="countMinutes">${minutes}</strong><span>minutes</span></div>
          <div><strong id="countSeconds">${seconds}</strong><span>seconds</span></div>
        </div>
        <div class="tease-card">
          <p class="eyebrow">Early-opening entertainment</p>
          <h3>${teaseGame.title}</h3>
          <p>${teaseGame.instruction}</p>
          <div class="mini-arena tease-arena" id="teaseArena"></div>
          <p id="teaseStatus">Complete today's tiny nonsense to receive a suspiciously vague clue.</p>
        </div>
        <div class="mini-arena" id="lockedArena">
          <button class="btn free-dodger" id="earlyButton">Open anyway</button>
        </div>
        <p id="dailyLine">Today's task: try to catch the button. It has been trained personally by your husband.</p>
      </div>
    </section>
  `;

  const button = document.getElementById("earlyButton");
  const arena = document.getElementById("lockedArena");
  button.addEventListener("pointerenter", () => moveInside(button, arena));
  button.addEventListener("click", () => {
    state.gameClicks += 1;
    popNote("Still not 23 July", button);
    moveInside(button, arena);
    if (state.gameClicks > 4) {
      document.getElementById("dailyLine").textContent = "Impressive persistence. Suspicious, but impressive. The surprise still opens on 23 July.";
    }
  });
  setupTeaseGame(teaseGame.type, dayIndex);
  if (state.lockedTimer) window.clearInterval(state.lockedTimer);
  state.lockedTimer = window.setInterval(updateLockedCountdown, 1000);
}

function updateLockedCountdown() {
  const now = new Date();
  if (now >= UNLOCK_DATE) {
    window.clearInterval(state.lockedTimer);
    renderIntro();
    return;
  }
  const diff = Math.max(0, UNLOCK_DATE - now);
  document.getElementById("countDays").textContent = Math.floor(diff / 86400000);
  document.getElementById("countHours").textContent = Math.floor(diff / 3600000) % 24;
  document.getElementById("countMinutes").textContent = Math.floor(diff / 60000) % 60;
  document.getElementById("countSeconds").textContent = Math.floor(diff / 1000) % 60;
}

function setupTeaseGame(type, dayIndex) {
  const arena = document.getElementById("teaseArena");
  const status = document.getElementById("teaseStatus");
  const clues = [
    "Clue earned: there will be cake. This is not shocking, but it is important.",
    "Clue earned: the surprise contains at least one dramatic husband sentence.",
    "Clue earned: flowers may be involved. Officially unconfirmed.",
    "Clue earned: patience has been noticed and will be rewarded with extra birthday nonsense."
  ];
  const win = () => {
    status.textContent = clues[dayIndex % clues.length];
    burst(35);
  };

  if (type === "collect") {
    let collected = 0;
    const labels = ["cute", "boss", "queen", "smile", "magic"];
    labels.forEach((label, index) => {
      const target = document.createElement("button");
      target.className = "tease-token";
      target.textContent = label;
      target.style.left = `${10 + index * 16}%`;
      target.style.top = `${18 + (index % 2) * 38}%`;
      arena.appendChild(target);
      target.addEventListener("click", () => {
        target.disabled = true;
        target.classList.add("caught");
        collected += 1;
        status.textContent = `Compliments collected: ${collected}/5. Husband ego: stable.`;
        if (collected === 5) win();
      });
    });
  }

  if (type === "decoy") {
    ["Open now", "Open maybe", "Open-ish", "Wait nicely"].forEach((label, index) => {
      const option = document.createElement("button");
      option.className = "btn secondary tease-option";
      option.textContent = label;
      arena.appendChild(option);
      option.addEventListener("click", () => {
        if (index === 3) {
          win();
          option.textContent = "Correct. Suspiciously patient.";
          option.classList.remove("secondary");
          option.classList.add("leaf");
        } else {
          status.textContent = "That button lied with confidence. Try again.";
          moveInside(option, arena);
        }
      });
    });
  }

  if (type === "meter") {
    let charge = 0;
    arena.innerHTML = `
      <div class="tease-meter"><span id="teaseMeterFill"></span></div>
      <button class="btn" id="chargeLove">Tap for patience points</button>
    `;
    document.getElementById("chargeLove").addEventListener("click", () => {
      charge = Math.min(100, charge + 14 + Math.floor(Math.random() * 8));
      document.getElementById("teaseMeterFill").style.width = `${charge}%`;
      status.textContent = `Romance meter: ${charge}%. Still locked, still adorable.`;
      if (charge >= 100) win();
    });
  }

  if (type === "password") {
    arena.innerHTML = `
      <input class="tease-input" id="teasePassword" placeholder="Type password here">
      <button class="btn" id="tryPassword">Try password</button>
    `;
    document.getElementById("tryPassword").addEventListener("click", () => {
      const value = document.getElementById("teasePassword").value.trim().toLowerCase();
      if (value === "cake") {
        win();
      } else {
        status.textContent = "Incorrect. Hint: it is delicious and probably has candles.";
      }
    });
  }
}

function renderIntro() {
  app.innerHTML = `
    <section class="hero">
      <img src="assets/birthday-scene.png" alt="Birthday cake with flowers and candlelight">
      <div class="hero-content">
        <p class="eyebrow">Mission unlocked</p>
        <h1>Happy Birthday, my love</h1>
        <p>Before the real wish appears, you must survive a very scientific husband quiz. It is silly, biased, and absolutely made with love.</p>
        <button class="btn" id="startBtn">Begin the nonsense</button>
      </div>
    </section>
  `;
  document.getElementById("startBtn").addEventListener("click", () => {
    burst();
    renderRound(0);
  });
}

function renderRound(index) {
  state.round = index;
  const round = rounds[index];
  app.innerHTML = `
    <section class="stage">
      <div class="panel question-zone" id="panel">
        <p class="eyebrow">Question ${index + 1} of ${rounds.length}</p>
        <h2>${round.title}</h2>
        <p>${round.body}</p>
        <div class="meter"><span style="width:${state.meter}%"></span></div>
        <div class="mini-arena" id="arena"></div>
        <div class="actions">
          <button class="btn leaf" id="goodBtn">${round.good}</button>
          <button class="btn secondary dodger" id="badBtn">${round.bad}</button>
        </div>
      </div>
    </section>
  `;

  const good = document.getElementById("goodBtn");
  const bad = document.getElementById("badBtn");
  const arena = document.getElementById("arena");
  good.addEventListener("click", nextRound);
  wireTrick(round.trick, bad, arena);
}

function wireTrick(trick, bad, arena) {
  let holdTimer = null;
  let holdProgress = 0;

  if (trick === "run") {
    bad.addEventListener("pointerenter", () => moveButton(bad));
    bad.addEventListener("click", () => {
      popNote("Objection sustained", bad);
      renderRound(state.round + 1);
    });
  }

  if (trick === "teleport") {
    bad.addEventListener("pointerdown", () => {
      bad.textContent = "Are you sure sure?";
      moveButton(bad);
      popNote("Button has left the chat", bad);
    });
    bad.addEventListener("click", () => renderRound(state.round + 1));
  }

  if (trick === "decoys") {
    arena.innerHTML = "";
    ["Yes", "Yes but no", "No but spicy", "Ask me after cake"].forEach((label, index) => {
      const decoy = document.createElement("button");
      decoy.className = "btn secondary free-dodger";
      decoy.textContent = label;
      decoy.style.left = `${14 + index * 19}%`;
      decoy.style.top = `${22 + (index % 2) * 38}%`;
      arena.appendChild(decoy);
      decoy.addEventListener("pointerenter", () => moveInside(decoy, arena));
      decoy.addEventListener("click", () => {
        popNote("Cute attempt", decoy);
        moveInside(decoy, arena);
      });
    });
    bad.addEventListener("click", () => renderRound(state.round + 1));
  }

  if (trick === "tiny") {
    let tinyCooldown = false;
    const dodgeTinyButton = () => {
      if (tinyCooldown) return;
      tinyCooldown = true;
      const current = Math.max(0.36, Number(bad.dataset.scale || 1) - 0.14);
      bad.dataset.scale = current;
      bad.textContent = current <= 0.5 ? "nope" : "Too much";
      bad.style.transform = `translate(${Math.random() * 170 - 85}px, ${Math.random() * 110 - 55}px) scale(${current}) rotate(${Math.random() * 22 - 11}deg)`;
      window.setTimeout(() => {
        tinyCooldown = false;
      }, 110);
    };

    document.addEventListener("pointermove", (event) => {
      if (state.round !== 3 || !document.body.contains(bad)) return;
      const rect = bad.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      if (distance < 145) dodgeTinyButton();
    });

    bad.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      dodgeTinyButton();
      popNote("Complaint rejected", bad);
    });
    bad.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dodgeTinyButton();
    });
  }

  if (trick === "hold") {
    bad.textContent = "Hold to stop";
    bad.addEventListener("pointerdown", () => {
      holdProgress = 0;
      bad.textContent = "Holding... 0%";
      holdTimer = window.setInterval(() => {
        holdProgress += 18;
        bad.textContent = `Holding... ${Math.min(99, holdProgress)}%`;
        moveButton(bad);
        if (holdProgress >= 90) {
          window.clearInterval(holdTimer);
          bad.textContent = "Romance says no";
          popNote("Drama renewed", bad);
        }
      }, 260);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
      bad.addEventListener(eventName, () => {
        window.clearInterval(holdTimer);
        bad.textContent = "Hold to stop";
      });
    });
    bad.addEventListener("click", () => renderPuzzle());
  }
}

function nextRound() {
  state.meter = Math.min(100, state.meter + 18);
  burst();
  if (state.round >= rounds.length - 1) {
    renderPuzzle();
  } else {
    renderRound(state.round + 1);
  }
}

function renderPuzzle() {
  const questions = [
    ["Which birthday escape do you prefer?", ["Mountains", "Beaches"]],
    ["What is more us?", ["Trekking together", "Dancing in rain"]],
    ["Pick a birthday superpower.", ["Unlimited cuddles", "Instant cake"]],
    ["Choose the final mood.", ["Soft romance", "Full drama"]]
  ];

  app.innerHTML = `
    <section class="stage">
      <div class="panel result">
        <p class="eyebrow">Surprise puzzle</p>
        <h2>You survived. Suspiciously well.</h2>
        <p>Now choose your adventure. There are no wrong answers, because the judge is biased and already loves you.</p>
        <div id="puzzle"></div>
        <div class="actions">
          <button class="btn" id="finishBtn" disabled>Unlock birthday wish</button>
        </div>
      </div>
    </section>
  `;

  const puzzle = document.getElementById("puzzle");
  questions.forEach(([question, options], questionIndex) => {
    const block = document.createElement("div");
    block.innerHTML = `<p><strong>${question}</strong></p>`;
    const grid = document.createElement("div");
    grid.className = "choice-grid";
    options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "btn secondary";
      button.textContent = option;
      button.addEventListener("click", () => {
        state.answers[questionIndex] = option;
        [...grid.children].forEach((child) => child.classList.add("secondary"));
        button.classList.remove("secondary");
        button.classList.add("leaf");
        document.getElementById("finishBtn").disabled = state.answers.filter(Boolean).length < questions.length;
      });
      grid.appendChild(button);
    });
    block.appendChild(grid);
    puzzle.appendChild(block);
  });

  document.getElementById("finishBtn").addEventListener("click", startBirthdayJourney);
}

function startBirthdayJourney() {
  state.journeyStart = Date.now();
  state.journeyTasks = {
    story: false,
    hunt: false,
    note: false,
    pledge: false
  };
  state.loveNote = [];
  renderJourney("story");
}

function renderJourney(stage) {
  if (state.journeyTimer) window.clearInterval(state.journeyTimer);
  const tabs = [
    ["story", "Our story"],
    ["hunt", "Love hunt"],
    ["note", "Love note"],
    ["pledge", "Final promise"]
  ];

  app.innerHTML = `
    <section class="stage">
      <div class="panel result journey-panel">
        <div class="journey-top">
          <div>
            <p class="eyebrow">Cake unlock mission</p>
            <h2>Earn the cake, birthday queen.</h2>
          </div>
          <div class="journey-clock" aria-label="Cake unlock timer">
            <strong id="journeyTime">5:00</strong>
            <span>until cake</span>
          </div>
        </div>
        <div class="journey-tabs">
          ${tabs.map(([id, label]) => `<button class="journey-tab ${id === stage ? "active" : ""}" data-stage="${id}">${label}</button>`).join("")}
        </div>
        <div id="journeyBody"></div>
        <div class="journey-unlock">
          <div class="tease-meter"><span id="journeyProgress"></span></div>
          <button class="btn" id="cakeUnlockBtn" disabled>Complete missions and wait for cake</button>
        </div>
      </div>
    </section>
  `;

  document.querySelectorAll(".journey-tab").forEach((tab) => {
    tab.addEventListener("click", () => renderJourney(tab.dataset.stage));
  });

  if (stage === "story") renderStoryStage();
  if (stage === "hunt") renderLoveHuntStage();
  if (stage === "note") renderLoveNoteStage();
  if (stage === "pledge") renderPledgeStage();

  document.getElementById("cakeUnlockBtn").addEventListener("click", renderFinale);
  updateJourneyUnlock();
  state.journeyTimer = window.setInterval(updateJourneyUnlock, 1000);
}

function renderStoryStage() {
  const body = document.getElementById("journeyBody");
  body.innerHTML = `
    <p>Open at least 5 chapters of your Tamil-Marathi love story. Yes, this is emotional homework. No, HR cannot help.</p>
    <div class="story-path">
      ${storyMoments.map((moment, index) => `
        <article class="story-card ${index === 0 ? "open viewed" : ""}">
          <button class="story-toggle" type="button">${moment.title}</button>
          <p>${moment.text}</p>
        </article>
      `).join("")}
    </div>
    <p id="storyStatus">Chapters opened: 1/${storyMoments.length}. Minimum required because husband is sentimental: 5.</p>
    <div class="actions">
      <button class="btn" id="storyDone" disabled>I read the evidence</button>
    </div>
  `;

  const updateStoryProgress = () => {
    const opened = document.querySelectorAll(".story-card.viewed").length;
    document.getElementById("storyStatus").textContent = `Chapters opened: ${opened}/${storyMoments.length}. Minimum required because husband is sentimental: 5.`;
    document.getElementById("storyDone").disabled = opened < 5;
  };

  document.querySelectorAll(".story-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".story-card");
      card.classList.toggle("open");
      card.classList.add("viewed");
      updateStoryProgress();
      burst(18);
    });
  });
  document.getElementById("storyDone").addEventListener("click", () => {
    state.journeyTasks.story = true;
    popNote("Story filed under: adorable", document.getElementById("storyDone"));
    renderJourney("hunt");
  });
}

function renderLoveHuntStage() {
  const body = document.getElementById("journeyBody");
  body.innerHTML = `
    <p>Catch 12 floating reasons I love you. They are moving because compliments get shy.</p>
    <div class="love-hunt" id="loveHunt"></div>
    <p id="huntStatus">Reasons caught: 0/12</p>
  `;

  const arena = document.getElementById("loveHunt");
  let caught = 0;
  const reasons = ["smile", "kindness", "laugh", "eyes", "patience", "spark", "warmth", "magic", "style", "heart", "chaos", "home"];
  reasons.forEach((reason, index) => {
    const token = document.createElement("button");
    token.className = "reason-token";
    token.textContent = reason;
    token.style.left = `${8 + Math.random() * 78}%`;
    token.style.top = `${10 + Math.random() * 70}%`;
    token.style.animationDelay = `${index * 90}ms`;
    arena.appendChild(token);
    token.addEventListener("click", () => {
      token.classList.add("caught");
      token.disabled = true;
      caught += 1;
      document.getElementById("huntStatus").textContent = `Reasons caught: ${caught}/12`;
      if (caught === reasons.length) {
        state.journeyTasks.hunt = true;
        burst(80);
        window.setTimeout(() => renderJourney("note"), 500);
      }
    });
  });
}

function renderLoveNoteStage() {
  const body = document.getElementById("journeyBody");
  const words = ["beautiful", "funny", "brave", "soft-hearted", "my favourite person", "birthday queen", "chaos manager", "my home"];
  body.innerHTML = `
    <p>Build a tiny love note by choosing 4 words. I will pretend this was a very serious writing workshop.</p>
    <div class="word-bank">
      ${words.map((word) => `<button class="btn secondary word-chip" type="button">${word}</button>`).join("")}
    </div>
    <div class="love-note-preview" id="notePreview">Dear wife, you are ...</div>
    <div class="actions">
      <button class="btn" id="noteDone" disabled>Seal the note</button>
    </div>
  `;

  document.querySelectorAll(".word-chip").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("leaf")) return;
      if (state.loveNote.length >= 4) return;
      button.classList.remove("secondary");
      button.classList.add("leaf");
      state.loveNote.push(button.textContent);
      document.getElementById("notePreview").textContent = `Dear wife, you are ${state.loveNote.join(", ")}. Also, please accept this browser as a romantic envelope.`;
      document.getElementById("noteDone").disabled = state.loveNote.length < 4;
    });
  });

  document.getElementById("noteDone").addEventListener("click", () => {
    state.journeyTasks.note = true;
    burst(55);
    renderJourney("pledge");
  });
}

function renderPledgeStage() {
  const body = document.getElementById("journeyBody");
  body.innerHTML = `
    <div class="pledge-card">
      <p>I promise more little dates, more silly jokes, more patient listening, more surprise plans, and more love than my dramatic buttons can express.</p>
      <label class="pledge-check">
        <input type="checkbox" id="pledgeCheck">
        <span>I accept this legally questionable but emotionally binding birthday promise.</span>
      </label>
    </div>
  `;

  document.getElementById("pledgeCheck").addEventListener("change", (event) => {
    state.journeyTasks.pledge = event.target.checked;
    if (event.target.checked) {
      burst(60);
      popNote("Promise accepted", event.target);
    }
    updateJourneyUnlock();
  });
}

function updateJourneyUnlock() {
  const elapsed = Math.floor((Date.now() - state.journeyStart) / 1000);
  const remaining = Math.max(0, MIN_JOURNEY_SECONDS - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  const doneCount = Object.values(state.journeyTasks).filter(Boolean).length;
  const timeDone = remaining === 0;
  const allDone = doneCount === 4;
  const progress = Math.min(100, Math.round(((doneCount / 4) * 55) + ((MIN_JOURNEY_SECONDS - remaining) / MIN_JOURNEY_SECONDS) * 45));
  const timer = document.getElementById("journeyTime");
  const fill = document.getElementById("journeyProgress");
  const button = document.getElementById("cakeUnlockBtn");
  if (!timer || !fill || !button) return;
  timer.textContent = `${minutes}:${seconds}`;
  fill.style.width = `${progress}%`;
  button.disabled = !(timeDone && allDone);
  button.textContent = allDone
    ? timeDone ? "Cake permission granted" : `Cake unlocks in ${minutes}:${seconds}`
    : `Complete missions (${doneCount}/4)`;
}

function renderFinale() {
  const [place, activity, power, mood] = state.answers;
  app.innerHTML = `
    <section class="stage">
      <div class="panel result">
        <p class="eyebrow">Happy Birthday</p>
        <h2>To my beautiful wife</h2>
        <p>You chose ${place.toLowerCase()}, ${activity.toLowerCase()}, ${power.toLowerCase()}, and ${mood.toLowerCase()}. I choose you, again and again, even when you try to click suspicious buttons.</p>
        <p>Happy birthday, my love. May your day be full of flowers, cake, laughter, and the kind of happiness that follows you around like I do.</p>
        <div class="flower-field" id="flowers" aria-label="Animated flowers"></div>
        <div class="cake" id="cake" aria-label="Virtual birthday cake">
          <span class="candle" style="left:42%"></span>
          <span class="candle" style="left:50%"></span>
          <span class="candle" style="left:58%"></span>
          <span class="cake-slice"></span>
          <span class="cake-top"></span>
          <span class="cake-mid"></span>
          <span class="cake-base"></span>
          <span class="slice-line"></span>
        </div>
        <p class="cake-caption" id="cakeCaption">Cake protocol: make a wish, then cut. Very official.</p>
        <div class="cake-actions">
          <button class="btn" id="cutCake">Cut the cake</button>
          <button class="btn secondary" id="againBtn">Replay quiz</button>
        </div>
      </div>
    </section>
  `;
  makeFlowers();
  burst(130);
  let cakeStep = 0;
  const cake = document.getElementById("cake");
  const cakeButton = document.getElementById("cutCake");
  const cakeCaption = document.getElementById("cakeCaption");
  const cakeLines = [
    "Wish captured. I am pretending I did not hear it.",
    "Knife deployed. Cake has accepted its delicious fate.",
    "Virtual slice served. Real cake still strongly recommended."
  ];
  document.getElementById("cutCake").addEventListener("click", () => {
    cakeStep += 1;
    if (cakeStep === 1) {
      cake.classList.add("wish");
      cakeButton.textContent = "Now cut it";
      cakeCaption.textContent = cakeLines[0];
      popNote("Wish approved", cakeButton);
      burst(70);
      return;
    }
    if (cakeStep === 2) {
      cake.classList.add("cut", "wiggle");
      cakeButton.textContent = "Serve me a slice";
      cakeCaption.textContent = cakeLines[1];
      burst(180);
      window.setTimeout(() => cake.classList.remove("wiggle"), 800);
      return;
    }
    cake.classList.add("served");
    cakeButton.textContent = "Cake mission complete";
    cakeButton.disabled = true;
    cakeCaption.textContent = cakeLines[2];
    popNote("Save one bite for me", cakeButton);
    burst(110);
  });
  document.getElementById("againBtn").addEventListener("click", () => {
    state.answers = [];
    state.meter = 12;
    renderIntro();
  });
}

function moveButton(button) {
  const x = Math.random() * 70 - 35;
  const y = Math.random() * 70 - 35;
  button.style.transform = `translate(${x}vw, ${y}vh) rotate(${Math.random() * 18 - 9}deg)`;
}

function moveInside(button, container) {
  const rect = container.getBoundingClientRect();
  const maxX = Math.max(12, rect.width - button.offsetWidth - 16);
  const maxY = Math.max(12, rect.height - button.offsetHeight - 16);
  button.style.left = `${16 + Math.random() * maxX}px`;
  button.style.top = `${16 + Math.random() * maxY}px`;
}

function popNote(text, target) {
  const note = document.createElement("div");
  const rect = target.getBoundingClientRect();
  note.className = "floating-note";
  note.textContent = text;
  note.style.left = `${rect.left}px`;
  note.style.top = `${rect.top - 8}px`;
  document.body.appendChild(note);
  window.setTimeout(() => note.remove(), 1300);
}

function makeFlowers() {
  const colors = ["#e94f76", "#ff9a76", "#ffd166", "#9ad6b5", "#d565a4"];
  const field = document.getElementById("flowers");
  field.innerHTML = "";
  for (let i = 0; i < 18; i += 1) {
    const flower = document.createElement("span");
    flower.className = "flower";
    flower.style.setProperty("--h", `${20 + Math.floor(Math.random() * 76)}px`);
    flower.style.setProperty("--c", colors[i % colors.length]);
    flower.style.animationDelay = `${i * 45}ms`;
    field.appendChild(flower);
  }
}

function burst(count = 90) {
  resizeConfetti();
  const colors = ["#cc3f67", "#ef715d", "#ffd166", "#2f8b71", "#ffffff"];
  for (let i = 0; i < count; i += 1) {
    state.confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: -20,
      vx: Math.random() * 6 - 3,
      vy: 3 + Math.random() * 6,
      size: 5 + Math.random() * 8,
      spin: Math.random() * 0.2,
      angle: Math.random() * Math.PI,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function resizeConfetti() {
  confettiCanvas.width = window.innerWidth * window.devicePixelRatio;
  confettiCanvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  state.confetti = state.confetti.filter((piece) => piece.y < window.innerHeight + 30);
  state.confetti.forEach((piece) => {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.angle += piece.spin;
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.angle);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
    ctx.restore();
  });
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeConfetti);
resizeConfetti();
animate();
render();
