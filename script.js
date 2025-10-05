const lectureContainer = document.getElementById('lecture-container');
const searchBox = document.getElementById('searchBox');
const playerModal = document.getElementById('playerModal');
const playerFrame = document.getElementById('playerFrame');
const pdfOpen = document.getElementById('pdfOpen');
const quoteBox = document.getElementById('quoteBox');
const submitBtn = document.getElementById('submitBtn');
const answerBox = document.getElementById('answer');
const submitMessage = document.getElementById('submitMessage');

let playlist = { videos: [], pdfs: [] };

// Load playlist.json
fetch('playlist.json')
  .then(res => res.json())
  .then(data => {
    playlist = data;
    renderLectures(playlist);
  })
  .catch(err => console.error("Failed to load playlist:", err));

function renderLectures(data) {
  lectureContainer.innerHTML = '';
  data.videos.forEach(video => {
    const pdf = data.pdfs.find(p => p.title === video.title);
    const div = document.createElement('div');
    div.className = 'lecture-box';
    div.innerHTML = `<strong>${video.title.replace(/_/g,' ')}</strong>`;
    div.onclick = () => openPlayer(video.link, pdf?.link);
    lectureContainer.appendChild(div);
  });
}

function openPlayer(videoLink, pdfLink) {
  if (!videoLink) { alert('Video link not available'); return; }
  playerFrame.src = videoLink;
  pdfOpen.href = pdfLink || '#';
  playerModal.style.display = 'flex';
}

function closePlayer(event) {
  playerModal.style.display = 'none';
  playerFrame.src = '';
}

// Search functionality
searchBox.addEventListener('input', () => {
  const query = searchBox.value.toLowerCase();
  lectureContainer.childNodes.forEach(box => {
    box.style.display = box.innerText.toLowerCase().includes(query) ? 'block' : 'none';
  });
});

// Random quotes
const quotes = [
  "Keep learning!", "B2GPT rocks!", "Knowledge is power!", "Study smart, not hard!"
];
setInterval(() => {
  quoteBox.innerText = quotes[Math.floor(Math.random()*quotes.length)];
}, 5000);

// Must drop message submission
submitBtn.addEventListener('click', () => {
  const msg = answerBox.value.trim();
  if (!msg) { alert('Type something!'); return; }
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(msg)}`)
    .then(()=> { submitMessage.innerText = "✅ join approval soon!"; answerBox.value = ''; })
    .catch(()=> submitMessage.innerText = "❌ Submission Failed!");
});
