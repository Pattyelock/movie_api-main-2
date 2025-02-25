# Movie App

Welcome to the **Movie App**! This project allows users to explore a movie database, login, and manage their favorite movies.

## Features

- Browse a catalog of movies.
- View movie details, including title, director, description, and genre.
- User authentication and personalized features.
- Responsive design for seamless use across devices.
- Navigation using React Router.

## Technologies Used

- **Frontend**: React, React Bootstrap, React Router
- **Backend**: Node.js, Express.js, MongoDB
- **API Hosting**: Heroku
- **Frontend Hosting**: Netlify

## API Endpoints

- POST /login - Login a user and retrieve a token.
- POST /users/create - Register a new user.
- GET /movies - Fetch all movies.
- GET /movies/\:id - Fetch details of a specific movie.
- PUT /users/update/\:userName - Update user details.
- DELETE /users/\:userName - Remove a user.

For complete API documentation, visit the /documentation endpoint.

## Setup

### Prerequisites

- Node.js
- MongoDB
- React

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/movie-app.git
   cd movie-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
4. Navigate to the frontend directory and run:
   ```bash
   npm start
   ```

### Environment Variables

Ensure to set up the following variables:

- MONGO\_URI for database connection.
- HEROKU\_API\_URL for accessing the hosted API.

## Usage

1. Register or login as a user.
2. Browse through the movie catalog.
3. Click on a movie to view its details.
4. Add or remove movies from your favorites list.

## Deployment

The backend API is hosted on Heroku at: [Heroku API URL](https://movies-my-flix-app-60bc918eee2b.herokuapp.com/)

The frontend application is deployed on Netlify at: [MyFlix App on Netlify](https://myflixsiteapp.netlify.app)

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For inquiries or feedback, please reach out to:

- Email: [daniel.escldrn@gmail.com](mailto\:daniel.escldrn@gmail.com)
- GitHub: [DaniEC3](https://github.com/DaniEC3)

