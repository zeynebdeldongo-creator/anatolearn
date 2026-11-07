const state = {
  questions: [],
  filteredQuestions: [],
  currentIndex: 0,
  selectedOptionId: null,
  checked: false,
  answers: [],
  currentView: "home"
};

const views = {
  home: "homeView",
  boards: "boardsView",
  circulation: "circulationView",
  heart: "heartView",
  quiz: "quizView",
  atlas: "atlasView"
};

const boardDefinitions = [
  {name:"Hareket Sistemi",desc:"Kemikler, eklemler ve kaslar",icon:"⌁",active:false},
  {name:"Dolaşım Sistemi",desc:"Kalp, damarlar ve lenfatik sistem",icon:"♡",active:true},
  {name:"Solunum Sistemi",desc:"Solunum yolları ve akciğerler",icon:"◉",active:false},
  {name:"Sindirim Sistemi",desc:"Sindirim kanalı ve yardımcı organlar",icon:"◌",active:false},
  {name:"Ürogenital Sistem",desc:"Üriner ve genital sistem",icon:"⌂",active:false},
  {name:"Sinir Sistemi",desc:"Merkezi ve periferik sinir sistemi",icon:"✳",active:false},
  {name:"Endokrin Sistem",desc:"Endokrin bezler ve hormonlar",icon:"◇",active:false},
  {name:"Baş-Boyun ve Duyu",desc:"Baş, boyun ve duyu organları",icon:"⌖",active:false}
];

const $ = (selector) => document.querySelector(selector);

function renderBoardCards(container) {
  const grid = $(container);
  grid.innerHTML = boardDefinitions.map((board) => `
    <a class="board-card ${board.active ? "active-board" : "disabled-board"}"
       ${board.active ? 'href="#circulation"' : 'href="#boards" aria-disabled="true"'}
       ${board.active ? "" : 'data-coming="true"'}>
      <span class="board-icon">${board.icon}</span>
      <h3>${board.name}</h3>
      <p>${board.desc}</p>
      <span class="board-status">${board.active ? "İçeriği keşfet →" : "Yakında"}</span>
    </a>`).join("");
}

function showView(viewName) {
  const target = views[viewName] ? viewName : "home";
  state.currentView = target;
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  $( "#" + views[target]).classList.add("active");
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === target || (target === "circulation" && link.dataset.nav === "boards"));
  });
  $("#mainNav").classList.remove("open");
  $("#mobileMenuButton").setAttribute("aria-expanded", "false");
  window.scrollTo({top:0, behavior:"instant"});
  if (target === "quiz" && state.filteredQuestions.length === 0 && state.questions.length) {
    startQuiz();
  }
}

function routeFromHash() {
  const route = location.hash.replace("#", "") || "home";
  const map = {home:"home",boards:"boards",circulation:"circulation",heart:"heart",quiz:"quiz",atlas:"atlas"};
  showView(map[route] || "home");
}

function setMarker(marker) {
  const line = $("#markerLine");
  const target = $("#markerTarget");
  const sx = marker.start.x * 1000;
  const sy = marker.start.y * 700;
  const ex = marker.end.x * 1000;
  const ey = marker.end.y * 700;
  line.setAttribute("x1", sx);
  line.setAttribute("y1", sy);
  line.setAttribute("x2", ex);
  line.setAttribute("y2", ey);
  target.setAttribute("cx", ex);
  target.setAttribute("cy", ey);
}

function renderQuestion() {
  const question = state.filteredQuestions[state.currentIndex];
  if (!question) return;

  state.selectedOptionId = null;
  state.checked = false;
  $("#questionCounter").textContent = `Soru ${state.currentIndex + 1} / ${state.filteredQuestions.length}`;
  $("#questionCategory").textContent = "Kalp Anatomisi";
  $("#progressFill").style.width = `${(state.currentIndex / state.filteredQuestions.length) * 100}%`;
  $("#questionText").textContent = question.question;

  const image = $("#questionImage");
  image.src = question.image;
  image.alt = question.imageAlt;
  setMarker(question.marker);

  $("#optionList").innerHTML = question.options.map((option) => `
    <button class="option-button" type="button" data-option-id="${option.id}">
      <span class="option-letter">${option.id}</span><span>${option.text}</span>
    </button>`).join("");

  $("#optionList").querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => selectOption(button.dataset.optionId));
  });

  $("#feedback").hidden = true;
  $("#feedback").className = "feedback";
  $("#checkAnswer").hidden = false;
  $("#checkAnswer").disabled = true;
  $("#nextQuestion").hidden = true;
  $("#quizShell").hidden = false;
  $("#quizComplete").hidden = true;
}

function selectOption(optionId) {
  if (state.checked) return;
  state.selectedOptionId = optionId;
  $("#optionList").querySelectorAll(".option-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.optionId === optionId);
  });
  $("#checkAnswer").disabled = false;
}

function checkAnswer() {
  if (!state.selectedOptionId || state.checked) return;
  const question = state.filteredQuestions[state.currentIndex];
  const isCorrect = state.selectedOptionId === question.correctOptionId;
  state.checked = true;
  state.answers[state.currentIndex] = {
    questionId: question.id,
    selectedOptionId: state.selectedOptionId,
    correctOptionId: question.correctOptionId,
    isCorrect
  };

  $("#optionList").querySelectorAll(".option-button").forEach((button) => {
    button.disabled = true;
    if (button.dataset.optionId === question.correctOptionId) button.classList.add("correct");
    if (button.dataset.optionId === state.selectedOptionId && !isCorrect) button.classList.add("incorrect");
  });

  const feedback = $("#feedback");
  feedback.hidden = false;
  feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  feedback.innerHTML = `<strong>${isCorrect ? "✓ Doğru cevap!" : "✕ Yanlış cevap."}</strong>${question.explanation}`;
  $("#checkAnswer").hidden = true;
  $("#nextQuestion").hidden = false;
  $("#nextQuestion").textContent = state.currentIndex === state.filteredQuestions.length - 1 ? "Sonuçları gör →" : "Sonraki soru →";
  $("#progressFill").style.width = `${((state.currentIndex + 1) / state.filteredQuestions.length) * 100}%`;
}

function nextQuestion() {
  if (!state.checked) return;
  if (state.currentIndex < state.filteredQuestions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  const total = state.filteredQuestions.length;
  const correct = state.answers.filter((answer) => answer && answer.isCorrect).length;
  const answered = state.answers.filter(Boolean).length;
  const wrong = answered - correct;
  const blank = total - answered;
  const percentage = total ? Math.round((correct / total) * 100) : 0;

  $("#quizShell").hidden = true;
  const result = $("#quizComplete");
  result.hidden = false;
  result.innerHTML = `
    <div class="complete-icon">✓</div>
    <span class="eyebrow">TEST TAMAMLANDI</span>
    <h2>Harika, çalışmanı tamamladın.</h2>
    <p>Kalp anatomisi görsel tanıma testi sonuçların</p>
    <div class="score-grid">
      <div class="score-card success"><b>${correct}</b><span>Doğru</span></div>
      <div class="score-card"><b>${wrong}</b><span>Yanlış</span></div>
      <div class="score-card"><b>${percentage}%</b><span>Başarı</span></div>
    </div>
    <p>${blank ? `${blank} soruyu cevaplamadın. ` : ""}Başarı yüzdesi doğru cevap sayısının toplam soru sayısına bölünmesiyle hesaplandı.</p>
    <div class="result-review">
      <h3>Cevap değerlendirmesi</h3>
      ${state.filteredQuestions.map((question, index) => {
        const answer = state.answers[index];
        const selected = answer ? question.options.find((option) => option.id === answer.selectedOptionId) : null;
        const correctOption = question.options.find((option) => option.id === question.correctOptionId);
        return `<div class="result-item"><b>${index + 1}. ${question.question}</b><span>${answer ? `Yanıtın: ${selected.text} · ` : "Yanıtlanmadı · "}Doğru cevap: ${correctOption.text}</span></div>`;
      }).join("")}
    </div>
    <div class="hero-actions" style="justify-content:center">
      <button class="button button-primary" id="retryQuiz">Testi yeniden çöz ↻</button>
      <a class="button button-quiet" href="#heart">Konuya dön</a>
    </div>`;
  $("#retryQuiz").addEventListener("click", startQuiz);
  $("#progressFill").style.width = "100%";
}

function startQuiz() {
  const topic = $("#topicFilter").value;
  const difficulty = $("#difficultyFilter").value;
  state.filteredQuestions = state.questions.filter((question) =>
    (topic === "all" || question.topic === topic) &&
    (difficulty === "all" || question.difficulty === difficulty)
  );
  state.currentIndex = 0;
  state.answers = [];
  state.selectedOptionId = null;
  state.checked = false;

  if (!state.filteredQuestions.length) {
    $("#quizShell").hidden = true;
    $("#quizComplete").hidden = false;
    $("#quizComplete").innerHTML = `<h2>Bu filtrelerle soru bulunamadı.</h2><p>Başka bir konu veya zorluk seviyesi seçerek tekrar dene.</p><button class="button button-primary" id="clearFilters">Filtreleri temizle</button>`;
    $("#clearFilters").addEventListener("click", () => {
      $("#topicFilter").value = "all";
      $("#difficultyFilter").value = "all";
      startQuiz();
    });
    return;
  }
  renderQuestion();
}

async function loadQuestions() {
  try {
    const response = await fetch("data/questions.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.questions = await response.json();
    if (!Array.isArray(state.questions) || state.questions.length === 0) {
      throw new Error("Soru verisi boş veya beklenen formatta değil.");
    }
    startQuiz();
  } catch (error) {
    console.error("Soru verileri yüklenemedi:", error);
    $("#quizShell").innerHTML = `<p class="feedback bad">Soru verileri yüklenemedi. Projeyi yerel sunucu üzerinden çalıştırdığından ve data/questions.json dosyasının bulunduğundan emin ol.</p>`;
  }
}

function init() {
  renderBoardCards("#homeBoardGrid");
  renderBoardCards("#allBoardGrid");
  window.addEventListener("hashchange", routeFromHash);
  routeFromHash();

  $("#mobileMenuButton").addEventListener("click", () => {
    const open = $("#mainNav").classList.toggle("open");
    $("#mobileMenuButton").setAttribute("aria-expanded", String(open));
  });
  $("#sidebarToggle").addEventListener("click", () => {
    const sidebar = $("#courseSidebar");
    const content = sidebar.querySelector(".sidebar-content");
    const expanded = content.hidden;
    content.hidden = !expanded;
    $("#sidebarToggle").setAttribute("aria-expanded", String(expanded));
    $("#sidebarToggle b").textContent = expanded ? "−" : "+";
  });
  $("#checkAnswer").addEventListener("click", checkAnswer);
  $("#nextQuestion").addEventListener("click", nextQuestion);
  $("#applyFilters").addEventListener("click", startQuiz);
  loadQuestions();
}

document.addEventListener("DOMContentLoaded", init);
