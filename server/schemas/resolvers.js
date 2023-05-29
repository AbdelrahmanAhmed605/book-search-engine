const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // Query for the loggedin user
    me: async (parent, args, context) => {
      // Check if the user is authenticated
      if (context.user) {
        // If authenticated, retrieve the user by their ID
        // The user information is available in the `context.user` property set by the authentication middleware
        return User.findOne({ _id: context.user._id });
      }
      // If not authenticated, throw an authentication error
      throw new AuthenticationError("You need to be logged in!");
    },
  },
  Mutation: {
    // Mutation to add a user
    addUser: async (parent, { username, email, password }) => {
      // Create a new user with the provided username, email, and password
      const user = await User.create({ username, email, password });
      // Generate a token for the newly created user
      const token = signToken(user);

      return { token, user };
    },
    // Mutation to allow a user to login
    login: async (parent, { email, password }) => {
      // Find a user with the provided email
      const user = await User.findOne({ email });

      // If no user found, throw an authentication error
      if (!user) {
        throw new AuthenticationError("Incorrect email or password!");
      }

      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);

      // If password is incorrect, throw an authentication error
      if (!correctPw) {
        throw new AuthenticationError("Incorrect email or password!");
      }

      // Generate a token for the authenticated user
      const token = signToken(user);

      return { token, user };
    },
    // Mutation to allow a user to save a book to their profile
    saveBook: async (parent, { input }, context) => {
      // Check if the user is authenticated
      if (context.user) {
        // Add the book to the user's savedBooks array
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: input },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If not authenticated, throw an authentication error
      throw new AuthenticationError("You need to be logged in!");
    },
    // Mutation to allow a user to remove a saved book
    removeBook: async (parent, { bookId }, context) => {
      // Check if the user is authenticated
      if (context.user) {
        // Remove the book from the user's savedBooks array
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      // If not authenticated, throw an authentication error
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
