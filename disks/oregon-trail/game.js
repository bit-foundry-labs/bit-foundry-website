(() => {
  const initial = () => ({miles:0,food:650,health:100,oxen:6,days:0,over:false,won:false,riverCrossed:false,huntedToday:false});
  let state=initial();
  const $=id=>document.getElementById(id);
  const say=(line)=>{ $("log").textContent=line; };
  function draw(){
    $("miles").textContent=state.miles+" / 2,000 mi";
    $("food").textContent=Math.max(0,state.food)+" lb";
    $("health").textContent=Math.max(0,state.health)+"%";
    $("oxen").textContent=Math.max(0,state.oxen);
    $("days").textContent=state.days;
    $("river").textContent=state.riverCrossed?"Crossed":(state.miles>=900?"At crossing":"Ahead");
    const disabled=state.over||state.won;
    ["travel","hunt","rest","ford","ferry","wait"].forEach(id=>$(id).disabled=disabled);
    $("river-choice").classList.toggle("is-open",state.miles>=1000&&!state.riverCrossed&&!disabled);
  }
  function endCheck(){
    if(state.miles>=2000){state.won=true;state.miles=2000;say("Oregon reached. The party made it across the trail.");$("message").textContent="Journey complete.";return;}
    if(state.food<=0||state.health<=0||state.oxen<=0){state.over=true;say("The journey ends here. Start a new trip and try a different pace.");$("message").textContent="Journey over.";}
  }
  $("travel").addEventListener("click",()=>{
    if(state.over||state.won||state.miles>=1000&&!state.riverCrossed)return;
    state.miles+=100;state.days+=2;state.food-=Math.ceil(100+Math.random()*30);state.huntedToday=false;
    let line="Steady miles today. The wagon keeps rolling.";
    const roll=Math.random();
    if(roll<.18){state.health-=12;line="A rough stretch takes its toll. Health -12%.";}
    else if(roll<.27){state.oxen-=1;line="An ox is lost on the trail. Oxen -1.";}
    else if(roll<.40){state.food+=35;line="You find supplies left at a way station. Food +35 lb.";}
    say(line);endCheck();draw();
  });
  $("hunt").addEventListener("click",()=>{
    if(state.over||state.won)return;
    if(state.huntedToday){$("message").textContent="You have already hunted today. Travel or rest before trying again.";return;}
    state.days+=1;state.food+=35+Math.floor(Math.random()*71);state.huntedToday=true;
    say("The hunt brings back "+(state.food>0?"fresh food":"some food")+" for the wagon.");$("message").textContent="Food added. Keep an eye on the days passing.";
    endCheck();draw();
  });
  $("rest").addEventListener("click",()=>{
    if(state.over||state.won)return;
    state.days+=1;state.food-=35;state.health=Math.min(100,state.health+18);state.huntedToday=false;
    say("The party rests. Health +18%, food -35 lb.");endCheck();draw();
  });
  function cross(mode){
    if(state.over||state.won||state.miles<1000||state.riverCrossed)return;
    state.days+=1;state.riverCrossed=true;
    if(mode==="ferry"){state.food-=60;say("The ferry gets everyone across safely. Food -60 lb.");}
    else if(mode==="wait"){state.days+=2;state.food-=45;say("You wait for the water to drop, then cross safely. Food -45 lb.");}
    else if(Math.random()<.55){state.food-=30;say("The wagon makes it through the ford. Food -30 lb.");}
    else{state.health-=22;state.food-=70;say("The current sweeps supplies away. The party gets through, but health -22% and food -70 lb.");}
    endCheck();draw();
  }
  $("ford").addEventListener("click",()=>cross("ford"));
  $("ferry").addEventListener("click",()=>cross("ferry"));
  $("wait").addEventListener("click",()=>cross("wait"));
  $("restart").addEventListener("click",()=>{state=initial();say("Your wagon is ready. The trail is open.");$("message").textContent="Travel 100 miles, hunt for food, or rest to recover.";draw();});
  draw();
})();