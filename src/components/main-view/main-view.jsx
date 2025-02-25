import React from "react";
import { useState, useEffect } from "react";
import WelcomeCard from "./welcome-card";
import { MovieCard } from "../movie-card/movie-card";
import { MovieView } from "../movie-view/movie-view";
import { LoginView } from "../login-view/login-view";
import { SignupView } from "../singup-view/signup-view";
import { NavigationBar } from "../navigation-bar/navigation-bar";
import { ProfileView } from "../profile-view/profile-view";
import Row from "react-bootstrap/Row";
import Col from 'react-bootstrap/Col';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

export const MainView = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const storedToken = localStorage.getItem("token");
  const storedMovies = JSON.parse(localStorage.getItem("movies")) || [];
  const [user, setUser] = useState(storedUser? storedUser : null);
  const [token, setToken] = useState(storedToken? storedToken : null);
  const [movies, setMovies] = useState(storedMovies);
  const [genres, setGenres] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter movies based on search query
  const filteredMovies = movies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!token) {
      console.log("No token found.");
      return;
    }

    const fetchGenres = async () => {
      try {
        const response = await fetch(
          "https://movie-api-main-2-81ab4bbd4cbf.herokuapp.com/movies",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch genres");
        }

        const result = await response.json();
        setGenres(result);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    const fetchDirectors = async () => { // Fetch directors
      try {
        const response = await fetch(
       "https://movie-api-main-2-81ab4bbd4cbf.herokuapp.com/directors",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch directors");
        }

        const result = await response.json();
        setDirectors(result);
      } catch (error) {
        console.error("Error fetching directors:", error);
      }
    };

    const fetchMovies = async () => {
      try {
        const response = await fetch("https://movies-my-flix-app-60bc918eee2b.herokuapp.com/movies", {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (!Array.isArray(data)) {
          console.error("Error: API response is not an array", data);
          setMovies([]); 
          return;
        }
  
        const moviesFromApi = data.map((mov) => ({
          id: mov._id,
          name: mov.name,
          director: mov.director,
          year_released: mov.year_released,
          description: mov.description,
          genre: mov.genre,
          imagePath: mov.imagePath
        }));
  
        setMovies(moviesFromApi);
        localStorage.setItem("movies", JSON.stringify(moviesFromApi)); // Store movies in local storage
      } catch (error) {
        console.error("Fetching movies failed:", error);
        setMovies([]);
      }
    };
  
    fetchMovies();
    fetchGenres();
    fetchDirectors();
  }, [token]);
  return (
    <BrowserRouter>
      <NavigationBar 
      user={user}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onLoggedOut={() => {
        setUser(null);
        setToken(null);
        localStorage.clear();
      }}
      />
      <Row className="justify-content-md-center"> 
        <Routes>
        <Route
            path="/"
            element={
              <>
                {!user ? (
                  <Navigate to="/login" replace />
                ) : movies.length === 0 ? (
                  <Col>The list is empty!</Col>
                ) : (
                  <Col>
                    <Row>
                      <WelcomeCard />
                    </Row>
                    <Row>
                    <>
                      {filteredMovies.map((movie) => (
                        <Col className="mb-4" key={movie.id} md={3}>
                          <MovieCard 
                          movie={movie}
                          genres={genres}
                          directors={directors}
                        />
                        </Col>  
                      ))}
                    </>
                    </Row>
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/signup"
            element={
              <>
                {user ? (
                  <Navigate to="/" />
                ) : (
                  <Col md={5}>
                    <SignupView />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                {user ? (
                  <Navigate to="/" />
                ) : (
                  <Col md={5}>
                    <LoginView onLoggedIn={(user) => setUser(user)}/>
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/movies/:movieId"
            element={
              <>
                {!user ? (
                  <Navigate to="/login" replace/>
                ) : movies.length === 0 ? (
                  <Col>The list is empty!</Col>
                ) : (
                  <Col md={10}>
                    <MovieView 
                    movies={movies}
                    genres={genres}
                    directors={directors}
                    user={user}
                    token={token}
                    setUser={setUser}
                    />
                  </Col>
                )}
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                {!user ? (
                  <Navigate to="/login" />
                ) : (
                  <Col md={10}>
                    <ProfileView
                    user={user}
                    setUser={setUser}
                    movies={movies}
                    token={token}
                    genres={genres}
                    directors={directors}
                    onLoggedOut={() => {
                      setUser(null);
                      setToken(null);
                      localStorage.clear();
                    }}
                    />
                    
                  </Col>
                )}
              </>
            }
          />
        </Routes>
      </Row>
    </BrowserRouter>
  );
};




  
//   return (
//     <Row className="justify-content-md-center"> 
//       {!user ? (
//         <Col md={5}>
//           <LoginView onLoggedIn={(user) => setUser(user)} />
//           <div className="or">OR</div>
//           <SignupView />
//         </Col>
//       ) : selectedMovie ? (
//         <Col md={8}>
//           <MovieView 
//             movie={selectedMovie} 
//             onBackClick={() => setSelectedMovie(null)} 
//             similarMovies = {similarMovies}
//             setSelectedMovie={setSelectedMovie}
//           />
//         </Col>
//       ) : movies.length === 0 ? (
//         <div>The list is empty! {movies}</div>
//       ) : (
//         <>
//           {movies.map((movie) => (
//             <Col className="mb-5" key={movie.id} md={4}>
//             <MovieCard
//               movie={movie}
//               onMovieClick={(newSelectedMovie) => {
//                 setSelectedMovie(newSelectedMovie);
//               }}
//             />
//             </Col>
//           ))}
//         </>
//       )}
//     </Row>
//   );
// };