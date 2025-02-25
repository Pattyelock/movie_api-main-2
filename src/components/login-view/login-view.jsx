import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for redirection

export const LoginView = ({ onLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // To handle the loading state
  const [error, setError] = useState(""); // To show any error messages
  const navigate = useNavigate(); // Hook for redirection

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload

    setLoading(true); // Start loading when submitting the form
    setError(""); // Clear any previous errors

    const data = {
      Username: username, // ✅ Correct key name (case-sensitive)
      Password: password,
    };

    fetch("https://movie-api-main-2-81ab4bbd4cbf.herokuapp.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Server response:", data); // ✅ Debugging step

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
          onLoggedIn(data.user, data.token);

          // Redirect to the dashboard (or any protected route)
          navigate('/dashboard');
        } else {
          setError("Username or Password is incorrect! Try again.");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        setError("Something went wrong. Please try again.");
      })
      .finally(() => {
        setLoading(false); // Stop loading after the request is complete
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="formGroup" controlId="formUsernameSignUp">
        <Form.Label>Username:</Form.Label>
        <Form.Control
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength="5"
        />
      </Form.Group>

      <Form.Group className="formGroup" controlId="formPasswordSignUp">
        <Form.Label>Password:</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Form.Group>
      
      {/* Show error message if login fails */}
      {error && <div className="text-danger">{error}</div>}

      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Submit"}
      </Button>
    </Form>
  );
};
