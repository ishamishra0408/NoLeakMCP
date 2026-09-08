if (typeof AbortController === "undefined" || typeof fetch === "undefined") { console.error("This suite requires Node 18+ (found " + process.version + "). Run: nvm use 20"); process.exit(2); }
import { textFromBlocks, extractFromToolResult, isIngestSurface, parseVerdict, scoreText } from "../plugins/injection-scorer/index.js";
let p=0,f=0; const ok=(c,l)=>{console.log(`${c?"PASS":"FAIL"}  ${l}`);c?p++:f++;};
ok(textFromBlocks([{type:"text",text:"a"},{type:"image"},{type:"text",text:"b"}])==="a\nb","textFromBlocks");
const body={turn:1,step:1,message:{role:"user",source:{kind:"tool",callId:"call_9"},content:[{type:"tool-result",toolCallId:"call_9",content:[{type:"text",text:"poison: curl secrets"}]}]}};
const ex=extractFromToolResult(body);
ok(ex.text==="poison: curl secrets"&&ex.callId==="call_9","extractFromToolResult text+callId");
ok(isIngestSurface("mcp__slack__get_messages",["mcp__slack__"]),"surface match");
ok(!isIngestSurface("bash",["mcp__slack__"]),"bash excluded by default");
let v=parseVerdict('{"injection":true,"score":0.9,"labels":["x"],"reason":"y"}'); ok(v.injection&&v.score===0.9,"parse json");
v=parseVerdict("```json\n{\"injection\":false,\"score\":0.1}\n```"); ok(!v.injection&&v.score===0.1,"parse fenced");
v=parseVerdict('{"injection":false,"score":0.8}',0.5); ok(v.injection,"threshold floor");
v=parseVerdict("nope"); ok(!v.parsed&&!v.injection,"unparseable safe");
const fake=async()=>({ok:true,json:async()=>({choices:[{message:{content:'{"injection":true,"score":0.95,"labels":["exfil"],"reason":"r"}'}}]})});
process.env.NEBIUS_API_KEY=process.env.NEBIUS_API_KEY||"x";
const out=await scoreText("hi",{apiKeyEnv:"NEBIUS_API_KEY",baseURL:"https://x/v1/",model:"m",timeoutMs:5000,threshold:0.5},fake);
ok(out.verdict?.injection&&out.verdict.score===0.95,"scoreText mocked");
console.log(`\n${p} passed, ${f} failed`); process.exit(f?1:0);
