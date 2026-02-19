import "./Hero.css";
import heropic from "./photos/heropicture.png";
import { useNavigate } from "react-router-dom";

function Hero() {
    const nav = useNavigate();
  return (
    <div className="main">
      <div className="hero-content">
        <div className="left">
          <div className="quote">
            <span className="toptext">Plan your study.</span>
            <br></br>
            <span className="bottomtext">Live your life.</span>
          </div>

          <div className="buttons">
            <button className="signup" onClick={() => nav("/signup")}>Sign Up</button>
            <button className="login" onClick={() => nav("/login")}>Login</button>
          </div>
        </div>

        <div className="right">
          <img src={heropic}></img>
        </div>
      </div>
    </div>
  );
}

export default Hero;
