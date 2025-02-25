import React from "react";
import {useState} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";

export const SignupView = () => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    email: "",
    birthday: "",
  });

  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const {name, value} = event.target;
    setFormData({...formData,[name]: value});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors([]); 

    const data = {
      userName: formData.username,
      first_Name: formData.firstname,
      last_Name: formData.lastname,
      password: formData.password,
      email: formData.email,
      birthDay: formData.birthday
    };
  
    fetch("https://movie-api-main-2-81ab4bbd4cbf.herokuapp.com/users/create",
      { 
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.errors) {
          // Server-side validation errors
          setErrors(responseData.errors);
        } else {
          alert("Signup successful");
          setTimeout(() => {
            setIsLoading(false);
            navigate("/login"); 
          }); 
          // window.location.reload();
          
        }
      })
      .catch((error) => {
        console.error("Error during signup:", error);
        setErrors([{ msg: "An unexpected error occurred. Please try again." }]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="formGroup" controlId="formFirstName">
        <Form.Label className="form-label">First Name:</Form.Label>
        <Form.Control
          type="text"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange} 
          isInvalid={!!errors.find((e) => e.path === "first_Name")}
          required
        />
        <Form.Control.Feedback type="invalid">
          {errors.find((e) => e.path === "first_Name")?.msg}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="formGroup" controlId="formLastName">
        <Form.Label>Last Name:</Form.Label>
        <Form.Control
          type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          isInvalid={!!errors.find((e) => e.path === "last_Name")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.find((e) => e.path === "last_Name")?.msg}
        </Form.Control.Feedback>
      </Form.Group>
      
      <Form.Group className="formGroup" controlId="formUsernameLogin">
        <Form.Label>Username:</Form.Label>
        <Form.Control
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          minLength="5" 
          isInvalid={!!errors.find((e) => e.path === "userName")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.find((e) => e.path === "userName")?.msg}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="formGroup" controlId="formPasswordLogin">
        <Form.Label>Password:</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="8"
          isInvalid={!!errors.find((e) => e.path === "password")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.find((e) => e.path === "password")?.msg}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="formGroup" controlId="formEmail">
        <Form.Label>Email:</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          isInvalid={!!errors.find((e) => e.path === "email")}
          required
        />
        <Form.Control.Feedback type="invalid">
          {errors.find((e) => e.path === "email")?.msg}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="formGroup" controlId="formBirthday">
        <Form.Label>Date of Birth:</Form.Label>
        <Form.Control
          type="date"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          isInvalid={!!errors.find((e) => e.path === "birthday")}
        />
      </Form.Group>

      <Button variant="primary" type="submit" disabled={isLoading}>
        {isLoading ? "Signing up..." : "Submit"}
      </Button>
    </Form>
  );
};