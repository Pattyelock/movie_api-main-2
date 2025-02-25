import PropTypes from "prop-types";
import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

import "./movie-card.scss";

export const MovieCard = ({ movie, genres, directors, removeFav }) => {

  // Find genre name by matching movie.genre (ID) with the fetched genres
  const matchedGenre = genres.find((g) => g._id === movie.genre);

  // Find director name by matching movie.director (ID) with the fetched directors
  const matchedDirector = directors.find((d) => d._id === movie.director);

  return (
    <>
      <Card className="h-100 movieCard">
        <Card.Img variant="top" src={movie.imagePath} />
        <Card.Body className="card-body">
          <Card.Title>{movie.name}</Card.Title>
          <Card.Text>Director: {matchedDirector ? matchedDirector.name : "Unknown"}</Card.Text>
          <Card.Text>Genre: {matchedGenre ? matchedGenre.name : "Unknown"}</Card.Text>
          <Link to={`/movies/${encodeURIComponent(movie.id)}`}>
            <Button className="movie-btn" variant="link">Details</Button>
          </Link>
        </Card.Body>
        {/* Ensure the remove button is properly inside the fragment */}
        {removeFav && (
          <button
            className="remove-btn" // Add a class for styling if needed
            onClick={() => removeFav(movie.name)}
          >
            Remove from list
          </button>
        )}
      </Card>


    </>
  );
};

// Corrected PropTypes
MovieCard.propTypes = {
  movie: PropTypes.shape({
    name: PropTypes.string.isRequired,
    director: PropTypes.string.isRequired,
    year_released: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    imagePath: PropTypes.string, //  Make sure this matches what you're using
    description: PropTypes.string.isRequired,
    genre: PropTypes.string //  This should be an ID matching `_id` in the genres list
  }).isRequired,
};
