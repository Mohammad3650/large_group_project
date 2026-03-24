import "./stylesheets/Hero.css";
import heropic from "../../assets/LandingPage/heropicture.png";
import { useNavigate } from "react-router-dom";



function Hero() {
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
            <button className="hero_button signup" onClick={() => nav("/signup")}>Sign Up</button>
            <button className="hero_button login" onClick={() => nav("/login")}>Login</button>
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
