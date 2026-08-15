/* ==========================================================
   MICHI (道) — JOURNEY PRESENTATION LAYER
   Keeps the mature local-first travel engine intact while giving every
   user-facing surface a coherent Michi identity and navigation system.
   ========================================================== */
"use strict";

const MICHI_UI_VERSION = "1.0.1";
const MICHI_NAME = "Michi";

(function bootMichiPresentation(){
  const $=(s,r=document)=>r.querySelector(s);

  function replaceMichiText(value){
    if(value==null)return value;
    return String(value)
      .replace(/Michi's local trip data/gi,"Michi's local trip data")
      .replace(/Michi couldn't/gi,"Michi couldn't")
      .replace(/Michi won't/gi,"Michi won't")
      .replace(/Michi is ready/gi,"Michi is ready")
      .replace(/Michi section/gi,"Michi section")
      .replace(/Explore Michi/gi,"Explore Michi")
      .replace(/Install Michi/gi,"Install Michi")
      .replace(/Reload Michi/gi,"Reload Michi")
      .replace(/local Michi data/gi,"local Michi data")
      .replace(/personal Michi data/gi,"personal Michi data")
      .replace(/valid Michi backup/gi,"valid Michi backup")
      .replace(/Michi backup/gi,"Michi backup")
      .replace(/Michi's travel workflow/gi,"Michi's travel workflow")
      .replace(/Let Michi randomly pick/gi,"Let Michi choose a path")
      .replace(/Let Michi pick/gi,"Let Michi choose")
      .replace(/Personalize Michi/gi,"Personalize Michi")
      .replace(/while Michi is open/gi,"while Michi is open")
      .replace(/Opening Michi/gi,"Opening Michi")
      .replace(/ICHIGO RECOVERY/gi,"MICHI RECOVERY")
      .replace(/EXPLORE ICHIGO/gi,"EXPLORE MICHI")
      .replace(/\bIchigo\b/g,"Michi")
      .replace(/\bichigo\b/g,"michi")
      .replace(/Plan sweet little adventures\.?/gi,"Follow the path from idea to memory.")
      .replace(/sweet little adventures/gi,"your next journey")
      .replace(/Let's plan something sweet!/gi,"Where will the path take you?")
      .replace(/a sweet little memory/gi,"a journey to remember")
      .replace(/✦ Today's itinerary/g,"✦ Today's route")
      .replace(/New trip created ✦/g,"New trip created ✦")
      .replace(/Welcome to Michi ✦/g,"Welcome to Michi ✦")
      .replace(/You are here ✦/g,"You are here ✦");
  }

  function replaceSystemMotifs(root=document){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const parent=node.parentElement;
      if(!parent||/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/i.test(parent.tagName))return NodeFilter.FILTER_REJECT;
      const text=node.nodeValue||"";
      if(text.trim()==="✦")return NodeFilter.FILTER_ACCEPT;
      if(/DAY\s+\d+.*✦|You are here ✦|Welcome to Michi ✦|New trip created ✦/.test(text))return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_REJECT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const text=node.nodeValue||"";
      node.nodeValue=text.trim()==="✦"?text.replace("✦","✦"):text.replace(/✦/g,"✦");
    });
  }

  function rebrandVisible(root=document){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const p=node.parentElement;
      if(!p||/^(SCRIPT|STYLE|TEXTAREA|OPTION)$/i.test(p.tagName))return NodeFilter.FILTER_REJECT;
      return /ichigo|sweet little adventures|plan something sweet|✦ Today's itinerary/i.test(node.nodeValue||"")?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{n.nodeValue=replaceMichiText(n.nodeValue)});
    root.querySelectorAll?.('[aria-label*="Michi" i],[title*="Michi" i]').forEach(el=>{
      if(el.hasAttribute("aria-label"))el.setAttribute("aria-label",replaceMichiText(el.getAttribute("aria-label")));
      if(el.hasAttribute("title"))el.setAttribute("title",replaceMichiText(el.getAttribute("title")));
    });
    replaceSystemMotifs(root);
  }

  const navSvg={
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.2 12 4l8 7.2v8.1a.7.7 0 0 1-.7.7H14v-5.4h-4V20H4.7a.7.7 0 0 1-.7-.7z"/></svg>',
    plan:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5 9.5 4l5 1.5L19 4v14.5L14.5 20l-5-1.5L5 20zM9.5 4v14.5M14.5 5.5V20"/></svg>',
    today:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="m14.8 9.2-1.7 4-4 1.7 1.7-4z"/></svg>',
    spend:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h14v10H5z"/><path d="M5 10h14M8 15h3"/></svg>',
    together:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="3"/><circle cx="16.5" cy="10" r="2.4"/><path d="M3.5 19c.7-3.1 2.7-4.7 5.5-4.7s4.8 1.6 5.5 4.7M14.1 15.3c2.8-.7 5.1.7 5.9 3.7"/></svg>',
    trip:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/></svg>'
  };

  /* Public Michi alias. The inherited name remains available only because
     older engine code still reads it; this avoids destructive data rewrites. */
  if(window.ICHIGO_DATA){
    window.MICHI_DATA=window.ICHIGO_DATA;
    if(Array.isArray(window.MICHI_DATA.themePresets)){
      const themeNames={strawberry:"Sakura Path",lavender:"Lavender Dusk",peach:"Peach Trail",matcha:"Sage Journey",blueberry:"Blue Hour"};
      window.MICHI_DATA.themePresets.forEach(x=>{if(themeNames[x.id])x.label=themeNames[x.id]});
    }
  }

  /* Remove legacy fruit language from route metadata without changing route IDs. */
  try{
    const routeIcons={today:"◇",smart:"↝",foodpassport:"🍽️",home:"⌂"};
    ROUTES_V8.forEach(route=>{if(routeIcons[route.id])route.icon=routeIcons[route.id]});
    BOTTOM_TAB_OPTIONS_V8.forEach(item=>{if(routeIcons[item.id])item.icon=routeIcons[item.id]});
    if(PLAN_META_V8.smart)PLAN_META_V8.smart=["↝","Smart Planner","Arrange saved places into a smoother path for the day."];
    if(PLAN_META_V8.jar)PLAN_META_V8.jar=["🎲","Adventure Jar","Pick from the places and ideas you already saved."];
    if(TRIP_META_V8.foodpassport)TRIP_META_V8.foodpassport=["🍽️","Food Passport","Collect foods and places you actually tried."];
    if(TRIP_META_V8.settings)TRIP_META_V8.settings=["⚙️","Settings","Personalize Michi and manage your travel data."];
  }catch(error){console.warn("Michi route metadata could not be refreshed",error)}

  /* Translate user-facing system messages without rewriting stored trip data. */
  if(typeof notify==="function"){
    const baseNotify=notify;
    notify=function michiNotify(message){return baseNotify(replaceMichiText(message))};
  }
  if(typeof download==="function"){
    const baseDownload=download;
    download=function michiDownload(name,text){return baseDownload(String(name).replace(/ichigo/gi,"michi"),text)};
  }
  const nativeAlert=window.alert.bind(window);
  const nativeConfirm=window.confirm.bind(window);
  window.alert=message=>nativeAlert(replaceMichiText(message));
  window.confirm=message=>nativeConfirm(replaceMichiText(message));

  if(typeof aboutIchigoCardV74==="function"){
    aboutIchigoCardV74=function aboutMichiCard(compact=false){
      return `<section class="card michi-about ${compact?"compact":""}">
        <div class="michi-about-head"><img src="./icons/icon-192-v42.png" alt=""><div><strong>Michi</strong><small>道 · road, path, way</small></div></div>
        <p>Michi means ‘road,’ ‘path,’ or ‘way’ in Japanese. It fits a travel app built around discovering places, planning where to go next, and keeping every step of the journey together.</p>
      </section>`;
    };
  }

  if(typeof tripTemplateFormV4==="function"){
    const baseTripTemplateForm=tripTemplateFormV4;
    tripTemplateFormV4=function michiTripTemplateForm(templateId="blank"){
      if(templateId!=="blank")return replaceMichiText(baseTripTemplateForm(templateId));
      return `<form id="tripTemplateCreateFormV4" data-template-id="blank" class="form-grid">
        <div class="notice-card"><span class="notice-icon">↝</span><span><strong>Start with a blank path</strong><p>Nothing is added until you choose it yourself.</p></span></div>
        <div class="form-row"><label>TRIP NAME</label><input name="title" required placeholder="My next trip"></div>
        <div class="form-row"><label>DESTINATION</label><input name="destination" required placeholder="Where are you going?"></div>
        <div class="form-row two"><div><label>START</label><input name="startDate" type="date" required></div><div><label>END</label><input name="endDate" type="date" required></div></div>
        <div class="form-row two"><div><label>TRIP ICON</label><input name="countryEmoji" value="✈️" aria-label="Trip icon"></div><div><label>CURRENCY</label><select name="baseCurrency">${currencyOptions(state.settings.defaultTripCurrency)}</select></div></div>
        <button class="btn primary">Create empty trip</button>
      </form>`;
    };
  }

  function routeExists(id){try{return !!routeByIdV8(id)}catch{return false}}
  function drawerRow(route,noTrip=false){
    if(!route)return"";
    const active=!noTrip&&typeof routeActiveV8==="function"&&routeActiveV8(route);
    const pinned=!noTrip&&(state.settings?.drawerPinsV8||[]).includes(route.id);
    const action=noTrip?"navigate-explore-route-v91":"navigate-route-v8";
    return `<div class="drawer-route-row-v8 ${active?"active":""}">
      <button class="drawer-route-v8" data-action="${action}" data-route="${route.id}"><span>${route.icon}</span><strong>${esc(route.label)}</strong></button>
      ${noTrip?"":`<button class="drawer-pin-v8 ${pinned?"pinned":""}" data-action="toggle-drawer-pin-v8" data-route="${route.id}" aria-label="${pinned?"Unpin":"Pin"} ${esc(route.label)}">${pinned?"★":"☆"}</button>`}
    </div>`;
  }

  const drawerGroups=[
    {label:"Journey",icon:"↝",open:true,ids:["home","today"]},
    {label:"Plan & organize",icon:"⌁",open:true,ids:["itinerary","smart","dayboard","places","map","reservationboard","bookings","checklists","packing","before","lists","inbox","notes","timezones","essentials"]},
    {label:"Money",icon:"◉",ids:["budget","expenses","analytics","converter","split"]},
    {label:"Remember",icon:"◇",ids:["journal","timeline","food","highlights","visited","scrapbook","recap"]},
    {label:"Discover & play",icon:"✦",ids:["jar","backup","neighborhoods","bingo","photomissions","foodpassport","stamps","capsule","awards","achievements"]},
    {label:"Trip & app",icon:"○",ids:["together","health","stats","info","offline","storage","settings"]}
  ];

  function drawerGroupsHTML(noTrip=false){
    return drawerGroups.map(group=>{
      const routes=group.ids.filter(routeExists).map(routeByIdV8);
      if(!routes.length)return"";
      return `<details class="michi-drawer-group" ${group.open?"open":""}><summary><span>${group.icon}</span>${group.label}</summary><div class="michi-drawer-group-body">${routes.map(r=>drawerRow(r,noTrip)).join("")}</div></details>`;
    }).join("");
  }

  drawerHTMLV8=function michiDrawerHTML(){
    const hasTrip=!!(state.trips||[]).length;
    const pins=hasTrip?(state.settings.drawerPinsV8||[]).map(routeByIdV8).filter(Boolean):[];
    return `<div class="drawer-backdrop-v8 ${drawerOpenV8?"open":""}" data-action="close-drawer-v8"></div>
      <aside class="drawer-v8 ${drawerOpenV8?"open":""}" aria-label="Michi menu">
        <div class="drawer-head-v8">
          <img src="./icons/icon-192-v42.png" alt="">
          <div><strong>michi · 道</strong><small>${hasTrip?esc(trip().title):"Find your next path"}</small></div>
          <button class="icon-btn" data-action="close-drawer-v8" aria-label="Close menu">✕</button>
        </div>
        <div class="drawer-utilities-v8">
          ${hasTrip?'<button data-action="open-search-v3">⌕ Search</button><button data-action="open-quick-add">＋ Quick Add</button>':'<button data-action="navigate-explore-route-v91" data-route="home">⌂ Explore</button><button data-action="new-trip">＋ Create Trip</button>'}
        </div>
        <div class="drawer-scroll-v8">
          <div class="michi-drawer-intro"><span class="michi-waypoint">✦</span><div><strong>${hasTrip?"Your journey, one path":"Explore before you plan"}</strong><p>${hasTrip?"Plan it → Live it → Remember it":"Nothing is pre-filled. Open any section to see how Michi works."}</p></div></div>
          ${pins.length?`<section class="drawer-group-v8"><h3>★ Pinned</h3>${pins.map(r=>drawerRow(r,false)).join("")}</section>`:""}
          ${drawerGroupsHTML(!hasTrip)}
          ${typeof aboutIchigoCardV74==="function"?aboutIchigoCardV74(true):""}
        </div>
        <div class="drawer-footer-v8">
          <button data-action="show-whats-new-v74">What’s New</button><button data-action="install-app">Install</button>
          <span>${navigator.onLine?"● Online":"○ Offline"} · local-first</span>
        </div>
      </aside>`;
  };

  renderBottomNavV8=function michiBottomNav(){
    const nav=$("#bottomNavV8")||$(".bottom-nav");if(!nav)return;
    ensureStateV8();
    let ids=(state.settings.bottomTabsV8||[]).filter(id=>BOTTOM_TAB_OPTIONS_V8.some(x=>x.id===id));
    if(ids.length<3)ids=["home","plan","today","spend","trip"];
    ids=ids.slice(0,5);
    nav.style.setProperty("--tab-count",ids.length);
    nav.innerHTML=ids.map(id=>{
      const item=BOTTOM_TAB_OPTIONS_V8.find(x=>x.id===id);if(!item)return"";
      const active=state.currentView===id;
      return `<button class="nav-item ${id==="today"?"today-nav":""} ${active?"active":""}" data-nav="${id}" aria-label="${esc(item.label)}" ${active?'aria-current="page"':""}><span class="michi-nav-icon">${navSvg[id]||`<span>${item.icon}</span>`}</span><small>${esc(item.label)}</small></button>`;
    }).join("");
  };

  /* New name explanation and release note. */
  if(typeof showWhatsNewV74==="function" && typeof openModal==="function"){
    showWhatsNewV74=function showMichiWhatsNew(){
      openModal("What’s New",`<div class="michi-about"><div class="michi-about-head"><img src="./icons/icon-192-v42.png" alt=""><div><strong>Michi has a new path.</strong><small>Complete identity redesign</small></div></div><p>The app now uses Michi’s journey-inspired design across navigation, planning, Today Mode, money, memories, menus, settings, empty states and offline surfaces. Your existing local trip data stays in place.</p></div>`);
    };
  }

  /* Wrap the mature renderer instead of replacing feature logic. This keeps
     CRUD, maps, media, backups, Today timing and all existing routes intact. */
  const engineRender=render;
  render=function renderMichi(){
    const result=engineRender();
    document.documentElement.dataset.app="michi";
    document.title="Michi 道";
    renderBottomNavV8();
    renderDrawerV8();
    rebrandVisible($("#mainView"));
    rebrandVisible($("#drawerRootV8"));
    rebrandVisible($("#appUpdateHost"));
    $("#mainView")?.classList.add(`michi-view-${state.currentView||"home"}`);
    return result;
  };

  /* Modals are created after the main renderer. Rebrand only the modal's UI
     text when it opens; stored values/inputs are never rewritten. */
  if(typeof modal==="function"){
    const baseModal=modal;
    modal=function michiModal(title,html,...rest){
      const out=baseModal(replaceMichiText(title),replaceMichiText(html),...rest);
      rebrandVisible($("#modalRoot"));
      return out;
    };
  }

  /* Some later builds call openModal instead of modal. */
  if(typeof openModal==="function"){
    const baseOpenModal=openModal;
    openModal=function michiOpenModal(title,html,...rest){
      const out=baseOpenModal(replaceMichiText(title),replaceMichiText(html),...rest);
      rebrandVisible($("#modalRoot"));
      return out;
    };
  }

  /* Keep the update experience explicit: never refresh while the user edits. */
  navigator.serviceWorker?.addEventListener("message",event=>{
    if(event.data?.type!=="MICHI_SW_ACTIVATED")return;
    rebrandVisible($("#appUpdateHost"));
  });

  /* One click can open a modal or route without running a continuous observer. */
  document.addEventListener("click",()=>{
    requestAnimationFrame(()=>{
      rebrandVisible($("#modalRoot"));
      rebrandVisible($("#toastRoot"));
      rebrandVisible($("#drawerRootV8"));
    });
  },{passive:true});

  document.addEventListener("change",()=>requestAnimationFrame(()=>rebrandVisible($("#modalRoot"))),{passive:true});

  window.__MICHI_BOOT_COMPLETE=true;
  try{render()}catch(error){
    console.error("Michi presentation startup failed",error);
    window.__MICHI_BOOT_ERROR=error;
    showMichiBootRecovery(error);
  }
})();
