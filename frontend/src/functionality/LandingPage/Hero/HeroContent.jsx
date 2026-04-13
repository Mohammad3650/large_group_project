import HeroButtons from './HeroButtons.jsx';

/**
 * Renders the text content shown on the left side of the hero section.
 *
 * @param {Object} props
 * @param {Array<Object>} props.buttons - Button configuration objects
 * @param {Function} props.onNavigate - Navigation handler
 * @returns {JSX.Element} Hero text content
 */
function HeroContent({ buttons, onNavigate }) {
    return (
        <div className="hero-left">
            <div className="hero-quote">
                <span className="hero-text-top">Plan your study.</span>
                <br />
                <span className="hero-text-bottom">Live your life.</span>
            </div>
            <HeroButtons buttons={buttons} onNavigate={onNavigate} />
        </div>
    );
}

export default HeroContent;