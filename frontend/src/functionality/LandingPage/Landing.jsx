import NavBar from "./NavBar";
import Hero from "./Hero";
import Card from "./Card";
import Features from "./Features";

import "./Landing.css";


function Landing() {
  return (
    <>
    <div className="background">
      <NavBar />
      <Hero />

      <Features/>

      <div className="grid">
      <section className="testimonials">
      <h2>Student Testimonials</h2>
      <Card
        avatar="OK"
        name="Omar Kassam"
        stars="⭐⭐⭐⭐⭐"
        review="“StudySync helped me actually plan my week instead of just hoping for the best. It’s simple and clear.”"
      />

      <Card
        avatar="IA"
        name="Ijaj Ahmed"
        stars="⭐⭐⭐⭐⭐"
        review="“I used to miss deadlines all the time. Having everything in one place made a huge difference.”"
      />

      <Card
        avatar="HK"
        name="Hamza Khan"
        stars="⭐⭐⭐⭐⭐"
        review="“Perfect for university life. I like that it focuses on planning, not distractions or unncessary clutter.”"
      />

      <Card
        avatar="MI"
        name="Mohammed Islam"
        stars="⭐⭐⭐⭐⭐"
        review="“Straightforward, easy to use, and actually helpful. Exactly what I needed as a student.”"
      />

      <Card
        avatar="AS"
        name="Abdulrahman Sharif"
        stars="⭐⭐⭐⭐"
        review="“Using StudySync made my weeks feel more organised, and far less chaotic.”"
      />

      <Card
        avatar="NA"
        name="Nabil Ahmed"
        stars="⭐⭐⭐⭐⭐"
        review="“It’s really helped me balance lectures, coursework, and revision without feeling overwhelmed.”"
      />
      </section>
      </div>

      </div>
    </>
  );
}

export default Landing;
