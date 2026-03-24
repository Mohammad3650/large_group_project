import "./stylesheets/Card.css";

function Card(props) {
  return (
    <div className="card">
      <div className="card_container">
        <div className="card_avatar">{props.avatar}</div>

        <div className="card_content">
          <h5 className="card_stars">{props.stars}</h5>
          <p className="card_text">{props.review}</p>
          <h4 className="card_title"> <i>{props.name} </i></h4>
        </div>
      </div>
    </div>
  );
}


export default Card;
