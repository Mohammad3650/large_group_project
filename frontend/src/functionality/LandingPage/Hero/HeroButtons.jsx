import '../stylesheets/Hero/HeroButtons.css';

/**
 * Renders the action buttons displayed in the hero section.
 *
 * @param {Object} props
 * @param {Array<Object>} props.buttons - Button configuration objects
 * @param {Function} props.onNavigate - Navigation handler
 * @returns {JSX.Element} Hero action buttons
 */
function HeroButtons({ buttons, onNavigate }) {
    return (
        <div className="hero-buttons">
            {buttons.map((button) => (
                <button
                    key={button.label}
                    className={`hero-button ${button.style}`}
                    onClick={() => onNavigate(button.path)}
                >
                    {button.label}
                </button>
            ))}
        </div>
    );
}

export default HeroButtons;