import "./stylesheets/Hero.css";
import heropic from "../../assets/LandingPage/heropicture.png";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "../../utils/authStatus";

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

  return (
    <div className="hero">
      {/* Wrapper for layout (split left/right) */}

      <div className="hero_content">
        <div className="hero_left">
          <div className="hero_quote">
            <span className="hero_text_top">Plan your study.</span>
            <br></br>
            <span className="hero_text_bottom">Live your life.</span>
          </div>
          <div className="hero_buttons">
            {isLoggedIn ? (
              <>
                <button
                  className="hero_button black"
                  onClick={() => nav("/calendar")}
                >
                  {" "}
                  Calendar
                </button>
                <button
                  className="hero_button white"
                  onClick={() => nav("/dashboard")}
                >
                  {" "}
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  className="hero_button black"
                  onClick={() => nav("/signup")}
                >
                  Sign Up
                </button>
                <button
                  className="hero_button white"
                  onClick={() => nav("/login")}
                >
                  Login
                </button>{" "}
              </>
            )}
          </div>
        </div>
        <div className="hero_right">
          <img className="hero_image" src={heropic} alt="StudySync hero"></img>
        </div>
      </div>
    </div>
  );
}

export default Hero;
