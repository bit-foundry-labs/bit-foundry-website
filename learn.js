"use strict";

document.querySelectorAll("#year, [data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const compileCopy = {
  source: ["STEP 1 · INPUT", "The source program", "FORTRAN source code is human-readable. The compiler translates it into instructions the computer can execute."],
  compiler: ["STEP 2 · TRANSLATION", "Computer + compiler", "The compiler checks the source code and translates it into machine instructions."],
  object: ["STEP 3 · RESULT", "The object program", "The object program contains instructions the computer can execute."],
  storage: ["STEP 4 · OUTPUT", "Save or inspect the result", "Store the object program in memory, on cards or disk, or print it for inspection."]
};

function showCompileNode(key) {
  const lesson = document.querySelector('[data-lesson="compiler"]');
  if (!lesson || !compileCopy[key]) return;
  lesson.querySelectorAll("[data-compile-node]").forEach((node) => node.classList.toggle("is-active", node.dataset.compileNode === key));
  const [kicker, title, copy] = compileCopy[key];
  lesson.querySelector("[data-compile-kicker]").textContent = kicker;
  lesson.querySelector("[data-compile-title]").textContent = title;
  lesson.querySelector("[data-compile-copy]").textContent = copy;
}

const compilerLesson = document.querySelector('[data-lesson="compiler"]');
if (compilerLesson) {
  let compileTimer = null;
  compilerLesson.querySelectorAll("[data-compile-node]").forEach((node) => {
    node.addEventListener("click", () => showCompileNode(node.dataset.compileNode));
  });
  compilerLesson.querySelectorAll(".output-filter").forEach((button) => {
    button.addEventListener("click", () => {
      compilerLesson.querySelectorAll(".output-filter").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      const filter = button.dataset.filter;
      compilerLesson.querySelectorAll(".output-option").forEach((item) => item.classList.toggle("is-dim", filter !== "all" && item.dataset.kind !== filter));
      showCompileNode(filter === "all" ? "storage" : "storage");
    });
  });
  compilerLesson.querySelector('[data-action="run-compile"]').addEventListener("click", () => {
    if (compileTimer) window.clearInterval(compileTimer);
    const keys = ["source", "compiler", "object", "storage"];
    let index = 0;
    const runButton = compilerLesson.querySelector('[data-action="run-compile"]');
    runButton.textContent = "RUNNING…";
    compilerLesson.querySelector(".compile-diagram").classList.add("diagram-flowing");
    showCompileNode(keys[index]);
    compileTimer = window.setInterval(() => {
      index += 1;
      if (index >= keys.length) {
        window.clearInterval(compileTimer);
        compileTimer = null;
        runButton.textContent = "▶ RUN THE COMPILE";
        compilerLesson.querySelector(".compile-diagram").classList.remove("diagram-flowing");
        return;
      }
      showCompileNode(keys[index]);
    }, 900);
  });
  compilerLesson.querySelectorAll("[data-compile-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = button.dataset.compileAnswer === "object";
      const feedback = compilerLesson.querySelector("[data-compile-feedback]");
      feedback.textContent = correct ? "✓ Correct. The compiler produces an object program." : "Not quite. Follow the arrow leaving the compiler.";
      feedback.style.color = correct ? "var(--forest)" : "var(--orange)";
    });
  });
}

const fibLesson = document.querySelector('[data-lesson="fibonacci"]');
if (fibLesson) {
  const fibDetails = {
    start: ["START · BEGIN", "The sequence begins", "The flowchart starts by preparing two values. Each pass uses the current pair to calculate the next Fibonacci term."],
    initialize: ["STEP 1 · INITIALIZE", "Set the starting pair", "NEXT begins at 0 and LATEST begins at 1. These are the two values the loop adds together."],
    sum: ["STEP 2 · ADD", "Make the next term", "SUM is NEXT plus LATEST. On the first pass, 0 + 1 gives 1."],
    test: ["STEP 3 · DECIDE", "Check the stopping condition", "If SUM is greater than 1,000, print it and stop. Otherwise take the false branch and update the pair."],
    update: ["STEP 4 · SHIFT", "Move the pair forward", "NEXT takes the old LATEST, and LATEST takes SUM. The loop then returns to the addition."],
    print: ["STEP 5 · FINISH", "Print the first value over 1,000", "The loop stops at 1,597. The previous Fibonacci term is 987, so 1,597 is the first term that crosses the threshold."]
  };
  const fib = { next: 0, latest: 1, sum: null, count: 0, phase: "initialize", done: false, timer: null, trace: [] };
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
    const body = fibLesson.querySelector("[data-fib-trace]");
    body.replaceChildren();
    if (fib.trace.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 3;
      cell.textContent = "Run the loop to build the trace.";
      row.append(cell);
      body.append(row);
      return;
    }
    fib.trace.forEach((entry) => {
      const row = document.createElement("tr");
      [entry.pass, `${entry.next} + ${entry.latest}`, entry.sum].forEach((item) => {
        const cell = document.createElement("td");
        cell.textContent = String(item);
        row.append(cell);
      });
      body.append(row);
    });
  }

  function stepFib() {
    if (fib.done) return;
    if (fib.phase === "initialize") {
      fib.next = 0; fib.latest = 1; fib.sum = null; fib.count = 0; fib.trace = [];
      fib.phase = "sum";
      renderFib("Starting pair set. Follow the arrow to the addition.");
    } else if (fib.phase === "sum") {
      fib.sum = fib.next + fib.latest;
      fib.count += 1;
      fib.trace.push({ pass: fib.count, next: fib.next, latest: fib.latest, sum: fib.sum });
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
    }, 520);
  });
  fibLesson.querySelector('[data-action="fib-reset"]').addEventListener("click", () => {
    stopFib();
    Object.assign(fib, { next: 0, latest: 1, sum: null, count: 0, phase: "initialize", done: false, trace: [] });
    fibLesson.querySelector('[data-action="fib-run"]').textContent = "▶ RUN LOOP";
    fibLesson.querySelector("[data-fib-feedback]").textContent = "";
    renderFib("Ready at the starting values.");
  });
  fibLesson.querySelectorAll("[data-fib-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = button.dataset.fibAnswer === "1597";
      const feedback = fibLesson.querySelector("[data-fib-feedback]");
      feedback.textContent = correct ? "✓ Correct. 987 is below the threshold; the next term is 1,597." : "Not quite. 987 is still below 1,000; follow the loop once more.";
      feedback.style.color = correct ? "var(--forest)" : "var(--orange)";
    });
  });
  fibLesson.querySelectorAll("[data-fib-node]").forEach((node) => {
    node.addEventListener("click", () => {
      if (fib.timer) stopFib();
      const key = node.dataset.fibNode;
      fibLesson.querySelectorAll("[data-fib-node]").forEach((item) => item.classList.toggle("is-active", item === node));
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
