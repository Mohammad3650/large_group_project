import './stylesheets/Hero.css';
import { useNavigate } from 'react-router-dom';
import useAuthStatus from '../../utils/authStatus';

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

    return (
        <div className="hero">
            {/* Wrapper for layout (split left/right) */}
            <div className="hero-content">
                <div className="hero-left">
                    <div className="hero-quote">
                        <span className="hero-text-top">Plan your study.</span>
                        <br></br>
                        <span className="hero-text-bottom">
                            Live your life.
                        </span>
                    </div>

                    <div className="hero-buttons">
                        {isLoggedIn ? (
                            <>
                                <button
                                    className="hero-button black"
                                    onClick={() => nav('/calendar')}
                                >
                                    Calendar
                                </button>
                                <button
                                    className="hero-button white"
                                    onClick={() => nav('/dashboard')}
                                >
                                    Dashboard
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="hero-button black"
                                    onClick={() => nav('/signup')}
                                >
                                    Sign Up
                                </button>
                                <button
                                    className="hero-button white"
                                    onClick={() => nav('/login')}
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="hero-right">
                    <img
                        className="hero-image"
                        src={heropic}
                        alt="StudySync hero"
                    ></img>
                </div>
            </div>
        </div>
    );
}

export default Hero;
