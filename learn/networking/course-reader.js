window.networkingContentReady.then(() => {
(()=> {
 const dialog=document.getElementById("module-reader"),page=document.getElementById("reader-page");
 if(!dialog||!page)return;
 const kicker=document.getElementById("reader-kicker"),label=document.getElementById("reader-progress-label");
 const bar=document.getElementById("reader-progress-bar"),back=dialog.querySelector(".reader-back");
 const next=dialog.querySelector(".reader-next"),close=dialog.querySelector(".reader-close");
 const journalToggle=dialog.querySelector("[data-reader-journal]"),journalExport=dialog.querySelector("[data-reader-journal-export]"),journalPanel=dialog.querySelector("[data-reader-journal-panel]"),journalEntries=dialog.querySelector("[data-reader-journal-entries]"),journalClose=dialog.querySelector("[data-reader-journal-close]"),journalCount=dialog.querySelector("[data-journal-count]");
 const storage=window.BIT_FOUNDRY_NETWORKING_STORAGE;
 if(!storage)return;
 const {readJournal,saveJournal,readResume,saveResume:saveResumeValue,readLessonNote,saveLessonNote}=storage;
 const config=window.BIT_FOUNDRY_NETWORKING_CONFIG;
 if(!config)return;
 const {readerPageLabels:names}=config;
 const modelPageIndex=names.indexOf("HANDS-ON PRACTICE");
 if(modelPageIndex<0)throw new Error("Networking course is missing the hands-on practice page");
 const progress=window.BIT_FOUNDRY_NETWORKING_PROGRESS;
 if(!progress)return;
 const {summarize}=progress;
 function updateJournal(){const entries=Object.entries(readJournal()).filter(([,entry])=>entry.text?.trim()).sort(([,a],[,b])=>a.updatedAt-b.updatedAt);if(journalCount)journalCount.textContent=entries.length;if(!journalEntries)return;const questions=entries.filter(([,entry])=>entry.tag==="question"||entry.tag==="confusing"),insights=entries.filter(([,entry])=>entry.tag==="insight");const summary=entries.length?"<section class='journal-summary'><div><span>Questions to revisit</span><strong>"+questions.length+"</strong></div><div><span>Insights to test</span><strong>"+insights.length+"</strong></div><div><span>Bloom reflections</span><strong>"+entries.length+"</strong></div></section>"+(questions.length?"<section class='journal-queue'><h3>Return to these questions</h3><ul>"+questions.map(([,entry])=>"<li><b>"+esc(entry.title)+"</b><span>"+esc(entry.text.slice(0,150))+(entry.text.length>150?"…":"")+"</span></li>").join("")+"</ul></section>":""):"";journalEntries.innerHTML=entries.length?summary+entries.map(([key,entry])=>{const editable=entry.lessonId.startsWith("module-"),source=editable?entry.lessonId.replace("module-","Module ").replace("-", "."):entry.lessonId.startsWith("lab-")?"Lab evidence · Module "+entry.lessonId.replace("lab-",""):"Course capstone";return "<article class='journal-entry'><div class='journal-entry-meta'><strong>"+esc(entry.bloom)+" · "+esc(source)+"</strong><span class='journal-tag'>"+esc(entry.tag||"insight")+"</span></div><h3>"+esc(entry.title)+"</h3><p>"+esc(entry.text)+"</p>"+(editable?"<button type='button' class='journal-edit' data-journal-edit='"+esc(key)+"'>Edit reflection</button>":"<span class='journal-static'>Saved capstone record</span>")+"</article>";}).join(""):"<p class='journal-empty'>Your reflections will gather here as you work through the course.</p>";journalEntries.querySelectorAll("[data-journal-edit]").forEach(button=>button.addEventListener("click",()=>{const entry=readJournal()[button.dataset.journalEdit],target=entry&&document.getElementById(entry.lessonId);if(!target)return;active=target;index=Number(button.dataset.journalEdit.split("::")[1])||0;journalPanel.hidden=true;render();page.querySelector("[data-bloom-journal]")?.focus();}));}
 const writeJournal=record=>{saveJournal(record);updateJournal();};
 journalToggle?.addEventListener("click",()=>{updateJournal();journalPanel.hidden=false;journalPanel.querySelector("button")?.focus();});
 journalClose?.addEventListener("click",()=>{journalPanel.hidden=true;journalToggle?.focus();});
 journalExport?.addEventListener("click",()=>{const entries=Object.values(readJournal()).filter(entry=>entry.text?.trim()).sort((a,b)=>a.updatedAt-b.updatedAt);const body=entries.length?entries.map(entry=>"["+entry.bloom+" · "+(entry.tag||"insight")+"]\n"+entry.title+"\n"+entry.text).join("\n\n---\n\n"):"No journal entries yet.";const blob=new Blob(["BIT FOUNDRY · COMPUTER NETWORKING JOURNAL\n\n"+body],{type:"text/plain"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="bit-foundry-networking-journal.txt";document.body.append(link);link.click();link.remove();URL.revokeObjectURL(url);});
 const lessonContent=window.BIT_FOUNDRY_NETWORKING_LESSONS;
 if(!lessonContent)return;
 const {buildLessonPages}=lessonContent;
 const labs=window.BIT_FOUNDRY_NETWORKING_LABS;
 const labRegistry=window.BIT_FOUNDRY_NETWORKING_LAB_REGISTRY;
 if(!labs||!labRegistry)return;
 const modules=[...document.querySelectorAll('article[id^="module-"]')];
 const saveResume=()=>{if(!active)return;saveResumeValue({id:active.id,page:index,updatedAt:Date.now()});paintResume();};
 function paintCourseProgress(){
  const status=summarize(modules.map(item=>item.id));
  document.querySelectorAll("[data-chapter-status]").forEach(node=>{
   const chapter=status.chapters[node.dataset.chapterStatus];
   if(!chapter)return;
   node.textContent=chapter.complete+" / "+chapter.total+" lessons · "+(chapter.labDone?"lab demonstrated":"lab pending");
  });
  const count=document.getElementById("course-completion-count"),bar=document.getElementById("course-completion-bar"),track=bar?.parentElement,form=document.getElementById("certificate-form"),note=document.getElementById("course-completion-note");
  if(count)count.textContent=status.lessonDone+" of "+status.lessonTotal+" lessons · "+status.labDone+" of "+status.labTotal+" labs · "+(status.capstoneDone?"capstone complete":"capstone pending");
  if(bar){bar.style.width=(status.done/status.total*100)+"%";if(track){track.setAttribute("aria-valuemax",String(status.total));track.setAttribute("aria-valuenow",String(status.done));}}
  if(form)form.hidden=!status.complete;
  if(note)note.textContent=status.complete?"All lessons and module labs are complete. Add your name to create your certificate.":"Complete the lessons, demonstrate each module lab, and finish the capstone to unlock your certificate.";
 }
 let active=null,index=0;
 const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
 const txt=(el,sel)=>el?.querySelector(sel)?.textContent.trim()||"";
 const pages=()=>buildLessonPages({active,modules,txt,esc});

 function render(){
  if(!active)return;
  saveResume();
  if(journalPanel)journalPanel.hidden=true;
    kicker.textContent="NETWORK SYSTEMS LAB · "+active.id.replace("module-","EXPERIMENT ").replace("-",".");
  label.textContent="GUIDED EXERCISE";bar.style.width=((index+1)/names.length*100)+"%";
  back.disabled=true;back.textContent="";next.textContent="";
  page.innerHTML=pages()[modelPageIndex];
  // The public lab opens only the thing to manipulate. Course copy, prompts,
  // reflection fields, and progression controls stay out of the experience.
  const liveModel=page.querySelector(".network-lab");
  if(liveModel)page.replaceChildren(liveModel);
  label.textContent=liveModel?"INTERACTIVE MODEL":"GUIDED EXERCISE";
  // Mobile Safari cannot expose desktop Network DevTools. Give phone users
  // an observable diagnosis task, keeping the original steps accessible.
  if(active.id==="module-1-1"&&!liveModel&&window.matchMedia("(max-width: 640px)").matches){
    const originalSteps=page.querySelector("ol");
    if(originalSteps){
      const desktopSteps=document.createElement("details");
      desktopSteps.className="reader-desktop-steps";
      const summary=document.createElement("summary");
      summary.textContent="Show desktop network-inspection steps";
      originalSteps.replaceWith(desktopSteps);
      desktopSteps.append(summary,originalSteps);
    }
    const guide=document.createElement("aside");
    guide.className="reader-phone-guide";
    guide.innerHTML="<strong>Try this on your iPhone</strong>"
      +"<p>Mobile Safari does not provide the desktop Network panel. Compare two failure boundaries now, and inspect timings and protocols on a computer later.</p>"
      +"<ol><li>Open <a href='https://example.com' target='_blank' rel='noopener noreferrer'>example.com</a> in Safari. Does the HTTPS page load?</li>"
      +"<li>In another tab try <code>https://example.invalid</code>. This reserved name should not resolve; observe Safari's error.</li>"
      +"<li>Why is name resolution failing different from receiving an HTTP error response? What would you inspect with desktop Network tools?</li></ol>";
    page.querySelector(".reader-intro")?.insertAdjacentElement("afterend",guide);
  }
  labRegistry.bindAvailable(page,labs,{lessonId:active.id,pageIndex:index,modelPageIndex});
  const area=page.querySelector("#practice-notes");
  if(area){area.value=readLessonNote(active.id);area.addEventListener("input",()=>saveLessonNote(active.id,area.value));}
 }
 function openModule(id,startPage=modelPageIndex){const target=document.getElementById(id);if(!target||!target.matches('article[id^="module-"]'))return;active=target;index=Math.max(0,Math.min(names.length-1,startPage));render();if(!dialog.open)dialog.showModal();page.querySelector("#reader-title")?.focus({preventScroll:true});}
 function routeFromLocation(){const id=decodeURIComponent(location.hash.slice(1));if(id.startsWith("module-")){if(!history.state?.moduleRoute)history.replaceState({moduleRoute:true,fromCourse:false},"",location.href);openModule(id);}else if(dialog.open){dialog.close();}}
 function openFromCourse(id,startPage=modelPageIndex){history.pushState({moduleRoute:true,fromCourse:true},"",location.pathname+location.search+"#"+id);openModule(id,startPage);}
 function leaveLesson(){if(history.state?.fromCourse){history.back();return;}history.replaceState(null,"",location.pathname+location.search);if(dialog.open)dialog.close();active=null;}
 const resumeCard=document.querySelector("[data-course-resume]"),resumeTitle=document.querySelector("[data-course-resume-title]"),resumeMeta=document.querySelector("[data-course-resume-meta]"),resumeOpen=document.querySelector("[data-course-resume-open]");
 function paintResume(){const resume=readResume(),target=resume&&document.getElementById(resume.id);if(!resumeCard)return;if(!target){resumeCard.hidden=true;return;}resumeTitle.textContent=txt(target,"h3")||"Resume networking course";resumeMeta.textContent="Module "+resume.id.replace("module-","").replace("-", ".")+" · page "+(Number(resume.page)+1)+" of "+names.length;resumeCard.hidden=false;}
 resumeOpen?.addEventListener("click",()=>{const resume=readResume();if(resume)openFromCourse(resume.id,Number(resume.page)||0);});
 document.querySelectorAll("[data-module-open]").forEach(button=>button.addEventListener("click",()=>openFromCourse(button.dataset.moduleOpen,button.dataset.modulePage===undefined?modelPageIndex:Number(button.dataset.modulePage))));
 document.querySelectorAll(".chapter-card-toggle").forEach(toggle=>toggle.addEventListener("click",()=>{const shouldOpen=toggle.getAttribute("aria-expanded")!=="true";document.querySelectorAll(".chapter-card-toggle").forEach(other=>{other.setAttribute("aria-expanded","false");const panel=document.getElementById(other.getAttribute("aria-controls"));if(panel)panel.hidden=true;const icon=other.querySelector(".chapter-card-chevron");if(icon)icon.textContent="＋";});if(shouldOpen){toggle.setAttribute("aria-expanded","true");const panel=document.getElementById(toggle.getAttribute("aria-controls"));if(panel)panel.hidden=false;const icon=toggle.querySelector(".chapter-card-chevron");if(icon)icon.textContent="−";}}));
 const pathDetail=document.querySelector("[data-incident-path-detail]"),pathTitle=document.querySelector("[data-incident-path-title]"),pathCopy=document.querySelector("[data-incident-path-copy]"),pathInfo={client:{title:"CLIENT · STARTING THE REQUEST",copy:"Your application decides what it needs: a URL, a method, headers, and a body. Before any network exchange, the client must know the hostname and the service it intends to reach."},name:{title:"DNS / NAME · FINDING THE DESTINATION",copy:"DNS translates a hostname into an IP address. If this step fails, the client has no destination for the connection; checking a resolver response and authoritative records is the useful next move."},transport:{title:"TCP / TLS · OPENING A PROTECTED CONNECTION",copy:"TCP reaches the destination port and provides its delivery service. TLS then authenticates the server and protects the HTTP exchange. A timeout or certificate error belongs here, before the API can respond."},app:{title:"HTTP / API · EXCHANGING APPLICATION MEANING",copy:"HTTP carries the request to the API and returns a response. Status codes, response bodies, authorization, and validation errors are application evidence, because the network path already worked."}};
 document.querySelectorAll("[data-incident-layer]").forEach(button=>button.addEventListener("click",()=>{const item=pathInfo[button.dataset.incidentLayer];if(!item||!pathDetail)return;document.querySelectorAll("[data-incident-layer]").forEach(other=>other.setAttribute("aria-expanded","false"));button.setAttribute("aria-expanded","true");pathTitle.textContent=item.title;pathCopy.textContent=item.copy;pathDetail.hidden=false;}));
 back.addEventListener("click",()=>{if(index>0){index--;render();page.querySelector("#reader-title")?.focus({preventScroll:true});}});
 next.addEventListener("click",leaveLesson);
 close.addEventListener("click",leaveLesson);
 dialog.addEventListener("close",()=>{active=null;if(location.hash.startsWith("#module-")){if(history.state?.fromCourse)history.back();else history.replaceState(null,"",location.pathname+location.search);}});
 const certificateForm=document.getElementById("certificate-form"),certificatePreview=document.getElementById("certificate-preview");
 if(certificateForm)certificateForm.addEventListener("submit",event=>{event.preventDefault();const name=document.getElementById("certificate-student-name")?.value.trim();if(!name)return;document.getElementById("certificate-recipient").textContent=name;document.getElementById("certificate-date").textContent=new Date().toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});certificatePreview?.classList.add("is-visible");});
 document.getElementById("certificate-print")?.addEventListener("click",()=>{document.body.classList.add("printing-certificate");window.print();});
 window.addEventListener("afterprint",()=>document.body.classList.remove("printing-certificate"));
 updateJournal();
 paintCourseProgress();
 paintResume();
 window.addEventListener("bitfoundry-course-update",paintCourseProgress);
 window.addEventListener("bitfoundry-journal-update",updateJournal);
 window.addEventListener("hashchange",routeFromLocation);window.addEventListener("popstate",routeFromLocation);routeFromLocation();
})();
});
