(() => {
      const input = document.getElementById("destination-ip");
      if (!input) return;
      const routes = [
        {id:"default", network:"0.0.0.0", prefix:0, link:"Link 4"},
        {id:"24", network:"203.0.113.0", prefix:24, link:"Link 1"},
        {id:"25", network:"203.0.113.128", prefix:25, link:"Link 2"},
        {id:"28", network:"203.0.113.144", prefix:28, link:"Link 3"}
      ];
      const toInt = address => address.split(".").reduce((value, octet) => (value * 256 + Number(octet)) >>> 0, 0);
      const parse = address => {
        const parts = address.trim().split(".");
        if (parts.length !== 4 || parts.some(part => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return null;
        return toInt(address.trim());
      };
      const mask = prefix => prefix === 0 ? 0 : (0xffffffff << (32-prefix)) >>> 0;
      function updateForwarding() {
        const destination = parse(input.value);
        const title = document.getElementById("forward-result-title");
        const copy = document.getElementById("forward-result-copy");
        const output = document.getElementById("path-output");
        const lookup = document.getElementById("path-lookup");
        document.querySelectorAll("[data-route]").forEach(row => row.classList.remove("is-match","is-selected"));
        if (destination === null) {
          title.textContent = "Enter a valid IPv4 address";
          copy.textContent = "Use four numbers from 0 to 255, separated by periods.";
          output.textContent = "NO OUTPUT";
          lookup.textContent = "NO MATCH";
          return;
        }
        const matching = routes.filter(route => ((destination & mask(route.prefix)) >>> 0) === ((toInt(route.network) & mask(route.prefix)) >>> 0));
        const selected = matching.reduce((best, route) => route.prefix > best.prefix ? route : best, routes[0]);
        matching.forEach(route => document.querySelector('[data-route="'+route.id+'"]').classList.add("is-match"));
        document.querySelector('[data-route="'+selected.id+'"]').classList.add("is-selected");
        title.textContent = "Forward to " + selected.link;
        lookup.textContent = "PREFIX /" + selected.prefix;
        output.textContent = selected.link.toUpperCase();
        copy.textContent = matching.length + " route" + (matching.length === 1 ? "" : "s") + " match. The router chooses /" + selected.prefix + ", the longest matching prefix.";
      }
      input.addEventListener("input", updateForwarding);
      updateForwarding();
    })();

(() => {
      const mode = document.getElementById("transport-mode");
      const lost = document.getElementById("transport-loss");
      const log = document.getElementById("transport-log");
      const stepButton = document.getElementById("transport-step");
      const runButton = document.getElementById("transport-run");
      const resetButton = document.getElementById("transport-reset");
      const status = document.getElementById("transport-status");
      const label = document.getElementById("transport-protocol-label");
      const explanation = document.getElementById("transport-explanation");
      let events = [];
      let position = 0;
      let timer = null;
      const copy = {
        gbn: "Go-Back-N discards packets received beyond a gap. A timeout makes the sender repeat every unacknowledged packet in its window.",
        sr: "Selective Repeat buffers packets beyond a gap and acknowledges them individually. A timeout retransmits only the missing packet."
      };
      function makeEvents(protocol, lostSequence) {
        const list = [];
        for (let i=0; i<4; i++) list.push({kind:"sender", text:"Sender sends packet " + i + "."});
        for (let i=0; i<4; i++) {
          if (i === lostSequence) {
            list.push({kind:"loss", text:"Packet " + i + " is lost in the network."});
          } else if (i < lostSequence) {
            list.push({kind:"receiver", text:"Receiver accepts packet " + i + " in order."});
            list.push({kind:"ack", text:"Receiver sends ACK " + i + "."});
          } else if (protocol === "gbn") {
            list.push({kind:"receiver", text:"Receiver discards out-of-order packet " + i + "; it is waiting for packet " + lostSequence + "."});
            list.push({kind:"ack", text:"Receiver repeats cumulative ACK " + (lostSequence - 1) + "."});
          } else {
            list.push({kind:"receiver", text:"Receiver buffers out-of-order packet " + i + "."});
            list.push({kind:"ack", text:"Receiver sends individual ACK " + i + "."});
          }
        }
        list.push({kind:"loss", text:"Timer for packet " + lostSequence + " expires."});
        const start = lostSequence;
        const end = protocol === "gbn" ? 4 : lostSequence + 1;
        for (let i=start; i<end; i++) list.push({kind:"sender", text:"Sender retransmits packet " + i + (protocol === "gbn" ? " (window recovery)." : ".")});
        if (protocol === "gbn") {
          for (let i=lostSequence; i<4; i++) {
            list.push({kind:"receiver", text:"Receiver accepts packet " + i + " in order."});
            list.push({kind:"ack", text:"Receiver sends cumulative ACK " + i + "."});
          }
        } else {
          list.push({kind:"receiver", text:"Receiver accepts packet " + lostSequence + " and releases buffered packets " + Array.from({length:3-lostSequence},(_,j)=>lostSequence+j+1).join(", ") + " in order."});
          list.push({kind:"ack", text:"Receiver sends ACK " + lostSequence + "; earlier ACKs already cover the buffered packets."});
        }
        list.push({kind:"done", text:"All four packets have been delivered in order."});
        return list;
      }
      function stop() {
        if (timer) window.clearInterval(timer);
        timer = null;
        runButton.textContent = position >= events.length ? "Run slowly" : "Run slowly";
      }
      function advance() {
        if (position >= events.length) { stop(); return; }
        const event = events[position++];
        const item = document.createElement("li");
        item.dataset.kind = event.kind;
        item.textContent = event.text;
        log.appendChild(item);
        log.scrollTop = log.scrollHeight;
        if (event.kind === "done") {
          status.textContent = "Complete · 4 packets delivered in order";
          stepButton.disabled = true;
          stop();
        } else {
          status.textContent = "Event " + position + " of " + events.length;
        }
      }
      function reset() {
        stop();
        position = 0;
        events = makeEvents(mode.value, Number(lost.value));
        log.replaceChildren();
        label.textContent = (mode.value === "gbn" ? "GO-BACK-N" : "SELECTIVE REPEAT") + " · WINDOW 4";
        explanation.textContent = copy[mode.value];
        status.textContent = "Ready · 4 packets in the send window";
        stepButton.disabled = false;
      }
      stepButton.addEventListener("click", advance);
      runButton.addEventListener("click", () => {
        if (timer) { stop(); status.textContent += " · Paused"; return; }
        if (position >= events.length) reset();
        runButton.textContent = "Pause";
        timer = window.setInterval(advance, 900);
        advance();
      });
      resetButton.addEventListener("click", reset);
      mode.addEventListener("change", reset);
      lost.addEventListener("change", reset);
      reset();
    })();

(() => {
      const rtt = document.getElementById("http-rtt");
      const objects = document.getElementById("http-objects");
      const rounds = {
        nonpersistent: n => 2 * (n + 1),
        persistent: n => 2 + n,
        pipelined: n => 2 + (n > 0 ? 1 : 0)
      };
      const descriptions = {
        nonpersistent: "Each object opens its own TCP connection, then needs a request/response round trip.",
        persistent: "One TCP connection is reused; each object still needs its own request/response round trip.",
        pipelined: "One TCP connection is reused, and the browser sends the object requests together."
      };
      function updateHttp() {
        const rttMs = Number(rtt.value);
        const n = Number(objects.value);
        const selected = document.querySelector('input[name="http-mode"]:checked').value;
        const vals = Object.fromEntries(Object.keys(rounds).map(mode => [mode, rounds[mode](n)]));
        const max = Math.max(...Object.values(vals),1);
        document.getElementById("http-rtt-value").textContent = rttMs + " ms";
        document.getElementById("http-objects-value").textContent = n + (n === 1 ? " object" : " objects");
        Object.keys(vals).forEach(mode => {
          const time = vals[mode] * rttMs;
          document.getElementById("http-"+mode).textContent = vals[mode] + (vals[mode] === 1 ? " RTT" : " RTTs") + " · " + time + " ms";
          document.getElementById("http-bar-"+mode).style.width = (vals[mode] / max * 100) + "%";
          document.querySelector('[data-http-row="'+mode+'"]').classList.toggle("is-selected", mode === selected);
        });
        document.getElementById("http-explanation").textContent = descriptions[selected] + " The page load is estimated at " + vals[selected] + " RTTs, or " + vals[selected] * rttMs + " ms.";
      }
      rtt.addEventListener("input", updateHttp);
      objects.addEventListener("input", updateHttp);
      document.querySelectorAll('input[name="http-mode"]').forEach(input => input.addEventListener("change", updateHttp));
      updateHttp();
    })();

(() => {
      const ids = ["packet-size", "link-rate", "distance", "links", "queue"];
      const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
      const fmt = value => value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : value.toFixed(0);
      function updateDelay() {
        const bytes = Number(els["packet-size"].value);
        const rateMbps = Number(els["link-rate"].value);
        const distanceKm = Number(els.distance.value);
        const links = Number(els.links.value);
        const queuePerRouterMs = Number(els.queue.value);
        const transmission = (bytes * 8 / (rateMbps * 1e6)) * 1000 * links;
        const propagation = (distanceKm * links / 200000) * 1000;
        const queueing = queuePerRouterMs * Math.max(0, links - 1);
        const total = transmission + propagation + queueing;
        document.getElementById("packet-size-value").textContent = bytes + " bytes";
        document.getElementById("link-rate-value").textContent = rateMbps + " Mbps";
        document.getElementById("distance-value").textContent = distanceKm + " km";
        document.getElementById("links-value").textContent = links;
        document.getElementById("queue-value").textContent = queuePerRouterMs + " ms";
        document.getElementById("delay-total").textContent = fmt(total);
        document.getElementById("transmission-value").textContent = fmt(transmission) + " ms";
        document.getElementById("propagation-value").textContent = fmt(propagation) + " ms";
        document.getElementById("queue-total-value").textContent = fmt(queueing) + " ms";
        document.getElementById("bar-transmission").style.width = (total ? transmission / total * 100 : 0) + "%";
        document.getElementById("bar-propagation").style.width = (total ? propagation / total * 100 : 0) + "%";
        document.getElementById("bar-queue").style.width = (total ? queueing / total * 100 : 0) + "%";
        document.getElementById("delay-bar").setAttribute("aria-label", "Transmission " + fmt(transmission) + " milliseconds, propagation " + fmt(propagation) + " milliseconds, queueing " + fmt(queueing) + " milliseconds");
        let note = "Transmission is packet bits divided by link rate; propagation is distance divided by signal speed.";
        if (bytes >= 1000 && rateMbps <= 20) note = "Here, transmission dominates: a larger packet takes longer to push onto each link.";
        else if (distanceKm >= 2500) note = "Here, propagation dominates: the signal must travel a long distance, even on a fast link.";
        else if (queueing > transmission + propagation) note = "Here, queueing dominates: waiting behind other traffic adds more delay than sending or travel.";
        document.getElementById("delay-explain").textContent = note;
      }
      ids.forEach(id => els[id].addEventListener("input", updateDelay));
      updateDelay();
    })();

(() => {
      function expandTargetModule() {
        const id = decodeURIComponent(location.hash.slice(1));
        const target = id && document.getElementById(id);
        const details = target && target.querySelector(".module-deep-dive");
        if (details) details.open = true;
      }
      window.addEventListener("hashchange", expandTargetModule);
      expandTargetModule();
    })();

(()=> {
 const stack=document.querySelector(".osi-stack"),section=document.querySelector(".osi-overview");if(!stack||!section)return;
 const layers={
  7:{name:"Application",title:"What does the application say?",body:"Protocols such as HTTP define the request and response that your software understands. DNS and SMTP also live in this application-layer model, though they serve different jobs.",dev:"When an API call fails, inspect the HTTP method, path, headers, status code, and response body before blaming lower layers.",pdu:"Application data"},
  6:{name:"Presentation",title:"Can both sides interpret the same data?",body:"This conceptual layer represents data format, character encoding, serialization, compression, and cryptographic representation.",dev:"A JSON schema mismatch or character-encoding bug can corrupt meaning even when packets arrive correctly. TLS commonly sits across traditional layer boundaries, so treat this as a debugging lens rather than a strict protocol assignment.",pdu:"Application data"},
  5:{name:"Session",title:"How does an exchange stay coordinated?",body:"The session concept covers starting, maintaining, and ending a conversation between applications, including dialog control and recovery points.",dev:"Distributed APIs often implement session state in application protocols, tokens, or RPC frameworks instead of a distinct OSI session protocol. Check where state actually lives.",pdu:"Application data"},
  4:{name:"Transport",title:"Which process receives the data?",body:"Transport provides process-to-process communication. TCP adds ordered reliable delivery and flow/congestion control; UDP provides a lightweight datagram service. Ports identify endpoints.",dev:"If the host is reachable but the service is not, check connection establishment, listening ports, retransmissions, receiver limits, and congestion signals. QUIC combines transport and security functions across the classic model.",pdu:"TCP segment / UDP datagram"},
  3:{name:"Network",title:"How does the packet cross networks?",body:"The network layer provides logical addressing and forwarding across multiple networks. Routers use destination addresses and forwarding tables to choose the next link.",dev:"When only one subnet or route fails, compare routes, address masks, gateways, and ICMP evidence. A valid route does not guarantee that the destination service is healthy.",pdu:"IP packet / datagram"},
  2:{name:"Data link",title:"How does a neighbor receive this frame?",body:"A link-layer protocol moves a frame across one local link, identifies local interfaces, and may detect corruption. Switches forward frames within a LAN.",dev:"If IP routing is correct but the next hop is unreachable, inspect ARP or neighbor discovery, VLAN membership, Wi-Fi association, switch tables, and frame errors.",pdu:"Frame"},
  1:{name:"Physical",title:"Are signals becoming bits?",body:"The physical layer represents bit patterns as electrical, optical, or radio signals and defines the medium, connectors, timing, and signaling rules.",dev:"Link flaps, weak Wi-Fi, interference, bad cabling, or optical power problems can appear as packet loss higher up. Check signal and link counters before changing application retries.",pdu:"Bits / symbols"}
 };
 const title=section.querySelector("[data-osi-detail-title]"),body=section.querySelector("[data-osi-detail-body]"),dev=section.querySelector("[data-osi-detail-dev]"),pdu=section.querySelector("[data-osi-detail-pdu]"),kicker=section.querySelector("[data-osi-detail-kicker]"),status=section.querySelector("[data-osi-trace-status]"),next=section.querySelector("[data-osi-trace-next]"),tracePosition=section.querySelector("[data-osi-trace-position] strong");
 const cards=[...stack.querySelectorAll("[data-osi-layer]")],sequence=[7,6,5,4,3,2,1,2,3,4,5,6,7];let traceIndex=-1;
 function selectLayer(n,phase="Ready"){const item=layers[n],card=cards.find(current=>Number(current.dataset.osiLayer)===n);cards.forEach(card=>{const selected=Number(card.dataset.osiLayer)===n;card.classList.toggle("is-active",selected);card.setAttribute("aria-pressed",String(selected));});const color=getComputedStyle(card).getPropertyValue("--osi-color").trim();if(color)section.style.setProperty("--trace-color",color);tracePosition.textContent=phase+" · Layer "+n+" "+item.name;kicker.textContent="LAYER "+n+" · "+item.name.toUpperCase();title.textContent=item.title;body.textContent=item.body;dev.textContent=item.dev;pdu.textContent=item.pdu;}
 cards.forEach(card=>card.addEventListener("click",()=>{traceIndex=-1;next.disabled=false;selectLayer(Number(card.dataset.osiLayer),"Selected");setNextLabel();status.textContent="Layer "+card.dataset.osiLayer+" selected. Start the trace to follow the request from sender to receiver."; }));
 const messages=["Sender: the application creates an HTTPS request with meaning such as method, path, and headers.","Sender: presentation concerns shape and representation; TLS commonly protects the data across several traditional layer boundaries.","Sender: session behavior coordinates an ongoing exchange; many modern Internet applications implement it above transport.","Sender: transport associates the data with a process and applies its delivery service, such as TCP.","Routers forward the IP packet toward the destination network; each router chooses a next hop.","The local link frames the packet for the next neighbor, such as the Wi-Fi access point.","On the wire: the physical medium carries signals that encode the frame’s bits.","Receiver: the link layer checks the arriving frame and passes its payload upward.","Receiver: the destination host examines the IP packet and accepts it for the local address.","Receiver: transport uses the destination port to deliver data to the right socket.","Receiver: the application framework restores any session or conversation context it uses.","Receiver: security and data-format handling recover the representation the application expects.","Receiver: the application reads the HTTP response or request and acts on its meaning."];
 function setNextLabel(){if(traceIndex<0){next.textContent="Start trace";return;}if(traceIndex>=sequence.length-1){next.textContent="Trace complete";return;}const direction=traceIndex<6?"sender":"receiver";next.textContent="Next: "+direction+" · layer "+sequence[traceIndex+1];}
 next.addEventListener("click",()=>{traceIndex++;if(traceIndex>=sequence.length){traceIndex=sequence.length-1;next.disabled=true;status.textContent="Trace complete: the receiving application can now interpret the message. Reset to follow another request.";setNextLabel();return;}selectLayer(sequence[traceIndex],traceIndex<7?"Sender":"Receiver");status.textContent=messages[traceIndex];setNextLabel();});
 section.querySelector("[data-osi-trace-reset]").addEventListener("click",()=>{traceIndex=-1;next.disabled=false;selectLayer(7,"Ready");status.textContent="Start at the application layer. Select any layer above to inspect its job.";setNextLabel();});
})();

(()=> {
 const root=document.querySelector("[data-incident-case]"); if(!root)return;
 const cases=[
  {title:"The API works by IP address, but not by its domain name",story:"A developer can reach the service using its known IP address. Requests to api.example.test fail before a connection is opened; the browser reports that the name cannot be resolved.",layer:"name",answer:"DNS record or resolver problem",choices:["DNS record or resolver problem","TLS certificate hostname mismatch","A route is missing beyond the gateway","The API returned malformed JSON"],why:"The request fails before TCP or TLS begins, and using the IP bypasses name resolution. Inspect the resolver response and authoritative records first; do not start by changing application code."},
  {title:"The name resolves, but the HTTPS connection times out",story:"DNS returns the expected public IP. A TCP connection to port 443 never completes from one network, while the same service is reachable from another network.",layer:"transport",answer:"A firewall or security group blocks port 443",choices:["A firewall or security group blocks port 443","DNS has no record for this hostname","The API returned HTTP 404","The response body contains invalid JSON"],why:"Name resolution succeeded, but the connection does not reach the HTTP exchange. Compare firewall rules, security-group policy, and route behavior from both networks; a 404 or JSON problem would require an established application request."},
  {title:"The connection is secure, but the API rejects the request",story:"The TCP connection succeeds and the TLS certificate validates for the API hostname. The server returns HTTP 401, and logs show that the request’s access token expired.",layer:"app",answer:"The access token expired",choices:["Congestion on the network path","An MTU problem prevents all packets arriving","The access token expired","The DNS cache is stale"],why:"TCP and TLS completed, and the server produced an HTTP response. The evidence places the failure at the API’s authentication boundary; refresh or renew the token and verify the server’s authorization logs."}
 ];
 let index=0,selected=-1,checked=false;
 const title=root.querySelector("[data-incident-title]"),story=root.querySelector("[data-incident-story]"),choices=root.querySelector("[data-incident-choices]"),step=root.querySelector("[data-incident-step]"),feedback=root.querySelector("[data-incident-feedback]"),check=root.querySelector("[data-incident-check]"),next=root.querySelector("[data-incident-next]"),project=document.querySelector("[data-incident-project]"),submit=document.querySelector("[data-capstone-submit]"),projectFeedback=document.querySelector("[data-capstone-feedback]"),fields=[...document.querySelectorAll("[data-capstone-field]")];
 function render(){const item=cases[index];selected=-1;checked=false;step.textContent="CASE "+(index+1)+" OF "+cases.length;title.textContent=item.title;story.textContent=item.story;feedback.hidden=true;check.hidden=false;check.disabled=true;next.hidden=true;choices.replaceChildren();root.closest(".incident-card").querySelectorAll("[data-incident-layer]").forEach(node=>node.classList.toggle("is-fault",node.dataset.incidentLayer===item.layer));item.choices.forEach((choice,i)=>{const b=document.createElement("button");b.type="button";b.className="incident-choice";b.textContent=choice;b.setAttribute("aria-pressed","false");b.addEventListener("click",()=>{if(checked)return;selected=i;choices.querySelectorAll("button").forEach((button,j)=>button.setAttribute("aria-pressed",String(j===i)));check.disabled=false;});choices.append(b);});}
 check.addEventListener("click",()=>{if(selected<0||checked)return;checked=true;const item=cases[index],correct=item.choices[selected]===item.answer;feedback.textContent=(correct?"Good diagnosis. ":"Re-check the boundary. ")+item.why;feedback.hidden=false;check.hidden=true;if(index<cases.length-1)next.hidden=false;else{feedback.textContent+=" Complete the capstone handoff below to record this project.";project.hidden=false;next.textContent="Restart cases ↻";next.hidden=false;project.scrollIntoView({behavior:"smooth",block:"start"});}});
 next.addEventListener("click",()=>{index=index===cases.length-1?0:index+1;render();});
 const capstoneKey="bitfoundry-networking-capstone-v1",readCapstone=()=>{try{return JSON.parse(localStorage.getItem(capstoneKey)||"{}");}catch{return {}}},saveCapstone=()=>{const value={};fields.forEach(field=>value[field.dataset.capstoneField]=field.value);localStorage.setItem(capstoneKey,JSON.stringify(value));};
 const savedCapstone=readCapstone();fields.forEach(field=>{field.value=savedCapstone[field.dataset.capstoneField]||"";});
 const validateProject=()=>{if(submit)submit.disabled=!fields.every(field=>field.value.trim().length>=20);};fields.forEach(field=>field.addEventListener("input",()=>{saveCapstone();validateProject();}));validateProject();
 submit?.addEventListener("click",()=>{if(submit.disabled)return;const key="bitfoundry-networking-course-v1";let record={lessons:[],labs:[],capstone:false};try{record={...record,...JSON.parse(localStorage.getItem(key)||"{}")};}catch{}record.capstone=true;localStorage.setItem(key,JSON.stringify(record));const value=readCapstone(),journalKey="bitfoundry-networking-journal-v1";let journal={};try{journal=JSON.parse(localStorage.getItem(journalKey)||"{}");}catch{}journal["capstone::incident-handoff"]={lessonId:"capstone",title:"End-to-end debugging capstone",bloom:"CREATE → EVALUATE",tag:"capstone",text:"Symptom: "+value.symptom+"\n\nFirst failing boundary: "+value.boundary+"\n\nEvidence: "+value.evidence+"\n\nNext test: "+value.test,updatedAt:Date.now()};localStorage.setItem(journalKey,JSON.stringify(journal));window.dispatchEvent(new Event("bitfoundry-course-update"));window.dispatchEvent(new Event("bitfoundry-journal-update"));submit.textContent="Capstone recorded ✓";submit.disabled=true;if(projectFeedback)projectFeedback.textContent="Your incident handoff is complete and saved in your learning journal.";});
 render();
})();
