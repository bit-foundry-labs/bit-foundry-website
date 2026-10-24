"use strict";

// The networking material began life as a guided course. Keep its tested models,
// but surface them as a public field lab: choose an idea, manipulate the system,
// and open the surrounding explanation only when it helps.
window.networkingContentReady.then(() => {
  const hero=document.querySelector(".learn-hero");
  if(!hero)return;
  const title=hero.querySelector("h1"),lede=hero.querySelector("h1 + p"),crumb=hero.querySelector(".learn-breadcrumb"),jump=hero.querySelector(".osi-jump");
  if(title)title.textContent="Network Systems Lab";
  if(lede)lede.textContent="Open experiments for seeing how requests move, stall, recover, route, and stay secure.";
  if(crumb)crumb.innerHTML="<a href='../../'>Bit Foundry</a> / Systems Lab";
  if(jump){jump.href="#experiments";jump.innerHTML="Explore the experiments <span aria-hidden='true'>↓</span>";}

  [".course-intro",".course-resume",".interactive-models","#course-map",".incident-capstone",".course-completion"].forEach(selector=>document.querySelector(selector)?.setAttribute("hidden",""));

  const chapterNames={"1":"Internet foundations","2":"Application systems","3":"Transport behavior","4":"Packet forwarding","5":"Routing and control","6":"LANs and links","7":"Wireless and mobility","8":"Network security","9":"Media and quality"};
  const flagships={
    "module-1-2":{kind:"queue",label:"PACKET PRESSURE"},"module-1-3":{kind:"delay",label:"TIME BUDGET"},"module-1-4":{kind:"layers",label:"WRAP THE REQUEST"},
    "module-2-3":{kind:"dns",label:"FOLLOW THE MESSAGE"},"module-3-3":{kind:"tcp",label:"RECOVERY LOOP"},"module-3-4":{kind:"window",label:"CONTROL THE FLOOD"},
    "module-4-1":{kind:"route",label:"FORWARDING TABLE"},"module-5-4":{kind:"bgp",label:"ROUTES BETWEEN WORLDS"},"module-6-4":{kind:"lan",label:"INSIDE THE LAN"},
    "module-7-4":{kind:"radio",label:"MOTION & HANDOFF"},"module-8-4":{kind:"tls",label:"TRUST THE PEER"},"module-9-3":{kind:"voice",label:"THE DEADLINE WINS"}
  };
  const experiments=[...document.querySelectorAll('article[id^="module-"]')].map(article=>{
    const [,chapter]=article.id.split("-");
    return {id:article.id,chapter,title:article.querySelector("h3")?.textContent.trim()||article.id,summary:article.querySelector("p")?.textContent.trim()||"Explore the model."};
  });
  const catalog=document.createElement("section");catalog.className="lab-catalog";catalog.id="experiments";
  catalog.innerHTML="<header class='lab-catalog-head'><div><p class='lab-kicker'>OPEN EXPLORATIONS · NO LOGIN REQUIRED</p><h2>Manipulate the machinery.</h2></div><p>Each experiment comes from Internet Architecture &amp; Protocols: change a condition, trace the resulting behavior, and use the model to reason about a real system.</p></header><div class='lab-filter' role='group' aria-label='Filter experiments'><button type='button' class='is-active' data-lab-filter='all'>All systems <span>"+experiments.length+"</span></button>"+Object.entries(chapterNames).map(([chapter,name])=>"<button type='button' data-lab-filter='"+chapter+"'>"+name+" <span>"+experiments.filter(item=>item.chapter===chapter).length+"</span></button>").join("")+"</div><div class='lab-grid'>"+experiments.map((item,index)=>{const feature=flagships[item.id],art=feature?"<div class='lab-signal lab-signal--"+feature.kind+"' aria-hidden='true'><i></i><i></i><i></i><b>"+feature.label+"</b></div>":"";return "<article class='lab-card "+(feature?"is-flagship":"")+"' data-lab-chapter='"+item.chapter+"' data-lab-kind='"+(feature?.kind||"standard")+"'><div class='lab-card-top'><span>LAB "+String(index+1).padStart(2,"0")+"</span><span>"+chapterNames[item.chapter]+"</span></div>"+art+"<h3>"+item.title+"</h3><p>"+item.summary+"</p><button type='button' data-open-model='"+item.id+"'>Open model <i aria-hidden='true'></i></button></article>";}).join("")+"</div>";
  hero.after(catalog);
  const filters=[...catalog.querySelectorAll("[data-lab-filter]")],cards=[...catalog.querySelectorAll("[data-lab-chapter]")];
  filters.forEach(button=>button.addEventListener("click",()=>{const selected=button.dataset.labFilter;filters.forEach(item=>item.classList.toggle("is-active",item===button));cards.forEach(card=>card.hidden=selected!=="all"&&card.dataset.labChapter!==selected);}));
  catalog.querySelectorAll("[data-open-model]").forEach(button=>button.addEventListener("click",()=>document.querySelector("[data-module-open='"+button.dataset.openModel+"']")?.click()));
});
