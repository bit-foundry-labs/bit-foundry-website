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
 const {readJournal,saveJournal,readCourseRecord,saveCourseRecord:saveCourseRecordValue,readResume,saveResume:saveResumeValue,readLessonNote,saveLessonNote}=storage;
 const config=window.BIT_FOUNDRY_NETWORKING_CONFIG;
 if(!config)return;
 const {readerPageLabels:names,researchSources,chapterLabModules}=config;
 function updateJournal(){const entries=Object.entries(readJournal()).filter(([,entry])=>entry.text?.trim()).sort(([,a],[,b])=>a.updatedAt-b.updatedAt);if(journalCount)journalCount.textContent=entries.length;if(!journalEntries)return;const questions=entries.filter(([,entry])=>entry.tag==="question"||entry.tag==="confusing"),insights=entries.filter(([,entry])=>entry.tag==="insight");const summary=entries.length?"<section class='journal-summary'><div><span>Questions to revisit</span><strong>"+questions.length+"</strong></div><div><span>Insights to test</span><strong>"+insights.length+"</strong></div><div><span>Bloom reflections</span><strong>"+entries.length+"</strong></div></section>"+(questions.length?"<section class='journal-queue'><h3>Return to these questions</h3><ul>"+questions.map(([,entry])=>"<li><b>"+esc(entry.title)+"</b><span>"+esc(entry.text.slice(0,150))+(entry.text.length>150?"…":"")+"</span></li>").join("")+"</ul></section>":""):"";journalEntries.innerHTML=entries.length?summary+entries.map(([key,entry])=>{const editable=entry.lessonId.startsWith("module-"),source=editable?entry.lessonId.replace("module-","Module ").replace("-", "."):entry.lessonId.startsWith("lab-")?"Lab evidence · Module "+entry.lessonId.replace("lab-",""):"Course capstone";return "<article class='journal-entry'><div class='journal-entry-meta'><strong>"+esc(entry.bloom)+" · "+esc(source)+"</strong><span class='journal-tag'>"+esc(entry.tag||"insight")+"</span></div><h3>"+esc(entry.title)+"</h3><p>"+esc(entry.text)+"</p>"+(editable?"<button type='button' class='journal-edit' data-journal-edit='"+esc(key)+"'>Edit reflection</button>":"<span class='journal-static'>Saved capstone record</span>")+"</article>";}).join(""):"<p class='journal-empty'>Your reflections will gather here as you work through the course.</p>";journalEntries.querySelectorAll("[data-journal-edit]").forEach(button=>button.addEventListener("click",()=>{const entry=readJournal()[button.dataset.journalEdit],target=entry&&document.getElementById(entry.lessonId);if(!target)return;active=target;index=Number(button.dataset.journalEdit.split("::")[1])||0;journalPanel.hidden=true;render();page.querySelector("[data-bloom-journal]")?.focus();}));}
 const writeJournal=record=>{saveJournal(record);updateJournal();};updateJournal();};
 journalToggle?.addEventListener("click",()=>{updateJournal();journalPanel.hidden=false;journalPanel.querySelector("button")?.focus();});
 journalClose?.addEventListener("click",()=>{journalPanel.hidden=true;journalToggle?.focus();});
 journalExport?.addEventListener("click",()=>{const entries=Object.values(readJournal()).filter(entry=>entry.text?.trim()).sort((a,b)=>a.updatedAt-b.updatedAt);const body=entries.length?entries.map(entry=>"["+entry.bloom+" · "+(entry.tag||"insight")+"]\n"+entry.title+"\n"+entry.text).join("\n\n---\n\n"):"No journal entries yet.";const blob=new Blob(["BIT FOUNDRY · COMPUTER NETWORKING JOURNAL\n\n"+body],{type:"text/plain"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="bit-foundry-networking-journal.txt";document.body.append(link);link.click();link.remove();URL.revokeObjectURL(url);});
 const lessonContent=window.BIT_FOUNDRY_NETWORKING_LESSONS;
 if(!lessonContent)return;
 const {activities,lessonDetails,buildLessonPages}=lessonContent;
 const labs=window.BIT_FOUNDRY_NETWORKING_LABS;
 if(!labs)return;
 const {bindQueueLab,bindEncapsulationLab,bindLatencyLab,bindRetryLab,bindMailDeliveryLab,bindDeliveryArchitecture,bindDeliveryLab,bindSocketLab,bindUdpLab,bindTcpLab,bindTcpPrediction,bindWindowLab,bindRouteLab,bindRouterLab,bindIpLab,bindRuleLab,bindMedia,bindStream,bindVoice,bindCall,bindQos,bindThreat,bindCrypto,bindSign,bindTls,bindDefense,bindWireless,bindWifi,bindRadioChooser,bindHandoff,bindFrame,bindParity,bindAccess,bindSwitch,bindLanTrace,bindVlan,bindLinkState,bindDistanceVector,bindOspf,bindBgp,bindSdn,bindDiagnostics}=labs;
 const modules=[...document.querySelectorAll('article[id^="module-"]')];
 const saveResume=()=>{if(!active)return;saveResumeValue({id:active.id,page:index,updatedAt:Date.now()});paintResume();};
 const courseRecord=()=>readCourseRecord();
 function saveCourseRecord(record){saveCourseRecordValue(record);paintCourseProgress();}
 function markLessonComplete(id){const record=courseRecord();if(!record.lessons.includes(id)){record.lessons.push(id);saveCourseRecord(record);}}
 function paintCourseProgress(){
  const record=courseRecord(),lessonTotal=modules.length,lessonDone=modules.filter(item=>record.lessons.includes(item.id)).length,labTotal=Object.keys(chapterLabModules).length,labDone=Object.keys(chapterLabModules).filter(chapter=>record.labs.includes(chapter)).length,capstoneDone=record.capstone?1:0;
  document.querySelectorAll("[data-chapter-status]").forEach(node=>{const chapter=node.dataset.chapterStatus,count=modules.filter(item=>item.id.startsWith("module-"+Number(chapter)+"-")).length,finished=modules.filter(item=>item.id.startsWith("module-"+Number(chapter)+"-")&&record.lessons.includes(item.id)).length,lab=record.labs.includes(chapter);node.textContent=finished+" / "+count+" lessons · "+(lab?"lab demonstrated":"lab pending");});
  const count=document.getElementById("course-completion-count"),bar=document.getElementById("course-completion-bar"),track=bar?.parentElement,form=document.getElementById("certificate-form"),note=document.getElementById("course-completion-note");
  if(count)count.textContent=lessonDone+" of "+lessonTotal+" lessons · "+labDone+" of "+labTotal+" labs · "+(capstoneDone?"capstone complete":"capstone pending");
  if(bar){bar.style.width=((lessonDone+labDone+capstoneDone)/(lessonTotal+labTotal+1)*100)+"%";if(track){track.setAttribute("aria-valuemax",String(lessonTotal+labTotal+1));track.setAttribute("aria-valuenow",String(lessonDone+labDone+capstoneDone));}}
  const complete=lessonDone===lessonTotal&&labDone===labTotal&&record.capstone;
  if(form)form.hidden=!complete;
  if(note)note.textContent=complete?"All lessons and module labs are complete. Add your name to create your certificate.":"Complete the lessons, demonstrate each module lab, and finish the capstone to unlock your certificate.";
 }
 let active=null,index=0;
 const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
 const txt=(el,sel)=>el?.querySelector(sel)?.textContent.trim()||"";
 const pages=()=>buildLessonPages({active,modules,txt,esc});
 
 function render(){
  if(!active)return;
  saveResume();
  if(journalPanel)journalPanel.hidden=true;
  const chapter=active.id.split("-")[1];
  kicker.textContent="CHAPTER "+chapter.padStart(2,"0")+" · "+active.id.replace("module-","MODULE ").replace("-",".");
  label.textContent="PAGE "+(index+1)+" OF 5 · "+names[index];bar.style.width=((index+1)*20)+"%";
  back.disabled=index===0;next.textContent=index<4?"Next page →":(modules.indexOf(active)<modules.length-1?"Next module →":"Finish lesson");
  page.innerHTML=pages()[index];
  const bloomTargets=[
   {level:"UNDERSTAND → ANALYZE",prompt:"Explain why "+txt(active,"h3").toLowerCase()+" changes a user-visible behavior, then name the boundary that owns it."},
   {level:"ANALYZE",prompt:"Trace the mechanism; separate what each component knows, changes, and merely carries."},
   {level:"EVALUATE",prompt:"Compare plausible explanations; choose the first boundary the evidence supports and name the observation that could disprove it."},
   {level:"APPLY → CREATE",prompt:"Predict what one input change will do before using the model. Then use the result to revise a design or debugging decision."},
   {level:"CREATE → EVALUATE",prompt:"Write a decision rule for a real product, then defend its trade-off with evidence from this lesson."}
  ][index];
  const journalEntryId=active.id+"::"+index,existingJournalEntry=readJournal()[journalEntryId];
  const thinking=document.createElement("aside");thinking.className="reader-thinking";thinking.innerHTML="<strong>Bloom focus · "+bloomTargets.level+"</strong><p>"+esc(bloomTargets.prompt)+"</p><label class='reader-journal-prompt'><span>Write your thinking</span><select data-bloom-journal-tag aria-label='Reflection type'><option value='insight'>Insight</option><option value='question'>Question</option><option value='confusing'>Still unclear</option></select><textarea data-bloom-journal placeholder='Use this space to reason through the prompt.'></textarea><small data-bloom-save>"+(existingJournalEntry?.text?"Saved locally":"Saved automatically in this browser")+"</small></label>";
  const journalField=thinking.querySelector("[data-bloom-journal]"),journalTag=thinking.querySelector("[data-bloom-journal-tag]"),journalSave=thinking.querySelector("[data-bloom-save]");journalField.value=existingJournalEntry?.text||"";journalTag.value=existingJournalEntry?.tag||"insight";const saveReflection=()=>{const record=readJournal(),text=journalField.value.trim();if(text){record[journalEntryId]={lessonId:active.id,title:txt(active,"h3"),bloom:bloomTargets.level,tag:journalTag.value,text,updatedAt:Date.now()};}else delete record[journalEntryId];writeJournal(record);journalSave.textContent=text?"Saved locally":"Entry cleared";};journalField.addEventListener("input",saveReflection);journalTag.addEventListener("change",saveReflection);
  const readerIntro=page.querySelector(".reader-intro");if(readerIntro)readerIntro.insertAdjacentElement("afterend",thinking);else page.prepend(thinking);
  if(index===4){const sources=researchSources[chapter]||[],references=document.createElement("aside");references.className="reader-research";references.innerHTML="<h3>Research basis</h3><p>Concepts in this module are synthesized from the references below. The course uses textbooks, university materials, and peer-reviewed venues only.</p><ul>"+sources.map(source=>"<li><a href='"+source[1]+"' target='_blank' rel='noreferrer'>"+esc(source[0])+" ↗</a></li>").join("")+"</ul>";page.append(references);}
  const queueLab=page.querySelector("[data-queue-lab]");
  if(queueLab)bindQueueLab(queueLab);
  const encapsulationLab=page.querySelector("[data-encapsulation-lab]");if(encapsulationLab)bindEncapsulationLab(encapsulationLab);
  const latencyLab=page.querySelector("[data-latency-lab]");if(latencyLab)bindLatencyLab(latencyLab);
  const retryLab=page.querySelector("[data-retry-lab]");if(retryLab)bindRetryLab(retryLab);
  const mailDeliveryLab=page.querySelector("[data-dns-mail-lab]");if(mailDeliveryLab)bindMailDeliveryLab(mailDeliveryLab);
  const architecture=page.querySelector("[data-delivery-architecture]");if(architecture)bindDeliveryArchitecture(architecture);
  const deliveryLab=page.querySelector("[data-delivery-lab]");if(deliveryLab)bindDeliveryLab(deliveryLab);
  const socketLab=page.querySelector("[data-socket-lab]");if(socketLab)bindSocketLab(socketLab);
  const udpLab=page.querySelector("[data-udp-lab]");if(udpLab)bindUdpLab(udpLab);
  const tcpLab=page.querySelector("[data-tcp-lab]");if(tcpLab)bindTcpLab(tcpLab);
  const tcpPrediction=page.querySelector("[data-tcp-prediction]");if(tcpPrediction)bindTcpPrediction(tcpPrediction);
  const windowLab=page.querySelector("[data-window-lab]");if(windowLab)bindWindowLab(windowLab);
  const routeLab=page.querySelector("[data-route-lab]");if(routeLab)bindRouteLab(routeLab);
  const routerLab=page.querySelector("[data-router-lab]");if(routerLab)bindRouterLab(routerLab);
  const ipLab=page.querySelector("[data-ip-lab]");if(ipLab)bindIpLab(ipLab);
  const ruleLab=page.querySelector("[data-rule-lab]");if(ruleLab)bindRuleLab(ruleLab);
  const mediaLab=page.querySelector("[data-media-lab]");if(mediaLab)bindMedia(mediaLab);
  const streamLab=page.querySelector("[data-stream-lab]");if(streamLab)bindStream(streamLab);
  const voiceLab=page.querySelector("[data-voice-lab]");if(voiceLab)bindVoice(voiceLab);
  const callLab=page.querySelector("[data-call-lab]");if(callLab)bindCall(callLab);
  const qosLab=page.querySelector("[data-qos-lab]");if(qosLab)bindQos(qosLab);
  const threatLab=page.querySelector("[data-threat-lab]");if(threatLab)bindThreat(threatLab);
  const cryptoLab=page.querySelector("[data-crypto-lab]");if(cryptoLab)bindCrypto(cryptoLab);
  const signLab=page.querySelector("[data-sign-lab]");if(signLab)bindSign(signLab);
  const tlsLab=page.querySelector("[data-tls-lab]");if(tlsLab)bindTls(tlsLab);
  const defenseLab=page.querySelector("[data-defense-lab]");if(defenseLab)bindDefense(defenseLab);

  const wirelessLab=page.querySelector("[data-wireless-lab]");if(wirelessLab)bindWireless(wirelessLab);
  const wifiLab=page.querySelector("[data-wifi-lab]");if(wifiLab)bindWifi(wifiLab);
  const radioLab=page.querySelector("[data-radio-choice-lab]");if(radioLab)bindRadioChooser(radioLab);
  const handoffLab=page.querySelector("[data-handoff-lab]");if(handoffLab)bindHandoff(handoffLab);

  const frameLab=page.querySelector("[data-frame-lab]");if(frameLab)bindFrame(frameLab);
  const parityLab=page.querySelector("[data-parity-lab]");if(parityLab)bindParity(parityLab);
  const accessLab=page.querySelector("[data-access-lab]");if(accessLab)bindAccess(accessLab);
  const switchLab=page.querySelector("[data-switch-lab]");if(switchLab)bindSwitch(switchLab);
  if(active.id==="module-6-4"&&index===3)bindLanTrace(page);
  const vlanLab=page.querySelector("[data-vlan-lab]");if(vlanLab)bindVlan(vlanLab);

  const lsLab=page.querySelector("[data-ls-lab]");if(lsLab)bindLinkState(lsLab);
  const dvLab=page.querySelector("[data-dv-lab]");if(dvLab)bindDistanceVector(dvLab);
  const ospfLab=page.querySelector("[data-ospf-lab]");if(ospfLab)bindOspf(ospfLab);
  const bgpLab=page.querySelector("[data-bgp-lab]");if(bgpLab)bindBgp(bgpLab);
  const sdnLab=page.querySelector("[data-sdn-lab]");if(sdnLab)bindSdn(sdnLab);
  const diagLab=page.querySelector("[data-icmp-lab]");if(diagLab)bindDiagnostics(diagLab);
  const chapterNumber=String(active.id.split("-")[1]).padStart(2,"0");
  if(index===3&&chapterLabModules[chapterNumber]===active.id){
   const record=courseRecord(),alreadyDone=record.labs.includes(chapterNumber),existingNote=record.labNotes[chapterNumber]||"",labCard=document.createElement("aside");labCard.className="lab-demonstration";labCard.innerHTML="<strong>Module lab demonstration · "+chapterNumber+"</strong><p>Record one observation from this model: what did you change, and what changed in the system?</p><label class='lab-reflection-label'>Lab observation<textarea data-lab-reflection placeholder='For example: Raising arrivals above service capacity made the queue grow because packets arrived faster than the link could drain them.'></textarea></label><small data-lab-reflection-status>"+(alreadyDone?"Saved as lab evidence":"Write at least one specific observation to record this lab.")+"</small><button type=\"button\" data-done=\""+alreadyDone+"\" "+(!alreadyDone&&existingNote.trim().length<30?"disabled":"")+">"+(alreadyDone?"Lab demonstrated ✓":"Record demonstrated lab")+"</button>";
   const labNote=labCard.querySelector("[data-lab-reflection]"),labStatus=labCard.querySelector("[data-lab-reflection-status]"),labButton=labCard.querySelector("button");labNote.value=existingNote;
   const persistLabNote=()=>{const current=courseRecord();current.labNotes[chapterNumber]=labNote.value;saveCourseRecord(current);labButton.disabled=!alreadyDone&&labNote.value.trim().length<30;labStatus.textContent=labNote.value.trim().length>=30?"Observation saved locally.":"Write at least one specific observation to record this lab.";};labNote.addEventListener("input",persistLabNote);
   labButton.addEventListener("click",()=>{const current=courseRecord(),note=labNote.value.trim();if(!alreadyDone&&note.length<30)return;if(!current.labs.includes(chapterNumber))current.labs.push(chapterNumber);current.labNotes[chapterNumber]=note;saveCourseRecord(current);const journal=readJournal();journal["lab-"+chapterNumber+"::evidence"]={lessonId:"lab-"+chapterNumber,title:"Module "+chapterNumber+" lab observation",bloom:"APPLY → EVALUATE",tag:"lab evidence",text:note,updatedAt:Date.now()};writeJournal(journal);labButton.dataset.done="true";labButton.textContent="Lab demonstrated ✓";labButton.disabled=false;labStatus.textContent="Observation saved as lab evidence in your journal.";});page.append(labCard);
  }
  const area=page.querySelector("#practice-notes");
  if(area){area.value=readLessonNote(active.id);area.addEventListener("input",()=>saveLessonNote(active.id,area.value));}
 }
 function openModule(id,startPage=0){const target=document.getElementById(id);if(!target||!target.matches('article[id^="module-"]'))return;active=target;index=Math.max(0,Math.min(4,startPage));render();if(!dialog.open)dialog.showModal();page.querySelector("#reader-title")?.focus({preventScroll:true});}
 function routeFromLocation(){const id=decodeURIComponent(location.hash.slice(1));if(id.startsWith("module-")){if(!history.state?.moduleRoute)history.replaceState({moduleRoute:true,fromCourse:false},"",location.href);openModule(id);}else if(dialog.open){dialog.close();}}
 function openFromCourse(id,startPage=0){history.pushState({moduleRoute:true,fromCourse:true},"",location.pathname+location.search+"#"+id);openModule(id,startPage);}
 function leaveLesson(){if(history.state?.fromCourse){history.back();return;}history.replaceState(null,"",location.pathname+location.search);if(dialog.open)dialog.close();active=null;}
 const resumeCard=document.querySelector("[data-course-resume]"),resumeTitle=document.querySelector("[data-course-resume-title]"),resumeMeta=document.querySelector("[data-course-resume-meta]"),resumeOpen=document.querySelector("[data-course-resume-open]");
 function paintResume(){const resume=readResume(),target=resume&&document.getElementById(resume.id);if(!resumeCard)return;if(!target){resumeCard.hidden=true;return;}resumeTitle.textContent=txt(target,"h3")||"Resume networking course";resumeMeta.textContent="Module "+resume.id.replace("module-","").replace("-", ".")+" · page "+(Number(resume.page)+1)+" of 5";resumeCard.hidden=false;}
 resumeOpen?.addEventListener("click",()=>{const resume=readResume();if(resume)openFromCourse(resume.id,Number(resume.page)||0);});
 document.querySelectorAll("[data-module-open]").forEach(button=>button.addEventListener("click",()=>openFromCourse(button.dataset.moduleOpen,Number(button.dataset.modulePage)||0)));
 document.querySelectorAll(".chapter-card-toggle").forEach(toggle=>toggle.addEventListener("click",()=>{const shouldOpen=toggle.getAttribute("aria-expanded")!=="true";document.querySelectorAll(".chapter-card-toggle").forEach(other=>{other.setAttribute("aria-expanded","false");const panel=document.getElementById(other.getAttribute("aria-controls"));if(panel)panel.hidden=true;const icon=other.querySelector(".chapter-card-chevron");if(icon)icon.textContent="＋";});if(shouldOpen){toggle.setAttribute("aria-expanded","true");const panel=document.getElementById(toggle.getAttribute("aria-controls"));if(panel)panel.hidden=false;const icon=toggle.querySelector(".chapter-card-chevron");if(icon)icon.textContent="−";}}));
 const pathDetail=document.querySelector("[data-incident-path-detail]"),pathTitle=document.querySelector("[data-incident-path-title]"),pathCopy=document.querySelector("[data-incident-path-copy]"),pathInfo={client:{title:"CLIENT · STARTING THE REQUEST",copy:"Your application decides what it needs: a URL, a method, headers, and a body. Before any network exchange, the client must know the hostname and the service it intends to reach."},name:{title:"DNS / NAME · FINDING THE DESTINATION",copy:"DNS translates a hostname into an IP address. If this step fails, the client has no destination for the connection; checking a resolver response and authoritative records is the useful next move."},transport:{title:"TCP / TLS · OPENING A PROTECTED CONNECTION",copy:"TCP reaches the destination port and provides its delivery service. TLS then authenticates the server and protects the HTTP exchange. A timeout or certificate error belongs here, before the API can respond."},app:{title:"HTTP / API · EXCHANGING APPLICATION MEANING",copy:"HTTP carries the request to the API and returns a response. Status codes, response bodies, authorization, and validation errors are application evidence, because the network path already worked."}};
 document.querySelectorAll("[data-incident-layer]").forEach(button=>button.addEventListener("click",()=>{const item=pathInfo[button.dataset.incidentLayer];if(!item||!pathDetail)return;document.querySelectorAll("[data-incident-layer]").forEach(other=>other.setAttribute("aria-expanded","false"));button.setAttribute("aria-expanded","true");pathTitle.textContent=item.title;pathCopy.textContent=item.copy;pathDetail.hidden=false;}));
 back.addEventListener("click",()=>{if(index>0){index--;render();page.querySelector("#reader-title")?.focus({preventScroll:true});}});
 next.addEventListener("click",()=>{if(index<4){index++;render();page.querySelector("#reader-title")?.focus({preventScroll:true});return;}markLessonComplete(active.id);const following=modules[modules.indexOf(active)+1];if(following){history.pushState({moduleRoute:true,fromCourse:true},"",location.pathname+location.search+"#"+following.id);openModule(following.id);}else leaveLesson();});
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
