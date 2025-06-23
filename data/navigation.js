// navigation.js - Shared across all 16 HTML files
let lastInteractionTime = 0;
const NAVIGATION_DEBOUNCE_TIME = 300; // 300ms threshold

// Centralized navigation function
function navigateToScreen(url) {
  const now = Date.now();

  // Prevent rapid successive navigations
  if (now - lastInteractionTime < NAVIGATION_DEBOUNCE_TIME) {
    return;
  }

  lastInteractionTime = now;

  // Add visual feedback
  document.body.style.opacity = "0.7";

  setTimeout(() => {
    window.location.href = url;
  }, 150);
}

// Initialize all navigation elements
function initNavigation() {
  // Left navigation (10% of left screen edge)
  const leftNavs = document.querySelectorAll(
    '[id^="leftNavigation"], [id^="leftTopNav"]'
  );
  leftNavs.forEach((nav) => {
    nav.addEventListener("click", (e) => {
      e.stopPropagation();
      const target =
        nav.getAttribute("onclick")?.match(/'([^']+)'/)?.[1] ||
        "./screen1.html";
      navigateToScreen(target);
    });
  });

  // Right navigation (10% of right screen edge)
  const rightNavs = document.querySelectorAll(
    '[id^="rightNavigation"], [id^="rightTopNav"]'
  );
  rightNavs.forEach((nav) => {
    nav.addEventListener("click", (e) => {
      e.stopPropagation();
      const target =
        nav.getAttribute("onclick")?.match(/'([^']+)'/)?.[1] ||
        "./screen3.html";
      navigateToScreen(target);
    });
  });

  // Make navigation areas more visible in debug mode
  if (window.location.search.includes("debug")) {
    leftNavs.forEach((el) => (el.style.backgroundColor = "rgba(255,0,0,0.1)"));
    rightNavs.forEach((el) => (el.style.backgroundColor = "rgba(0,255,0,0.1)"));
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initNavigation);
