const container = document.getElementById("videoContainer");
const loadMoreBtn = document.getElementById("loadMore");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// আগের logic
const newestFive = videos.slice(-5).reverse();     
let remainingVideos = videos.slice(0, -5);

// shuffle function
function shuffle(array) {    
  return array.sort(() => Math.random() - 0.5);    
}    

remainingVideos = shuffle(remainingVideos);    

let currentIndex = 0;
const loadLimit = 30;

// card create function
function createCard(video) {    
  const card = document.createElement("div");    
  card.className = "card";    

  card.innerHTML = `    
    <img src="${video.imageLink}" alt="${video.title}">    
    <h3>${video.title}</h3>    
  `;    

  card.onclick = () => {    
    window.location.href = "videos/" + video.fileName;    
  };    

  container.appendChild(card);    
}    

// newest 5 দেখাও
newestFive.forEach(createCard);

// load next batch
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

// 🔥 Search logic
function searchVideos() {
  const query = searchInput.value.trim().toLowerCase();
  container.innerHTML = ""; // আগে যা দেখানো হতো সব remove
  loadMoreBtn.style.display = "none"; // search mode এ load more button hide

  if (query === "") {
    // empty search → আগের default logic
    newestFive.forEach(createCard);
    currentIndex = 0;
    remainingVideos = shuffle(videos.slice(0, -5));
    loadMore();
    loadMoreBtn.style.display = "block";
    return;
  }

  // title এর সাথে match করা
  const matched = videos.filter(v => v.title.toLowerCase().includes(query));

  if (matched.length > 0) {
    matched.forEach(createCard);
  } else {
    // match না হলে random 30 card
    const randomVideos = shuffle(videos).slice(0, 30);
    randomVideos.forEach(createCard);
  }
}

searchBtn.addEventListener("click", searchVideos);

// 🔹 Enter key press এ search
searchInput.addEventListener("keyup", e => {
  if (e.key === "Enter") {
    searchVideos();
  }
});
  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
