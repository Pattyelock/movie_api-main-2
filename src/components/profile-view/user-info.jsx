import React from "react";
import { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function UserInfo({user,setUser, onLoggedOut}) {
  const navigate = useNavigate();
  if (!user) {
    return <div>Loading...</div>; // Or another loading state
  }
  
  const token = localStorage.getItem("token"); // or wherever you store the token
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [editableUser, setEditableUser] = useState({
  first_Name: user.first_Name || "",  // Ensure it’s never undefined
  last_Name: user.last_Name || "",    // Ensure it’s never undefined
  userName: user.userName || "",
  email: user.email || "",
  birthDay: user.birthDay || "",
  });

  useEffect(() => {
    // Update editableUser when the user prop changes
    setEditableUser({
      first_Name: user.first_Name || "",
      last_Name: user.last_Name || "",
      userName: user.userName || "",
      email: user.email || "",
      birthDay: user.birthDay || "",
    });
  }, [user]);

  // console.log(editableUser)
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Extract 'name' and 'value' from the input field
    setEditableUser((prevState) => ({
      ...prevState, // Keep all previous properties intact
      [name]: value, // Update only the specific field being edited
    }));
  };

  const handleSave = async () => {
    
    try {
      const url = `https://movie-api-main-2-81ab4bbd4cbf.herokuapp.com/users/update/${user.userName}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include token in the header
        },
        body: JSON.stringify(editableUser),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update the profile");
      }
  
      alert("Profile updated successfully!");
      
      // Refetch the updated user data
      const updatedUserResponse = await fetch(`https://movies-my-flix-app-60bc918eee2b.herokuapp.com/users/${editableUser.userName}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}` // Include token in the header
        }
      });

      const updatedUser = await updatedUserResponse.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
      setEditableUser(updatedUser);
      setIsEditing(false); // Switch back to view mode
    } catch (error) {
      console.error("Error updating the profile:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const deletingUser = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
  
    if (!confirmDelete) {
      return; // Exit if user cancels
    }
    console.log("Deleting user with ID:", user.userName);
    if (!user?._id || !token) {
      alert("User ID or authentication token is missing.");
      return;
    }

    const url = `https://movies-my-flix-app-60bc918eee2b.herokuapp.com/users/${user.userName}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include token in the header
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete the profile");
      }
  
      alert("Profile deleted successfully!");
      
      onLoggedOut();

    } catch (error) {
      console.error("Error deleting the profile:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
     <Container>
        <Row>
          <Col md={8} className="mx-auto">
            <h1>Profile View</h1>
            <Form>
              <Form.Group controlId="formFirstName">
                <Form.Label>First Name:</Form.Label>
                <Form.Control
                  type="text"
                  name="first_Name"
                  value={editableUser.first_Name}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formLastName">
                <Form.Label>Last Name:</Form.Label>
                <Form.Control
                  type="text"
                  name="last_Name"
                  value={editableUser.last_Name}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formUsername">
                <Form.Label>Username:</Form.Label>
                <Form.Control
                  type="text"
                  name="userName"
                  value={editableUser.userName}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editableUser.email}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formBirthday">
                <Form.Label>Date of Birth:</Form.Label>
                <Form.Control
                  type="text"
                  name="birthDay"
                  value={editableUser.birthDay}
                  readOnly={!isEditing}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          </Col>
          <Row className="justify-content-center">
            <Col md={6} className="d-flex flex-column align-items-center">
              {isEditing ? (
                <Button variant="primary" className="w-100" onClick={handleSave}>
                  Save
                </Button>
              ) : (
                <Button variant="primary" className="w-100" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
              <Button variant="secondary" className="deleteUserBt w-50 mt-2" onClick={() => deletingUser()}>
                Delete User
              </Button>
            </Col>
          </Row>
        </Row>
      </Container>
    </>

  );

};

export default UserInfo