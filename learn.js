"use strict";

document.querySelectorAll("#year, [data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const compilerLesson = document.querySelector('[data-lesson="compiler"]');
if (compilerLesson) {
  const buildCopy = {
    source: ["READY · SOURCE FILE", "Start with code people can read", "A FORTRAN source file is not something a computer runs directly. First compile it into an object file, then link it with the FORTRAN runtime to create an executable."],
    compile: ["STEP 1 · COMPILE", "Translate and check the source", "The compiler reads hello.f, checks its FORTRAN syntax, and produces hello.o: machine instructions for this program."],
    object: ["COMPILED · NOT RUNNABLE YET", "An object file is only a piece", "hello.o contains compiled instructions, but PRINT still depends on routines supplied by the FORTRAN runtime. The linker joins those pieces."],
    link: ["STEP 2 · LINK", "Make a complete executable", "The linker resolves references to the FORTRAN runtime and packages the pieces into a runnable program."],
    run: ["STEP 3 · RUN", "Execute the finished program", "Now the operating system can load the executable. The program reaches its PRINT statement and writes its result." ]
  };
  const state = { compiled: false, linked: false, ran: false, selected: "source" };
  const showStage = (key) => {
    if (!buildCopy[key]) return;
    state.selected = key;
    compilerLesson.querySelectorAll("[data-compile-stage]").forEach((node) => node.classList.toggle("is-active", node.dataset.compileStage === key));
    const [kicker, title, copy] = buildCopy[key];
    compilerLesson.querySelector("[data-compile-kicker]").textContent = kicker;
    compilerLesson.querySelector("[data-compile-title]").textContent = title;
    compilerLesson.querySelector("[data-compile-copy]").textContent = copy;
  };
  const renderBuild = (status) => {
    compilerLesson.querySelector('[data-action="compile"]').disabled = state.compiled;
    compilerLesson.querySelector('[data-action="link"]').disabled = !state.compiled || state.linked;
    compilerLesson.querySelector('[data-action="run"]').disabled = !state.linked || state.ran;
    compilerLesson.querySelector('[data-compile-status]').textContent = status;
    compilerLesson.querySelector('[data-compile-output]').textContent = state.ran ? "output: HELLO" : state.linked ? "ready to run" : "waiting to run";
    compilerLesson.querySelectorAll("[data-compile-stage]").forEach((node) => {
      const key = node.dataset.compileStage;
      node.classList.toggle("is-complete", (key === "compile" || key === "object") && state.compiled || key === "link" && state.linked || key === "run" && state.ran);
    });
  };
  compilerLesson.querySelectorAll("[data-compile-stage]").forEach((node) => node.addEventListener("click", () => showStage(node.dataset.compileStage)));
  compilerLesson.querySelector('[data-action="compile"]').addEventListener("click", () => {
    state.compiled = true;
    showStage("object");
    renderBuild("Compiled hello.f → hello.o. Link it to add the FORTRAN runtime.");
  });
  compilerLesson.querySelector('[data-action="link"]').addEventListener("click", () => {
    state.linked = true;
    showStage("link");
    renderBuild("Linked hello.o + runtime → hello. The executable is ready.");
  });
  compilerLesson.querySelector('[data-action="run"]').addEventListener("click", () => {
    state.ran = true;
    showStage("run");
    renderBuild("Ran ./hello. The program printed HELLO.");
  });
  compilerLesson.querySelector('[data-action="reset-build"]').addEventListener("click", () => {
    state.compiled = false;
    state.linked = false;
    state.ran = false;
    showStage("source");
    renderBuild("Choose Compile to begin the build.");
  });
  renderBuild("Choose Compile to begin the build.");
}

const fibLesson = document.querySelector('[data-lesson="fibonacci"]');
if (fibLesson) {
  const fibDetails = {
    start: ["START · BEGIN", "The sequence begins", "The program starts by preparing two values on the coding sheet. Each pass uses the current pair to calculate the next Fibonacci term."],
    initialize: ["STEP 1 · INITIALIZE", "Set the starting pair", "NEXT begins at 0 and LATEST begins at 1. These are the two values the loop adds together."],
    sum: ["STEP 2 · ADD", "Make the next term", "SUM is NEXT plus LATEST. On the first pass, 0 + 1 gives 1."],
    test: ["STEP 3 · DECIDE", "Check the stopping condition", "If SUM is greater than 1,000, print it and stop. Otherwise take the false branch and update the pair."],
    update: ["STEP 4 · SHIFT", "Move the pair forward", "NEXT takes the old LATEST, and LATEST takes SUM. The loop then returns to the addition."],
    print: ["STEP 5 · FINISH", "Print the first value over 1,000", "The loop stops at 1,597. The previous Fibonacci term is 987, so 1,597 is the first term that crosses the threshold."]
  };
  const fib = { next: 0, latest: 1, sum: null, count: 0, phase: "initialize", done: false, timer: null };
  const value = (selector, content) => { fibLesson.querySelector(selector).textContent = content; };

  function renderFib(message) {
    fibLesson.querySelectorAll("[data-fib-node]").forEach((node) => node.classList.toggle("is-active", node.dataset.fibNode === fib.phase));
    const detail = fibDetails[fib.phase];
    value("[data-fib-kicker]", detail[0]);
    value("[data-fib-title]", detail[1]);
    value("[data-fib-copy]", detail[2]);
    value("[data-fib-next]", String(fib.next));
    value("[data-fib-latest]", String(fib.latest));
    value("[data-fib-sum]", fib.sum === null ? "—" : String(fib.sum));
    value("[data-fib-count]", String(fib.count));
    value("[data-fib-status]", message);
    const equation = fibLesson.querySelector("[data-fib-equation]");
    equation.textContent = fib.sum === null ? "Each pass adds the current pair" : `${fib.next} + ${fib.latest} = ${fib.sum}`;
  }

  function stepFib() {
    if (fib.done) return;
    if (fib.phase === "initialize") {
      fib.next = 0; fib.latest = 1; fib.sum = null; fib.count = 0;
      fib.phase = "sum";
      renderFib("Starting pair set. Follow the arrow to the addition.");
    } else if (fib.phase === "sum") {
      fib.sum = fib.next + fib.latest;
      fib.count += 1;
      fib.phase = "test";
      renderFib(`Pass ${fib.count}: ${fib.next} + ${fib.latest} = ${fib.sum}. Check the condition.`);
    } else if (fib.phase === "test") {
      if (fib.sum > 1000) {
        fib.phase = "print"; fib.done = true;
        renderFib(`${fib.sum} is greater than 1,000. Follow TRUE to print and stop.`);
      } else {
        fib.phase = "update";
        renderFib(`${fib.sum} is not greater than 1,000. Follow FALSE to update the pair.`);
      }
    } else if (fib.phase === "update") {
      fib.next = fib.latest;
      fib.latest = fib.sum;
      fib.phase = "sum";
      renderFib(`Pair updated to ${fib.next} and ${fib.latest}. Return to the addition.`);
    }
  }

  function stopFib() {
    if (!fib.timer) return;
    window.clearInterval(fib.timer);
    fib.timer = null;
    const button = fibLesson.querySelector('[data-action="fib-run"]');
    button.textContent = "▶ RUN LOOP";
    button.setAttribute("aria-pressed", "false");
  }

  fibLesson.querySelector('[data-action="fib-step"]').addEventListener("click", stepFib);
  fibLesson.querySelector('[data-action="fib-run"]').addEventListener("click", (event) => {
    if (fib.timer) { stopFib(); return; }
    if (fib.done) return;
    const button = event.currentTarget;
    button.textContent = "Ⅱ PAUSE";
    button.setAttribute("aria-pressed", "true");
    fib.timer = window.setInterval(() => {
      stepFib();
      if (fib.done) stopFib();
    }, 1100);
  });
  fibLesson.querySelector('[data-action="fib-reset"]').addEventListener("click", () => {
    stopFib();
    Object.assign(fib, { next: 0, latest: 1, sum: null, count: 0, phase: "initialize", done: false });
    fibLesson.querySelector('[data-action="fib-run"]').textContent = "▶ RUN LOOP";
    renderFib("Ready at the starting values.");
  });
  fibLesson.querySelectorAll("[data-fib-node]").forEach((node) => {
    node.addEventListener("click", () => {
      if (fib.timer) stopFib();
      const key = node.dataset.fibNode;
      fibLesson.querySelectorAll("[data-fib-node]").forEach((item) => item.classList.toggle("is-active", item.dataset.fibNode === key));
      const detail = fibDetails[key];
      value("[data-fib-kicker]", detail[0]);
      value("[data-fib-title]", detail[1]);
      value("[data-fib-copy]", detail[2]);
      value("[data-fib-status]", `Inspecting ${key}. Step once to continue the program.`);
    });
  });
  renderFib("Ready at the starting values.");
}

const networkLesson = document.querySelector('[data-lesson="network"]');
if (networkLesson) {
  const networkStages = [
    ["STAGE 01 · REQUEST", "You ask for a page", "Your browser needs the server’s IP address before it can send a request."],
    ["STAGE 02 · DNS", "Find the server’s address", "DNS looks up the domain name and returns its IP address."],
    ["STAGE 03 · TCP", "Open a connection", "TCP provides reliable delivery between your browser and the server."],
    ["STAGE 04 · TLS", "Encrypt the connection", "For HTTPS, TLS authenticates the server and encrypts data in transit."],
    ["STAGE 05 · HTTP", "Send the request", "Your browser sends an HTTP request for the page."],
    ["STAGE 06 · RESPONSE", "Receive the response", "The server returns the requested resource. Your browser reads it and requests any other files it needs."]
  ];
  let stage = 0;
  const stageElements = [...networkLesson.querySelectorAll("[data-network-stage]")];
  function renderNetwork() {
    stageElements.forEach((item, index) => {
      item.classList.toggle("is-active", index === stage);
      item.classList.toggle("is-done", index < stage);
    });
    const [kicker, title, copy] = networkStages[stage];
    networkLesson.querySelector("[data-network-kicker]").textContent = kicker;
    networkLesson.querySelector("[data-network-title]").textContent = title;
    networkLesson.querySelector("[data-network-copy]").textContent = copy;
    networkLesson.querySelector('[data-action="network-back"]').disabled = stage === 0;
    networkLesson.querySelector('[data-action="network-next"]').textContent = stage === networkStages.length - 1 ? "Start again ↺" : "Next stage →";
    networkLesson.querySelector('[data-action="network-next"]').setAttribute("aria-pressed", "false");
  }
  networkLesson.querySelector('[data-action="network-next"]').addEventListener("click", () => {
    stage = stage === networkStages.length - 1 ? 0 : stage + 1;
    renderNetwork();
  });
  networkLesson.querySelector('[data-action="network-back"]').addEventListener("click", () => { stage = Math.max(0, stage - 1); renderNetwork(); });
  networkLesson.querySelector('[data-action="network-reset"]').addEventListener("click", () => { stage = 0; renderNetwork(); networkLesson.querySelector("[data-network-feedback]").textContent = ""; });
  stageElements.forEach((item) => item.addEventListener("click", () => { stage = Number(item.dataset.networkStage); renderNetwork(); }));
  networkLesson.querySelectorAll("[data-network-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = button.dataset.networkAnswer === "DNS";
      const feedback = networkLesson.querySelector("[data-network-feedback]");
      feedback.textContent = correct ? "✓ Correct. DNS resolves the domain to an IP address." : "Not quite. DNS resolves domain names to IP addresses.";
      feedback.style.color = correct ? "var(--forest)" : "var(--orange)";
    });
  });
  renderNetwork();
}
