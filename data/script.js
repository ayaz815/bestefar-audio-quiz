document.addEventListener("DOMContentLoaded", async function () {
  window.addEventListener("load", () => {
    const overlay = document.getElementById("introOverlay");
    setTimeout(() => {
      if (overlay) overlay.style.display = "none";
    }, 3000); // 3 seconds
  });

  // const jsonFilePath = ".././content/content.json";
  let jsonFilePath;

  // Check where the script is running
  if (window.location.pathname.includes("/data/screens/")) {
    jsonFilePath = "../content/content.json"; // If inside /data/screens/
  } else {
    jsonFilePath = "./data/content/content.json"; // If in the root (index.html, form.html)
  }

  console.log("📢 Fetching JSON from:", jsonFilePath);

  fetch(jsonFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load JSON file: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("JSON Data Loaded:", data);

      // Get the current screen ID (assuming it's in the body `id`)
      const screenId = document.body.id; // e.g., "screen1", "screen2"
      const screenData = data[screenId];

      console.log(screenId, screenData);

      if (screenData) {
        const musicTypeElement = document.getElementById("music-type-name");
        if (musicTypeElement) {
          const name = screenData.firmNaming || "Melodi";
          const capitalized =
            name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          musicTypeElement.textContent = capitalized;
        } else {
          console.warn("⚠️ 'Music type' element not found.");
        }

        const quizNameElement = document.getElementById("quizName");
        console.log(quizNameElement);
        if (quizNameElement) {
          quizNameElement.textContent =
            data.screen1?.quizName || "Default Quiz Name";
        }
        console.log(data.screen1?.quizName);

        // Update HTML elements by their IDs
        const questionTextElement = document.getElementById("question-text");
        if (questionTextElement) {
          questionTextElement.textContent =
            screenData.question || "Default Question";
        } else {
          console.warn("⚠️ 'question-text' element not found.");
        }

        const answerTextElement = document.getElementById("answer-text");
        if (answerTextElement) {
          answerTextElement.textContent = screenData.answer || "Default Answer";
        } else {
          console.warn("⚠️ 'answer-text' element not found.");
        }

        const firmNamingElement = document.querySelector(
          ".title-section h1:nth-child(2)"
        );
        if (firmNamingElement) {
          firmNamingElement.textContent =
            screenData.firmNaming || "Default Firm Naming";
        }
        // ✅ Update Fact Info Drawer (Additional Notes)
        const factDrawerContent = document.getElementById("factDrawerContent");

        console.log(factDrawerContent, "factDrawerContent");
        console.log(screenData.additionalNotes, " <<<<<<<additionalNotes ");

        if (factDrawerContent) {
          factDrawerContent.innerHTML =
            screenData.additionalNotes ||
            "<p>No additional information available.</p>";
        }

        // if (factDrawerContent) {
        //   // Clear previous content
        //   factDrawerContent.innerHTML = "";

        //   // ✅ Split additionalNotes by spaces every 5 words (to create better formatting)
        //   const words = screenData.additionalNotes.split(" ");
        //   let formattedNotes = [];
        //   let tempLine = "";

        //   words.forEach((word, index) => {
        //     tempLine += word + " ";
        //     if ((index + 1) % 5 === 0 || index === words.length - 1) {
        //       formattedNotes.push(tempLine.trim());
        //       tempLine = "";
        //     }
        //   });

        //   // Append each chunk as a `<li>` element
        //   formattedNotes.forEach((note) => {
        //     if (note.trim()) {
        //       const listItem = document.createElement("li");
        //       listItem.textContent = note.trim(); // Trim to remove extra spaces
        //       factDrawerContent.appendChild(listItem);
        //     }
        //   });
        // }
      } else {
        console.warn(`No data found for screen: ${screenId}`);
      }
    })
    .catch((error) => {
      console.error("Error loading JSON file:", error);
    });

  // Fetch the screen number from the URL or assign manually
  const screenNumber = parseInt(
    window.location.href.match(/screen(\d+)/)?.[1] || 1
  ); // Defaults to screen1

  // Target the current screen music file only
  const musicButtons = document.querySelectorAll(".play-btn");
  const musicImages = document.querySelectorAll(".play-btn img");
  const seekBar = document.getElementById("seekBar1");

  // Load the correct music file for this screen
  const musicAudio = new Audio(`../musicFiles/music${screenNumber}.mp3`);

  let musicPlaying = false;

  if (seekBar) {
    seekBar.value = 0;
  }

  musicButtons.forEach((button, index) => {
    const musicImage = musicImages[index];

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      // Stop all speaker audios before playing music
      if (speakerAudio && !speakerAudio.paused) {
        speakerAudio.pause();
        speakerImage.style.opacity = "0.7";
        speakerMuted = true;
      }

      musicPlaying = !musicPlaying;

      if (musicPlaying) {
        musicAudio
          .play()
          .catch((err) => console.error("Music audio play error:", err));
        musicImage.src = "../assets/play-red2.png"; // Change to pause icon
      } else {
        musicAudio.pause();
        musicImage.src = "../assets/play-red1.png"; // Change back to play icon
      }
    });

    musicAudio.addEventListener("ended", () => {
      musicImage.src = "../assets/play-red1.png";
      musicPlaying = false;
      if (seekBar) seekBar.value = 0;
    });

    musicAudio.addEventListener("timeupdate", () => {
      if (seekBar) {
        seekBar.value = (musicAudio.currentTime / musicAudio.duration) * 100;
      }
    });

    if (seekBar) {
      seekBar.addEventListener("input", () => {
        musicAudio.currentTime = (seekBar.value / 100) * musicAudio.duration;
      });
    }
  });

  // ---------------------- Speaker Button Logic (Completely Independent) -------------------------
  const speakerAudio = new Audio(`../audioFiles/audio${screenNumber}.mp3`);
  const speakerButton = document.querySelector(".speaker-btn");
  const speakerImage = document.querySelector(".speaker-btn img");

  let speakerMuted = false;
  let speakerPlayedOnce = false;

  if (speakerButton) {
    speakerButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent conflicts with other elements

      // Pause music if speaker is played
      if (musicPlaying) {
        musicAudio.pause();
        musicImages.forEach((img) => (img.src = "../assets/play-red1.png"));
        musicPlaying = false;
      }

      // If audio has never been played, start playing it
      if (!speakerPlayedOnce) {
        speakerAudio
          .play()
          .then(() => {
            speakerImage.style.filter = "none";
            speakerImage.style.opacity = "1";
            speakerMuted = false;
            speakerPlayedOnce = true;
          })
          .catch((err) => console.error("Speaker audio play error:", err));
        return;
      }

      // Toggle between mute and unmute
      speakerMuted = !speakerMuted;

      if (speakerMuted) {
        speakerAudio.pause();
        speakerImage.style.opacity = "0.7";
      } else {
        speakerAudio
          .play()
          .catch((err) => console.error("Speaker audio play error:", err));
        speakerImage.style.filter = "none";
        speakerImage.style.opacity = "1";
      }
    });

    // Reset speaker button when audio ends
    speakerAudio.addEventListener("ended", () => {
      speakerImage.style.opacity = "0.7";
      speakerMuted = true;
    });
  }

  //   // Dynamically generate the music elements
  try {
    const response = await fetch(jsonFilePath);
    if (!response.ok)
      throw new Error(`❌ Failed to load JSON: ${response.statusText}`);

    const data = await response.json();
    console.log("✅ JSON Data Loaded:", data);

    // ✅ Dynamically Generate Music Elements Using JSON Data
    const musicContainer = document.getElementById("musicContainer");
    if (musicContainer) {
      musicContainer.innerHTML = ""; // Clear existing content

      for (let i = 1; i <= 16; i++) {
        const screenKey = `screen${i}`;
        const screenData = data[screenKey] || {}; // Get screen data (fallback to empty object)
        const musicName = screenData.musicName || `Music Track ${i}`;
        const artistName = screenData.artistName || `Unknown Artist`;
        const formattedNumber = i.toString().padStart(2) + ".";

        // Create music entry dynamically
        const musicElement = document.createElement("div");
        musicElement.className =
          "flex flex-col items-center justify-start bg-black";

        musicElement.innerHTML = `
          <div class="w-full cursor-pointer group" data-screen-target="./screen${i}.html">
            <p class="sm:text-xl text-xl text-center px-[5%] pt-1 text-yellow-400 font-['Arial_Narrow']">
              ${formattedNumber}
            </p>
            <p class="sm:text-xl text-xl text-center px-[5%] pt-1 text-yellow-400 font-['Arial_Narrow']" id="music-name-${i}">
              ${musicName}
            </p>
            <p class="sm:text-2xl text-2xl text-center px-[5%] pt-1 text-purple-400 font-['Rockwell']" id="artist-name-${i}">
              ${artistName}
            </p>
            
            <div class="flex flex-col items-center pt-1">
              <button
                id="playBtn${i}"
                class="play-btn bg-transparent hover:border-none border-none focus-visible:outline-none focus:outline-none transition-transform duration-300 hover:scale-105"
              >
                <img
                  id="playImg${i}"
                  src="../assets/play-red1.png"
                  alt="Play"
                  class="py-5 sm:py-2 sm:w-17 w-16"
                />
              </button>
              <input
                type="range"
                id="seekBar${i}"
                class="seek-bar w-[80%] h-[3px] my-2 bg-gray-300 accent-gray-500 rounded-lg cursor-pointer focus:outline-none"
              />
            </div>
          </div>
        `;

        // Append to music container
        musicContainer.appendChild(musicElement);
      }
    }

    console.log("✅ Music Elements Generated Successfully!");

    // ✅ Initialize Music Player Logic AFTER Elements Exist
    initializeMusicControls();
  } catch (error) {
    console.error("❌ Error loading JSON file:", error);
  }

  // Function to handle music controls (Safe Execution)
  function initializeMusicControls() {
    const playButtons = document.querySelectorAll(".play-btn");
    const playImages = document.querySelectorAll("[id^=playImg]");
    const seekBars = document.querySelectorAll(".seek-bar");
    const audioFiles = Array.from(
      { length: 16 },
      (_, index) => new Audio(`../musicFiles/music${index + 1}.mp3`)
    );
    let isPlaying = Array(16).fill(false);

    // Initialize seek bars
    seekBars.forEach((seekBar) => {
      seekBar.value = 0;
    });

    playButtons.forEach((button, index) => {
      const audio = audioFiles[index];
      const playImage = playImages[index];
      const seekBar = seekBars[index];

      button.addEventListener("click", () => {
        if (isPlaying[index]) {
          audio.pause();
          playImage.src = "../assets/play-red1.png";
        } else {
          audioFiles.forEach((otherAudio, i) => {
            if (i !== index) {
              otherAudio.pause();
              playImages[i].src = "../assets/play-red1.png";
              isPlaying[i] = false;
            }
          });
          audio.play().catch((err) => console.error("Audio play error:", err));
          playImage.src = "../assets/play-red2.png";
        }
        isPlaying[index] = !isPlaying[index];
      });

      audio.addEventListener("timeupdate", () => {
        seekBar.value = (audio.currentTime / audio.duration) * 100;
      });

      seekBar.addEventListener("input", () => {
        audio.currentTime = (seekBar.value / 100) * audio.duration;
      });

      audio.addEventListener("ended", () => {
        playImage.src = "../assets/play-red1.png";
        isPlaying[index] = false;
        seekBar.value = 0;
      });
    });
  }

  document.querySelectorAll("[data-screen-target]").forEach((el) => {
    el.addEventListener("click", (e) => {
      // Allow navigation ONLY if the clicked element is a <p> tag
      // and matches one of the intended elements
      const targetTag = e.target;
      const tagName = targetTag.tagName.toLowerCase();

      const isValidClick =
        tagName === "p" &&
        (targetTag.id?.startsWith("music-name-") ||
          targetTag.id?.startsWith("artist-name-") ||
          /^[0-9]+\./.test(targetTag.textContent.trim())); // Page number match

      if (!isValidClick) {
        // Prevent navigation if clicked on anything else (seekbar, button, img, etc)
        return;
      }

      const target = el.getAttribute("data-screen-target");
      console.log("🔗 Navigating to quiz screen:", target);
      window.location.href = target;
    });
  });

  // ---------------------- Answer Toggle Logic -------------------------
  const answerDiv = document.querySelector(".toggle-answer-area");

  // Select all paragraphs inside the answer area
  const answerText = answerDiv
    ? answerDiv.querySelectorAll(".answer-text")
    : [];

  // Add the click event listener to the parent for toggling
  if (answerDiv) {
    answerDiv.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent conflicts with other elements

      if (answerText.length > 1) {
        // Toggle between showing and hiding the second paragraph with fade effect
        const secondParagraph = answerText[1];
        if (secondParagraph.classList.contains("opacity-0")) {
          secondParagraph.classList.remove("opacity-0", "pointer-events-none");
        } else {
          secondParagraph.classList.add("opacity-0", "pointer-events-none");
        }
      }
    });
  }

  // Ensure the second paragraph is hidden initially
  if (answerText.length > 1) {
    answerText[1].classList.add("opacity-0", "pointer-events-none");
  }

  // Select all tooltips for speaker and play buttons
  const tooltips = document.querySelectorAll(".tooltip");

  // Function to handle tooltip visibility with timeout logic
  tooltips.forEach((tooltip) => {
    const parentButton = tooltip.closest(".group");

    parentButton.addEventListener("mouseenter", () => {
      // Show the tooltip
      tooltip.classList.remove("opacity-0");
      tooltip.classList.add("opacity-100");

      // Set a timeout to hide the tooltip after 3 seconds
      setTimeout(() => {
        tooltip.classList.remove("opacity-100");
        tooltip.classList.add("opacity-0");
      }, 3000); // Tooltip disappears after 3 seconds
    });
  });

  // Ensure top navigation elements are clickable
  function enableTopNavigation() {
    const leftTopNav = document.getElementById("leftTopNav");
    const rightTopNav = document.getElementById("rightTopNav");
    const fullScreenContainer = document.getElementById("screen2FullScreen");

    if (leftTopNav && rightTopNav && fullScreenContainer) {
      console.log("✅ Ensuring Top Navigation is Clickable");

      // Force pointer events on navigation areas
      leftTopNav.style.pointerEvents = "auto";
      rightTopNav.style.pointerEvents = "auto";

      // Increase z-index to be above fullscreen container
      leftTopNav.style.zIndex = "101";
      rightTopNav.style.zIndex = "101";

      // Ensure fullscreen container does NOT overlap
      fullScreenContainer.style.zIndex = "100";
      fullScreenContainer.style.position = "relative";

      console.log("✅ Navigation areas updated.");
    } else {
      console.warn("⚠️ Navigation elements not found!");
    }
  }

  enableTopNavigation();

  // Attach event listeners for navigation clicks
  document.getElementById("leftTopNav")?.addEventListener("click", function () {
    const base = window.location.pathname.includes("/data/screens/")
      ? "./screen1.html"
      : "./data/screens/screen1.html";
    navigateToScreen(base);
  });
  document
    .getElementById("rightTopNav")
    ?.addEventListener("click", function () {
      // Always navigate to the correct path based on screen number logic
      const currentPath = window.location.pathname;
      let nextScreenPath;

      if (currentPath.includes("/data/screens/")) {
        nextScreenPath = "./screen18.html"; // relative to current screen
      } else {
        nextScreenPath = "./data/screens/screen18.html"; // used when on index.html
      }

      console.log("Navigating to:", nextScreenPath);
      navigateToScreen(nextScreenPath);
    });

  function navigateToScreen(url) {
    console.log(`📢 Navigating to: ${url}`);
    window.location.href = url;
  }

  // ---------------------- Fullscreen Logic with Top 10% Interactive Area -------------------------
  function setupDoubleTapListeners(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    // Create an interactive top 10% area for fullscreen activation
    const topRegion = document.createElement("div");
    topRegion.style.position = "absolute";
    topRegion.style.top = "0";
    topRegion.style.left = "0";
    topRegion.style.width = "100%";
    topRegion.style.height = "10%";
    topRegion.style.cursor = "pointer";
    topRegion.style.zIndex = "100";

    // Attach double-click event to trigger fullscreen
    topRegion.addEventListener("dblclick", toggleFullScreen);

    // Add hover message
    const hoverMessage = document.createElement("div");
    // hoverMessage.textContent = "Maximize screen";
    hoverMessage.style.position = "absolute";
    // hoverMessage.style.top = "50%";
    // hoverMessage.style.left = "50%";
    hoverMessage.style.transform = "translate(-50%, -50%)";
    // hoverMessage.style.color = "white";
    // hoverMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    // hoverMessage.style.padding = "5px 10px";
    hoverMessage.style.borderRadius = "8px";
    hoverMessage.style.fontSize = "14px";
    hoverMessage.style.opacity = "0";
    hoverMessage.style.transition = "opacity 0.5s";

    // Show the hover message only on hover
    topRegion.addEventListener("mouseenter", () => {
      hoverMessage.style.opacity = "1";
    });
    topRegion.addEventListener("mouseleave", () => {
      hoverMessage.style.opacity = "0";
    });

    // Add the hover message and top area to the panel
    topRegion.appendChild(hoverMessage);
    panel.style.position = "relative";
    panel.appendChild(topRegion);
  }

  // Function to toggle fullscreen mode
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Apply fullscreen listeners to multiple panels
  const panels = [
    "screen2FullScreen",
    "middlePanel",
    "rightPanel",
    "lefttPanel",
    "leftttPanel",
  ];
  panels.forEach((panelId) => setupDoubleTapListeners(panelId));
});

// document.addEventListener("DOMContentLoaded", function () {

// });

// ---------------------- Fullscreen and Navigation Logic -------------------------

// Function to set up top, left, and right zones for each panel
function setupInteractiveZones(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return; // Prevent errors if the panel does not exist

  panel.style.position = "relative"; // Ensure relative positioning for absolute child elements

  // ---------------- Top 10% Zone (Fullscreen Toggle) ----------------
  const topRegion = createInteractionZone(
    "0%",
    "0%",
    "100%",
    "10%",
    "Double-click to Maximize"
  );
  topRegion.addEventListener("dblclick", toggleFullScreen);
  panel.appendChild(topRegion);

  // ---------------- Left 10% Zone (Left Navigation) ----------------
  const leftRegion = createInteractionZone(
    "0%",
    "0%",
    "10%",
    "100%",
    "← Navigate Left"
  );
  leftRegion.addEventListener("click", () => navigateLeft(panelId));
  panel.appendChild(leftRegion);

  // ---------------- Right 10% Zone (Right Navigation) ----------------
  const rightRegion = createInteractionZone(
    "90%",
    "0%",
    "10%",
    "100%",
    "→ Navigate Right"
  );
  rightRegion.addEventListener("click", () => navigateRight(panelId));
  panel.appendChild(rightRegion);
}

// Function to create a reusable interactive zone
function createInteractionZone(left, top, width, height, hoverText) {
  const region = document.createElement("div");
  region.style.position = "absolute";
  region.style.left = left;
  region.style.top = top;
  region.style.width = width;
  region.style.height = height;
  region.style.cursor = "pointer";
  region.style.zIndex = "100";

  // Hover Message
  const hoverMessage = document.createElement("div");
  hoverMessage.textContent = hoverText;
  hoverMessage.style.position = "absolute";
  hoverMessage.style.top = "50%";
  hoverMessage.style.left = "50%";
  hoverMessage.style.transform = "translate(-50%, -50%)";
  hoverMessage.style.color = "white";
  hoverMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  hoverMessage.style.padding = "5px 10px";
  hoverMessage.style.borderRadius = "8px";
  hoverMessage.style.fontSize = "14px";
  hoverMessage.style.opacity = "0";
  hoverMessage.style.transition = "opacity 0.5s";

  // Show message on hover
  region.addEventListener("mouseenter", () => {
    hoverMessage.style.opacity = "1";
  });
  region.addEventListener("mouseleave", () => {
    hoverMessage.style.opacity = "0";
  });

  region.appendChild(hoverMessage);
  return region;
}

// // ---------------------- Fullscreen Logic -------------------------
// function toggleFullScreen() {
//   if (!document.fullscreenElement) {
//     document.documentElement.requestFullscreen().catch((err) => {
//       console.error("Error entering fullscreen:", err);
//     });
//   } else {
//     document.exitFullscreen();
//   }
// }

// // ---------------------- Navigation Logic -------------------------
// function navigateLeft(panelId) {
//   console.log(`Navigated Left from ${panelId}`);
//   alert(`Navigated Left from ${panelId}`);
// }

// function navigateRight(panelId) {
//   console.log(`Navigated Right from ${panelId}`);
//   alert(`Navigated Right from ${panelId}`);
// }

// // ---------------------- Apply Logic to Panels -------------------------
// const panels = [
//   "screen2FullScreen",
//   "middlePanel",
//   "rightPanel",
//   "lefttPanel",
//   "leftttPanel",
// ];
// panels.forEach((panelId) => setupInteractiveZones(panelId));

function navigateToScreen(targetScreen) {
  window.location.href = targetScreen;
}

// Smooth Navigation with Tailwind
function navigateToScreen(url) {
  const mainContainer = document.getElementById("screen2FullScreen");

  // Add Tailwind classes for fade-out effect
  mainContainer.classList.add(
    "opacity-0",
    "transition-opacity",
    "duration-500"
  );

  // Redirect after transition completes
  setTimeout(() => {
    window.location.href = url;
  }, 500); // Matches Tailwind's 500ms duration
}

// Ensure the screen fades in on load
window.addEventListener("load", () => {
  const mainContainer = document.getElementById("screen2FullScreen");
  mainContainer.classList.remove("opacity-0");
  mainContainer.classList.add(
    "opacity-100",
    "transition-opacity",
    "duration-500"
  );
});

const showButton = document.querySelector(
  "[data-drawer-show='drawer-bottom-example']"
);
const drawer = document.getElementById("drawer-bottom-example");
const closeButton = drawer.querySelector(
  "[data-drawer-hide='drawer-bottom-example']"
);

// Show drawer when the button is clicked
showButton.addEventListener("click", () => {
  drawer.classList.remove("transform-none");
  drawer.classList.add("translate-y-0");
});

// Hide drawer when the close button is clicked
closeButton.addEventListener("click", () => {
  drawer.classList.remove("translate-y-0");
  drawer.classList.add("transform-none");
});

function enterFullscreen() {
  const elem = document.documentElement; // Use full document (recommended)

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(); // Safari
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen(); // IE11
  } else {
    alert("Fullscreen not supported on this browser.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      enterFullscreen();

      const target = document.getElementById("screen2FullScreen");
      target.classList.remove("opacity-0");
      target.classList.add("opacity-100");
    });
  }
});
