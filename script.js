/* script.js - frontend logic */

const PLAYLIST_PATH = '../playlist.json'; // adjust if needed when deploying
const quotes = [
  "Keep going — one more lecture a day.",
  "Small steps build big results.",
  "Practice > theory. Try a problem now.",
  "Revision is your secret weapon.",
  "Teach what you learn — solidify knowledge."
];

// Telegram bot placeholders — replace with your values
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

// DOM
const container = document.getElementById('lecture-container');
const searchBox = document.getElementById('searchBox');
const quoteBox = document.getElementById('quoteBox');
const playerModal = document.getElementById('playerModal');
const playerFrame = document.getElementById('playerFrame');
const pdfOpen = document.getElementById('pdfOpen');
const submitBtn = document.getElementById('submitBtn');
const submitMessage = document.getElementById('submitMessage');

// rotating quotes
let qi = 0;
function showQuote(){
  quoteBox.textContent = quotes[qi % quotes.length];
  qi++;
  setTimeout(showQuote, 6000);
}
showQuote();

// load playlist.json
let playlistData = {};
fetch(PLAYLIST_PATH)
  .then(r => r.json())
  .then(data => {
    playlistData = data;
    renderPlaylist(data);
  })
  .catch(err => {
    console.error('playlist load failed', err);
    container.innerHTML = '<p style="opacity:.6">playlist.json not found or invalid — put a valid playlist.json in project root.</p>';
  });

const teacherColors = ['yellow','white','orange','brown','red','blue','purple'];
function randColor() {
  return teacherColors[Math.floor(Math.random() * teacherColors.length)];
}

function renderPlaylist(data){
  container.innerHTML = '';
  for(const cls of Object.keys(data)){
    const clsDiv = document.createElement('div'); clsDiv.className = 'topic'; clsDiv.innerText = `❇️ ${cls} ❇️`;
    const subDiv = document.createElement('div'); subDiv.className = 'subtopic';
    clsDiv.onclick = () => {
      document.querySelectorAll('.subtopic').forEach(s => { if(s !== subDiv) s.style.maxHeight = null; });
      subDiv.style.maxHeight = subDiv.style.maxHeight ? null : subDiv.scrollHeight + 'px';
    };

    const teachers = data[cls];
    for(const teacher of Object.keys(teachers)){
      const teacherBtn = document.createElement('button');
      teacherBtn.className = 'subtopic-btn ' + randColor();
      teacherBtn.innerText = teacher;
      const teacherLinks = document.createElement('div'); teacherLinks.className = 'links';
      teacherBtn.onclick = () => {
        subDiv.querySelectorAll('.links').forEach(l => { if(l !== teacherLinks) l.style.maxHeight = null; });
        teacherLinks.style.maxHeight = teacherLinks.style.maxHeight ? null : teacherLinks.scrollHeight + 'px';
      };
      const chapters = teachers[teacher];
      for(const chapter of Object.keys(chapters)){
        const chapBox = document.createElement('div'); chapBox.className = 'chapter-box';
        chapBox.innerHTML = `<b>${chapter}</b>`;
        const lectures = chapters[chapter];
        lectures.forEach(lec => {
          const vidBtn = document.createElement('button'); vidBtn.className = 'btn video'; vidBtn.innerText = lec.title;
          vidBtn.onclick = () => openPlayer(lec.url, lec.pdf);
          chapBox.appendChild(vidBtn);
          if(lec.pdf){
            const pbtn = document.createElement('button'); pbtn.className = 'btn pdf'; pbtn.innerText = 'PDF';
            pbtn.onclick = (e) => { e.stopPropagation(); window.open(lec.pdf, '_blank'); };
            chapBox.appendChild(pbtn);
          }
        });
        teacherLinks.appendChild(chapBox);
      }
      subDiv.appendChild(teacherBtn);
      subDiv.appendChild(teacherLinks);
    }

    container.appendChild(clsDiv);
    container.appendChild(subDiv);
  }
}

// open player modal (archive.org or direct)
function openPlayer(url, pdf){
  if(!url){ alert('No video URL'); return; }
  let src = url;
  if(url.includes('archive.org') && !url.includes('/embed/')){
    src = url.replace('/details/','/embed/');
  }
  playerFrame.src = src;
  pdfOpen.style.display = pdf ? 'inline-block' : 'none';
  if(pdf) pdfOpen.href = pdf;
  playerModal.style.display = 'flex';
}
function closePlayer(e){ 
  if(e && e.target && e.target !== playerModal) return; 
  playerFrame.src = ''; playerModal.style.display = 'none'; 
}

// search
searchBox.addEventListener('input', () => {
  const q = searchBox.value.trim().toLowerCase();
  document.querySelectorAll('.chapter-box').forEach(box => {
    if(!q){ box.classList.remove('highlight'); box.style.display = ''; return; }
    if(box.innerText.toLowerCase().includes(q)){
      box.style.display = ''; box.classList.add('highlight'); box.scrollIntoView({behavior:'smooth', block:'center'});
    } else {
      box.style.display = 'none'; box.classList.remove('highlight');
    }
  });
});

// submit must-drop msg to Telegram bot
submitBtn.addEventListener('click', () => {
  const text = document.getElementById('answer').value.trim();
  if(!text) { alert('Type a message'); return; }
  if(!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID){ submitMessage.innerText = "Bot token / chat id not configured."; return; }
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(text)}`;
  fetch(url).then(r => {
    if(r.ok){ submitMessage.innerText = '✅ join approval soon!'; document.getElementById('answer').value = ''; }
    else submitMessage.innerText = '❌ failed to send';
  }).catch(e => { submitMessage.innerText = '❌ failed to send'; });
});
