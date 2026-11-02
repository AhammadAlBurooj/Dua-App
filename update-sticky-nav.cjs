const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// 1. Update .device-viewport
css = css.replace(
  /\.device-viewport\s*\{[^}]*\}/,
  `.device-viewport {
  width: 100%;
  max-width: var(--app-max-width);
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  background-color: var(--bg-app);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: max-width 0.3s ease;
}`
);

// 2. Update .app-content
css = css.replace(
  /\.app-content\s*\{[^}]*\}/,
  `.app-content {
  flex: 1;
  padding: 0 18px 24px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}`
);

// 3. Update .bottom-nav
css = css.replace(
  /\.bottom-nav\s*\{[^}]*\}/,
  `.bottom-nav {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--nav-height);
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 10px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  z-index: 40;
  flex-shrink: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}`
);

// 4. Update .home-categories-section
css = css.replace(
  /\.home-categories-section\s*\{[^}]*\}/,
  `.home-categories-section {
  padding: 16px 16px 24px 16px;
}`
);

// 5. Update .category-view-container
css = css.replace(
  /\.category-view-container\s*\{[^}]*\}/,
  `.category-view-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: 24px;
}`
);

// 6. Update .search-active-container
css = css.replace(
  /\.search-active-container\s*\{[^}]*\}/,
  `.search-active-container {
  padding: 14px 16px 24px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}`
);

fs.writeFileSync('src/index.css', css, 'utf8');
console.log('SUCCESS: Sticky fixed bottom nav applied!');

