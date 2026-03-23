import "./stylesheets/Hero.css";
import heropic from "../../assets/LandingPage/heropicture.png";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "../../utils/authStatus";


function Hero() {
    const isLoggedIn = useAuthStatus();
    const nav = useNavigate();

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
                <button className="hero_button white" onClick={() => nav("/calendar")}> Dashboard</button>
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
