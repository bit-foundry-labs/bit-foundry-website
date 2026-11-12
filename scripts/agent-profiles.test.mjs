import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
const names=["wayfinding-architect","motion-smith","experience-qa"];
test("three GitHub Copilot specialists have valid profiles and bounded scopes",()=>{
  for(const name of names){
    const path=`.github/agents/${name}.agent.md`;
    const source=readFileSync(path,"utf8");
    assert.match(source,/^---\nname: [a-z-]+\ndescription: .+\ntarget: github-copilot\ntools: \["read", "search", "edit", "execute"\]\n---\n/);
    assert.ok(source.includes("AGENTS.md"),name+" must inherit repo rules");
    assert.ok(source.includes("PR #9"),name+" must coordinate with in-flight work");
    assert.ok(source.includes("No production merge"),name+" must preserve review gate");
  }
});
test("agent agreement specifies regression, budget and navigation guardrails",()=>{
  const text=readFileSync("AGENTS.md","utf8");
  for(const clause of ["mobile-browser-smoke.mjs","pnpm run typecheck","prefers-reduced-motion","No new paid APIs","PR #9","no SPA catch-all".replace(/^no /,"no ")]){
    if(clause==="no SPA catch-all") assert.match(text,/no SPA catch-all/i);
    else assert.ok(text.includes(clause),clause);
  }
});
