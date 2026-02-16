import "./Card.css";

function Card(props) {
  return (
    <div className="card1">
      <div className="card2">
        <div className="avatar">{props.avatar}</div>

        <div className="content">
          {/* <h2 className="title">{props.name}</h2> */}
          <h5 className="stars">{props.stars}</h5>
          <p className="text">{props.review}</p>
          <h4 className="title"> <i>{props.name} </i></h4>
        </div>
      </div>
    </div>
  );
}


export default Card;
