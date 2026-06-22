(function() {
  var storageKey = "portfolio-theme";
  var root = document.documentElement;
  var theme = "light";

  try {
    var savedTheme = window.localStorage.getItem( storageKey );
    if ( savedTheme === "dark" || savedTheme === "light" ) {
      theme = savedTheme;
    } else if ( window.matchMedia && window.matchMedia( "(prefers-color-scheme: dark)" ).matches ) {
      theme = "dark";
    }
  } catch ( error ) {
    theme = "light";
  }

  root.setAttribute( "data-theme", theme );
  root.style.colorScheme = theme;

  var themeColor = document.querySelector( "meta[name='theme-color']" );
  if ( themeColor ) {
    themeColor.setAttribute( "content", theme === "dark" ? "#0f1720" : "#ffffff" );
  }
})();
