const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar Date
  #######################
  ### USER MANAGEMENT ###
  #######################
  type User {
    id: ID!
    email: String!
    token: String
    createdAt: String!
    approvedAt: String
    approvedBy: String
    # 0: blocked, 1: verified, 2: admin, 3: super admin
    approvedLevel: Int
  }
  ####################
  ### ROOT QUERIES ###
  ####################
  type Query {
    user: User
  }
  type Mutation {
    # login user with token
    login(token: String!): User!
    # email a login token to the user
    requestLogin(email: String!): Boolean!
    # approve a user (dont return token for user)
    approveUser(token: String!): User
  }
`;
