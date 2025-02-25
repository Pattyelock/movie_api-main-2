import { MovieCard } from "../movie-card/movie-card";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import './movie-view.scss';
import { HorizontalScrolling } from "../horizontal-scrolling/horizontal-scrolling";


export const MovieView = ({ user, setUser, token, movies, genres, directors, onBackClick }) => {
  const { movieId } = useParams(); // Get movieId from the URL
  const movie = movies.find((b) => b.id === decodeURIComponent(movieId));

  // Find genre name by matching movie.genre (ID) with the fetched genres
  const matchedGenre = genres.find((g) => g._id === movie.genre);

  // Find director name by matching movie.director (ID) with the fetched directors
  const matchedDirector = directors.find((d) => d._id === movie.director);
  if (!movie) return <div>Movie not found!</div>;

  const shuffleArray = (array) => {
    let shuffledArray = [...array]; // Create a copy of the original array to avoid mutating the state
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
    }
    return shuffledArray;
  };

  const handleAddMovie = async () => {
    const url = `https://movie-api-main-2-81ab4bbd4cbf.herokuapp.com/users/${user.userName}/movies/${movie.name}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include token in the header
        },
      });

      if (!response.ok) {
        throw new Error("Failed to add the movie");
      }

      // Refetch the updated user data
      const updatedUserResponse = await fetch(`https://movies-my-flix-app-60bc918eee2b.herokuapp.com/users/${user.userName}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}` // Include token in the header
        }
      });

      const updatedUser = await updatedUserResponse.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
    } catch (error) {
      console.error("Error adding movie:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  const formattedDate = new Date(movie.year_released).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const [currentMovie, setCurrentMovie] = useState(movie);

  // Use useEffect to update similar movies whenever currentMovie changes
  useEffect(() => {
    setCurrentMovie(movie); // Update currentMovie whenever movieId changes
  }, [movieId]);

  // Get similar movies based on genre, excluding the current movie
  const similarMovies = currentMovie
    ? movies.filter((m) => m.genre === currentMovie.genre && m.id !== currentMovie.id)
    : [];

  const shuffledSimilarMovies = shuffleArray(similarMovies);

  return (
    <div>
      <Row>
        <Col className="movie-info mt-5" md={12}>
          <div className="text-center img-movieView">
            <img src={movie.imagePath} alt={movie.name} />
          </div>
          <div className="mt-4">
            <span>Name: </span>
            <span>{movie.name}</span>
          </div>
          <div className="mt-4">
            <span>Director: </span>
            <span>{matchedDirector ? matchedDirector.name : "Unknown"}</span>
          </div>
          <div>
            <span>Year Released: </span>
            <span>{formattedDate}</span>
          </div>
          <div className="mt-4">
            <span>Description: </span>
            <span>{movie.description}</span>
          </div>
          <div className="mt-4">
            <span>Genre: </span>
            <span>{matchedGenre ? matchedGenre.name : "Unknown"}</span>
          </div>
          <Link to={'/'}>
            <button onClick={onBackClick}
              className="back-button"
              style={{ cursor: "pointer" }}
            >Back</button>
          </Link>
          <button onClick={handleAddMovie} className="add-button">
            {user.FavoriteMovies?.includes(movie.id) ? "Movie added" : "Add movie"}
          </button>
        </Col>
        <HorizontalScrolling>
          {shuffledSimilarMovies.map((movie) => (
            <Col xs={12} sm={12} md={6} lg={4} key={movie.id} className="scrollingMovieCard">
              <MovieCard
                movie={movie}
                setCurrentMovie={setCurrentMovie}
                genres={genres}
                directors={directors}
              />
            </Col>
          ))}
        </HorizontalScrolling>
      </Row>
    </div>
  );
};
