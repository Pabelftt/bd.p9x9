const container = document.getElementById("videoContainer");
const loadMoreBtn = document.getElementById("loadMore");

// 🔥 গুরুত্বপূর্ণ: এই ফাইলের নাম
const currentFile = "jannat.html";

// নিজেরটা বাদ দাও
let filteredVideos = videos.filter(v => v.fileName !== currentFile);

// newest 5
const newestFive = filteredVideos.slice(-5).reverse();

// বাকি গুলো shuffle করে নাও
let remainingVideos = filteredVideos.slice(0, -5).sort(() => Math.random() - 0.5);

let currentIndex = 0;
const loadLimit = 30;

function createCard(video) {
  const card = document.createElement("div");
  card.className = "card";

  // root থেকে image load হবে
  card.innerHTML = `
    <img src="${video.imageLink}" alt="">
    <h3>${video.title}</h3>
  `;

  card.onclick = () => {
    window.location.href = video.fileName;
  };

  container.appendChild(card);
}

// 1️⃣ newest 5 card
newestFive.forEach(createCard);

// 2️⃣ load next batch
function loadMore() {
  const nextVideos = remainingVideos.slice(currentIndex, currentIndex + loadLimit);
  nextVideos.forEach(createCard);
  currentIndex += loadLimit;

  if (currentIndex >= remainingVideos.length) {
    loadMoreBtn.style.display = "none";
  }
}

// প্রথম 30 auto load
loadMore();

loadMoreBtn.addEventListener("click", loadMore);
