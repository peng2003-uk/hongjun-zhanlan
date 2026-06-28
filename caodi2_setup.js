const fs = require('fs');
let c = fs.readFileSync('exhibition.html', 'utf8');

// === 1. Global fallback: add not(:has(.caodi2-theater)) ===
c = c.replace(
  ':not(:has(.caodi-theater))',
  ':not(:has(.caodi-theater)):not(:has(.caodi2-theater))'
);

// === 2. #sceneContainer rules ===
c = c.replace(
  '.theme-scene-3 #sceneContainer:has(.caodi-theater)',
  '.theme-scene-3 #sceneContainer:has(.caodi-theater), .theme-scene-3 #sceneContainer:has(.caodi2-theater)'
);

// === 3. Insert caodi2-theater CSS before caodi-theater block ===
const caodi2CSS = `
        /* ================================================================
           方案：草地顽疾剧场 — 双档案框+照片横条居中
           ================================================================ */
        .caodi2-theater { position: relative; width: 100%; height: calc(100vh - 48px); display: flex; flex-direction: column; justify-content: flex-start; padding: 3vh 3vw 1.5vh 3vw; overflow: hidden; background: #2A3F28; }

        .caodi2-theater .theater-bg-silhouette {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            z-index: 0;
            background-image: url('images/草地顽疾剪影.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 1;
        }
        .caodi2-theater .theater-bg-silhouette::after { display: none; }
        .caodi2-theater .theater-smoke-lens { display: none; }

        .caodi2-theater .theater-stage { position: relative; width: 100%; flex: 1 1 auto; min-height: 0; display: flex; gap: 3vw; z-index: 3; }

        .caodi2-theater .theater-story { width: 35%; height: 100%; background: rgba(90,88,85,0.52); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
            color: #e8e0d0; border: 1px solid rgba(140,155,130,0.35); border-radius: 12px 8px 12px 8px; box-shadow: 0 8px 36px rgba(0,0,0,0.20), 0 2px 12px rgba(0,0,0,0.10); padding: 4vh 2.2vw; display: flex; flex-direction: column; overflow-y: auto; animation: diarySlideIn 0.9s cubic-bezier(0.25, 1, 0.5, 1) forwards; opacity: 0; }
        .caodi2-theater .theater-story::-webkit-scrollbar { width: 4px; }
        .caodi2-theater .theater-story::-webkit-scrollbar-track { background: transparent; }
        .caodi2-theater .theater-story::-webkit-scrollbar-thumb { background: rgba(180,175,170,0.25); border-radius: 2px; }
        .caodi2-theater .theater-story .story-inner-header { margin-bottom: 2.5vh; }
        .caodi2-theater .theater-story .story-inner-header .unit-tag { font-size: 0.6rem; letter-spacing: 5px; opacity: 0.65; color: #D8705A; display: block; margin-bottom: 4px; }
        .caodi2-theater .theater-story .story-inner-header h3 { font-family: var(--font-title); font-size: 1.6rem; color: #D8604A; letter-spacing: 3px; margin: 0; text-shadow: none; }
        .caodi2-theater .theater-story .story-inner-header .page-type-tag { display: inline-block; font-size: 0.5rem; letter-spacing: 3px; padding: 2px 12px; border-radius: 20px; background: rgba(216,96,74,0.10); color: #D8705A; margin-top: 6px; border: 1px solid rgba(216,96,74,0.14); }
        .caodi2-theater .theater-story .narrative { font-size: 0.92rem; line-height: 2.2; color: #e8e0d0; }
        .caodi2-theater .theater-story .narrative .narr-block .speaker { color: #D8705A; border-left-color: #D8604A; }
        .caodi2-theater .theater-story .narrative .dialogue { border-left-color: #D8604A; background: linear-gradient(90deg, rgba(216,96,74,0.10) 0%, rgba(216,96,74,0.02) 100%); color: #D0C8B8; }
        .caodi2-theater .theater-story .narrative .dialogue .who { color: #E0806A; }
        .caodi2-theater .theater-story .continue-hint { color: #A09080; border-color: rgba(200,190,180,0.20); }
        .caodi2-theater .theater-story .continue-hint:hover { border-color: #D8604A; color: #D8705A; }

        .caodi2-theater .theater-evidence { width: 65%; height: 100%; display: flex; flex-direction: column; gap: 1.5vh; overflow-y: auto; padding-right: 4px; animation: stageSlideIn 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.2s forwards; opacity: 0; }
        .caodi2-theater .theater-evidence::-webkit-scrollbar { width: 3px; }
        .caodi2-theater .theater-evidence::-webkit-scrollbar-track { background: transparent; }
        .caodi2-theater .theater-evidence::-webkit-scrollbar-thumb { background: rgba(180,175,170,0.20); border-radius: 2px; }

        .caodi2-theater .archive-box { background: rgba(90,88,85,0.48); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(140,155,130,0.30); border-radius: 8px; padding: 2.5vh 2vw; flex-shrink: 0; }
        .caodi2-theater .archive-box .archive-head { font-size: 1.05rem; color: #D8705A; font-weight: 600; text-align: center; margin-bottom: 1.5vh; letter-spacing: 3px; border-bottom: 1px solid rgba(216,96,74,0.15); padding-bottom: 1vh; }
        .caodi2-theater .archive-box .archive-body { font-size: 0.82rem; line-height: 1.9; color: #D0C8B8; text-align: justify; }

        .caodi2-theater .theater-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; flex-shrink: 0; padding: 0 2px; }
        .caodi2-theater .theater-photo-grid .grid-photo { aspect-ratio: 4/3; background-size: cover; background-position: center; border-radius: 6px; border: 2px solid rgba(140,155,130,0.20); cursor: pointer; transition: transform 0.3s ease, border-color 0.3s ease; filter: sepia(0.15) brightness(0.78); position: relative; overflow: hidden; }
        .caodi2-theater .theater-photo-grid .grid-photo:hover { transform: scale(1.05); border-color: rgba(216,96,74,0.45); box-shadow: 0 4px 16px rgba(0,0,0,0.30); filter: sepia(0) brightness(1); z-index: 2; }
        .caodi2-theater .theater-photo-grid .grid-photo .photo-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.55); color: #c0b8a8; font-size: 0.38rem; padding: 2px 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .caodi2-theater .theater-passage-wrap { position: relative; z-index: 4; display: flex; justify-content: center; padding-top: 1.5vh; }
        .caodi2-theater .theater-passage-btn { position: relative; width: 100%; max-width: 650px; height: 50px; background: rgba(90,88,85,0.80); border: 1px solid rgba(216,96,74,0.25); font-family: var(--font-text); font-size: 1rem; font-weight: 600; color: #D8705A; letter-spacing: 4px; cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: transform 0.4s, border-color 0.3s, color 0.3s; box-shadow: 0 8px 28px rgba(0,0,0,0.25); }
        .caodi2-theater .theater-passage-btn::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle, rgba(216,96,74,0.12) 0%, transparent 70%); animation: emberBreathing 3.5s infinite ease-in-out; pointer-events: none; }
        .caodi2-theater .theater-passage-btn:hover { color: #E0806A; border-color: rgba(216,96,74,0.55); transform: translateY(2px) scale(0.995); }
        .caodi2-theater .theater-passage-btn::after { content: ''; position: absolute; bottom: 0; left: -100%; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #D8604A, #B8433A, transparent); transition: none; pointer-events: none; }
        .caodi2-theater .theater-passage-btn:hover::after { left: 100%; transition: all 0.9s linear; }
        .caodi2-theater .scene-guide { display: none; }

        @media (max-width: 1024px) {
            .caodi2-theater { padding: 2vh 2vw 2vh 2vw; }
            .caodi2-theater .theater-stage { flex-direction: column; gap: 20px; }
            .caodi2-theater .theater-story { width: 100%; height: auto; max-height: 40vh; padding: 3vh 3vw; }
            .caodi2-theater .theater-evidence { width: 100%; flex: 1; min-height: 0; overflow-y: visible; }
            .caodi2-theater .theater-photo-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; }
        }
        @media (max-width: 640px) {
            .caodi2-theater { padding: 1.5vh 10px 1.5vh 10px; }
            .caodi2-theater .theater-stage { gap: 14px; }
            .caodi2-theater .theater-story { max-height: 35vh; padding: 2.5vh 16px; }
            .caodi2-theater .theater-story .story-inner-header h3 { font-size: 1.3rem; }
            .caodi2-theater .theater-story .narrative { font-size: 0.85rem; line-height: 2.0; }
            .caodi2-theater .theater-photo-grid { grid-template-columns: repeat(2, 1fr); gap: 4px; }
            .caodi2-theater .archive-box { padding: 2vh 16px; }
            .caodi2-theater .archive-box .archive-head { font-size: 0.9rem; }
            .caodi2-theater .archive-box .archive-body { font-size: 0.75rem; }
            .caodi2-theater .theater-passage-btn { font-size: 0.85rem; letter-spacing: 2px; height: 44px; }
        }`;

const caodiCSS = '/* ================================================================\n           方案：茫茫松潘草地剧场';
c = c.replace(caodiCSS, caodi2CSS + '\n' + caodiCSS);

// === 4. Add isCaodi2 to rendering ===
c = c.replace(
  "const isLuding=td.theaterClass==='luding-theater'||td.theaterClass==='xueling-theater'||td.theaterClass==='caodi-theater';const isJiajinshan=td.theaterClass==='jiajinshan-theater';",
  "const isLuding=td.theaterClass==='luding-theater'||td.theaterClass==='xueling-theater'||td.theaterClass==='caodi-theater';const isCaodi2=td.theaterClass==='caodi2-theater';const isJiajinshan=td.theaterClass==='jiajinshan-theater';"
);

// === 5. Add caodi2 rendering in JS - after chishui block, add caodi2 ===
const chishuiBlockEnd = "html+=`</div></div><div class=\"theater-passage-wrap\"><button class=\"theater-passage-btn\" data-next=\"${data.next||''}\">${td.buttonText||'继续征途'}</button></div></div>`;}";
const caodi2Render = "else if(isCaodi2){html+=`<div class=\"theater-evidence\">`;html+=`<div class=\"archive-box\"><h3 class=\"archive-head\">${td.boardTitle1||''}</h3><div class=\"archive-body\"><p>${td.boardText1||''}</p></div></div>`;if(td.photos&&td.photos.length){html+=`<div class=\"theater-photo-grid\">`;td.photos.forEach(p=>{html+=`<div class=\"grid-photo\" style=\"background-image:url('${p.src}');\" data-desc=\"${p.label}\"><span class=\"photo-label\">${p.label}</span></div>`;});html+=`</div>`;}html+=`<div class=\"archive-box\"><h3 class=\"archive-head\">${td.boardTitle2||''}</h3><div class=\"archive-body\"><p>${td.boardText2||''}</p></div></div>`;html+=`</div></div><div class=\"theater-passage-wrap\"><button class=\"theater-passage-btn\" data-next=\"${data.next||''}\">${td.buttonText||'继续征途'}</button></div></div>`;}";

c = c.replace(chishuiBlockEnd, chishuiBlockEnd + caodi2Render);

fs.writeFileSync('exhibition.html', c, 'utf8');
console.log('CSS + JS changes done');
