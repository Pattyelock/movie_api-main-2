import React, { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import UserInfo from "./user-info";
import FavoriteMovies from "./favorite-movies";

export const ProfileView = ({user, setUser, movies, onLoggedOut,setCurrentMovie,genres,directors}) => {
  const [error, setError] = useState(null);
  const storedToken = localStorage.getItem("token");
  const [token, setToken] = useState(storedToken? storedToken : null);
  
  if (!user) {
    setError("You must be logged in to view your profile.");
    return;
  }

  if (!token) {
    setError("No token.");
    return;
  }
  console.log(user)
  return (
    <Container>
      <Row>
        <Col xs={12} sm={12} m={12}>
          <Card>
            <Card.Body>
              <UserInfo 
                user={user}
                setUser={setUser}
                setToken={setToken}
                onLoggedOut={onLoggedOut}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card m={12}>
            <Card.Body>
              <FavoriteMovies
              user={user}
              movies={movies}
              setUser={setUser}
              setCurrentMovie={setCurrentMovie}
              genres={genres}
              directors={directors}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};


export default ProfileView;