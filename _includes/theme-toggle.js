(function() {
  var storageKey = "portfolio-theme";
  var root = document.documentElement;
  var toggle = document.querySelector( ".theme-toggle" );
  var themeColor = document.querySelector( "meta[name='theme-color']" );

  if ( !toggle ) {
    return;
  }

  function applyTheme( theme, shouldSave ) {
    var isDark = theme === "dark";

    root.setAttribute( "data-theme", theme );
    root.style.colorScheme = theme;
    toggle.setAttribute( "aria-pressed", String( isDark ) );
    toggle.setAttribute( "aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro" );

    if ( themeColor ) {
      themeColor.setAttribute( "content", isDark ? "#0f1720" : "#ffffff" );
    }

    if ( shouldSave ) {
      try {
        window.localStorage.setItem( storageKey, theme );
      } catch ( error ) {
        return;
      }
    }
  }

  function currentTheme() {
    return root.getAttribute( "data-theme" ) === "dark" ? "dark" : "light";
  }

  applyTheme( currentTheme(), false );

  toggle.addEventListener( "click", function() {
    applyTheme( currentTheme() === "dark" ? "light" : "dark", true );
  } );
})();
