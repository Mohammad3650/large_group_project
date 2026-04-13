import './stylesheets/Hero.css';
import { useNavigate } from 'react-router-dom';
import useAuthStatus from '../../functionality/Authentication/utils/authStatus.js';

import heroPicLight from '../../assets/LandingPage/heropicture.png';
import heroPicDark from '../../assets/LandingPage/heropicture_dark.png';

/*
  Hero Component

  - Top section of landing page with main message and CTA.
  - Encourages users to sign up or log in.
  - Uses navigation hook for route changes.
  - Presentational with simple interaction (button clicks).
*/

function Hero() {
    const isLoggedIn = useAuthStatus();

    // Hook used to programmatically navigate between routes
    const nav = useNavigate();

    const isDark = document.body.classList.contains('dark-theme');
    const heropic = !isDark ? heroPicDark : heroPicLight;
	// Button configurations based on authentication states
    const buttons = isLoggedIn
        ? [
              { label: 'Calendar', path: '/calendar', style: 'black' },
              { label: 'Dashboard', path: '/dashboard', style: 'white' }
          ]
        : [
              { label: 'Sign Up', path: '/signup', style: 'black' },
              { label: 'Login', path: '/login', style: 'white' }
          ];

    return (
        <div className="hero">
            {/* Wrapper for layout (split left/right) */}
            <div className="hero-content">
                <div className="hero-left">
                    <div className="hero-quote">
                        <span className="hero-text-top">Plan your study.</span>
                        <br/>
                        <span className="hero-text-bottom">Live your life.</span>
                    </div>

                    <div className="hero-buttons">
                        {buttons.map((btn) => (
                            <button key={btn.label} className={`hero-button ${btn.style}`} onClick={() => nav(btn.path)}>
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hero-right">
                    <img className="hero-image" src={heropic} alt="StudySync hero"/>
                </div>
            </div>
        </div>
    );
}

export default Hero;
