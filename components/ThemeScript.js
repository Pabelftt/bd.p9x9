export default function ThemeScript() {
  const code = `
    (function() {
      try {
        var stored = localStorage.getItem('bd-theme');
        var theme = stored || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
