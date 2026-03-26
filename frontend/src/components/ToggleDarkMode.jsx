function ToggleDarkMode({ theme, toggleTheme }) {
    return (
        <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
    );
}

export default ToggleDarkMode;
