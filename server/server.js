// Import required modules
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");

const path = require("path");
const db = require("./config/connection");
const routes = require("./routes");

// Create an instance of the express application
const app = express();

const PORT = process.env.PORT || 3001;

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// Use middleware to parse URL-encoded and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve client/build as static assets if in production mode
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// Set a route to serve the client's index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Connect ApolloServer to the Express app
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  // Once the database connection is open, start the server
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Start the ApolloServer and listen for incoming requests
startApolloServer();
