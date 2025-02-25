import React from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { MovieCard } from "../movie-card/movie-card";
import { HorizontalScrolling } from "../horizontal-scrolling/horizontal-scrolling";

function FavoriteMovies({ user, movies, setUser, genres,directors }) {
  console.log(movies)
  console.log(user.FavoriteMovies)
  const removeFav = (movieName) => {
    const token = localStorage.getItem("token"); // Retrieve token for authentication
    const userLocal = JSON.parse(localStorage.getItem("user")); // Retrieve user data

    if (!userLocal) {
      console.error("User not found");
      return;
    }

    fetch(`https://movies-my-flix-app-60bc918eee2b.herokuapp.com/users/${user.userName}/movies/${movieName}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to remove movie");
        }
        return response.text(); // Logs "Successful" or another server response
      })
      .then(() => {
        // Fetch the updated user data
        return fetch(`https://movies-my-flix-app-60bc918eee2b.herokuapp.com/users/${user.userName}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch updated user data");
        }
        return response.json(); // Get the updated user data
      })
      .then((updatedUser) => {
        localStorage.setItem("user", JSON.stringify(updatedUser)); // Update local storage
        setUser(updatedUser); // Update state
        console.log("Updated user data:", updatedUser);
      })
      .catch((error) => {
        console.error("Error removing movie:", error);
      });
  };
  const favoriteMovies = movies.filter((movie) =>
    user.FavoriteMovies?.includes(movie.id)
  );

  return (
    <Row>
      {/* Container with horizontal scrolling */}
      <h2 className="favoriteTitle">Favorite Movies</h2>
      {user.FavoriteMovies.length > 0 ? (
        <HorizontalScrolling>
          {favoriteMovies.map((movie) => (
            <Col xs={12} sm={6} md={4} lg={3} key={movie._id} className="scrollingMovieCard">
              <MovieCard
              movie={movie} 
              genres={genres}
              directors={directors}
              removeFav={removeFav}
              />
            </Col>
          ))}

        </HorizontalScrolling>
      ) : (
        <p className='favoriteNoAdd'>No favorite movies added yet.</p>
      )}
    </Row>




  );
}

export default FavoriteMovies;