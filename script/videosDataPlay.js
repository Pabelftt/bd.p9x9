const video = document.getElementById("myVideo");
const playBtn = document.getElementById("playBtn");

// Play instantly on click
function playVideo() {
    video.play().then(() => {
        playBtn.style.display = "none";
    }).catch(err => {
        console.log("Play blocked:", err);
    });
}

playBtn.addEventListener("click", playVideo);
video.addEventListener("click", playVideo);

// Show button again if paused
video.addEventListener("pause", () => {
    playBtn.style.display = "block";
});
