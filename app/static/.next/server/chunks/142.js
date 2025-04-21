"use strict";exports.id=142,exports.ids=[142],exports.modules={1373:(e,a,r)=>{r.d(a,{Z:()=>createLucideIcon});var t=r(6689);/**
 * @license lucide-react v0.501.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let toKebabCase=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),toCamelCase=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,r)=>r?r.toUpperCase():a.toLowerCase()),toPascalCase=e=>{let a=toCamelCase(e);return a.charAt(0).toUpperCase()+a.slice(1)},mergeClasses=(...e)=>e.filter((e,a,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===a).join(" ").trim(),hasA11yProp=e=>{for(let a in e)if(a.startsWith("aria-")||"role"===a||"title"===a)return!0};/**
 * @license lucide-react v0.501.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var s={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.501.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,t.forwardRef)(({color:e="currentColor",size:a=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:l="",children:i,iconNode:d,...c},n)=>(0,t.createElement)("svg",{ref:n,...s,width:a,height:a,stroke:e,strokeWidth:o?24*Number(r)/Number(a):r,className:mergeClasses("lucide",l),...!i&&!hasA11yProp(c)&&{"aria-hidden":"true"},...c},[...d.map(([e,a])=>(0,t.createElement)(e,a)),...Array.isArray(i)?i:[i]])),createLucideIcon=(e,a)=>{let r=(0,t.forwardRef)(({className:r,...s},l)=>(0,t.createElement)(o,{ref:l,iconNode:a,className:mergeClasses(`lucide-${toKebabCase(toPascalCase(e))}`,`lucide-${e}`,r),...s}));return r.displayName=toPascalCase(e),r}},6330:(e,a,r)=>{r.d(a,{Z:()=>s});var t=r(1373);let s=(0,t.Z)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]])},6841:(e,a,r)=>{r.d(a,{Z:()=>s});var t=r(1373);let s=(0,t.Z)("inbox",[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12",key:"o97t9d"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}]])},4933:(e,a,r)=>{r.d(a,{Z:()=>s});var t=r(1373);let s=(0,t.Z)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])}};