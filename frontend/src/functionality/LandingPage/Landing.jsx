import Hero from "./Hero";
import Card from "./Card";
import Features from "./Features";
import "./stylesheets/Landing.css";

/*
	Landing Page
	- Entry page for new users; introduces StudySync and drives sign-up.
	- Composed of modular sections: Navbar, Hero (CTA), Features, Testimonials.
	- Uses reusable components (e.g. Card) for consistency and scalability.
	- Static content for now; can be replaced with API data later.
	- Presentational only (no state or side effects).
*/

function Landing() {
  return (

    <div className="landing">
      <Hero />
      <Features/>

    <div className="landing_testimonials_wrapper">
      <div className="landing_testimonials">
        <h2 className="landing_testimonials_title">Student Testimonials</h2>

          <div className="testimonials_grid">
            <div className="testimonial_item">
              <Card
                avatar="OK"
                name="Omar Kassam"
                stars="⭐⭐⭐⭐⭐"
                review="“StudySync helped me actually plan my week instead of just hoping for the best. It’s simple and clear.”"
              />
            </div>

            <div className="testimonial_item">
              <Card
                avatar="IA"
                name="Ijaj Ahmed"
                stars="⭐⭐⭐⭐⭐"
                review="“I used to miss deadlines all the time. Having everything in one place made a huge difference.”"
              />
            </div>

            <div className="testimonial_item">
              <Card
                avatar="HK"
                name="Hamza Khan"
                stars="⭐⭐⭐⭐⭐"
                review="“Perfect for university life. I like that it focuses on planning, not distractions or unncessary clutter.”"
              />      
            </div>

            <div className="testimonial_item">
              <Card
                avatar="MI"
                name="Mohammed Islam"
                stars="⭐⭐⭐⭐⭐"
                review="“Straightforward, easy to use, and actually helpful. Exactly what I needed as a student.”"
              />
            </div>

            <div className="testimonial_item">
              <Card
                avatar="AS"
                name="Abdulrahman Sharif"
                stars="⭐⭐⭐⭐"
                review="“Using StudySync made my weeks feel more organised, and far less chaotic.”"
              />
            </div>

            <div className="testimonial_item">
              <Card
                avatar="NA"
                name="Nabil Ahmed"
                stars="⭐⭐⭐⭐⭐"
                review="“It’s really helped me balance lectures, coursework, and revision without feeling overwhelmed.”"
              />
            </div>

          </div>
            
      </div>
    </div>
  </div>
    
  );
}

export default Landing;
