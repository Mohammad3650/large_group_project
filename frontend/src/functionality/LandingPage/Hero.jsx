import "./stylesheets/Hero.css";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "../../utils/authStatus";

import heroPicLight from "../../assets/LandingPage/heropicture.png";
import heroPicDark from "../../assets/LandingPage/heropicture_dark.png";


function Hero() {
    const isLoggedIn = useAuthStatus();
    const nav = useNavigate();

    const isDark = document.body.classList.contains("dark-theme");
    const heropic = !isDark ? heroPicDark : heroPicLight;

  return (
    <div className="hero">
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
                <button className="hero_button black" onClick={() => nav("/calendar")}> Calendar</button>
                <button className="hero_button white" onClick={() => nav("/dashboard")}> Dashboard</button>
              </>

            ) : (
              <>
                <button className="hero_button black" onClick={() => nav("/signup")}>Sign Up</button>
                <button className="hero_button white" onClick={() => nav("/login")}>Login</button> 
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
