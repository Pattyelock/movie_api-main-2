import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation } from "react-router-dom";
import React from 'react';
import { useEffect, useState } from "react";

export const NavigationBar = ({ user, onLoggedOut, searchQuery, setSearchQuery }) => {
  const location = useLocation(); // Get the current route
  const [showSearch, setShowSearch] = useState(location.pathname === "/");

  useEffect(() => {
    // Update state when the route changes
    setShowSearch(location.pathname === "/");
  }, [location.pathname]);

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container id="navbar">
        <Navbar.Brand className="navbar-brand" as={Link} to={user ? "/" : "/login"}>
          MyFlixApp
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">Signup</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                <Nav.Link onClick={onLoggedOut}>Logout</Nav.Link>

                {/* Search bar will now update dynamically */}
                {showSearch && (
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search movies by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-control"
                    />
                    {searchQuery && (
                      <button className="clear-button" onClick={() => setSearchQuery("")}>
                        ✖
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;