import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { events, locations, participants, users } from './data.js';
import { nanoid } from 'nanoid'

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Location {   
    id: ID!,
    name: String!,
    desc: String,
    lat:Float!,
    lng:Float!,
  }
  type Participant {   
    id: ID!,
    user_id: ID!,
    event_id: ID!,
    username:String!,
  }
  type User {   
    id: ID!,
    username: String!,
    email: String,
    events:[Event!],
  }
  type Event {   
    id: ID!,
    title: String!,
    desc: String,
    date: String!,
    from: String!,
    to: String!,
    location_id: ID!,
    location:Location!,
    user_id: ID!,
    user:User!,
    participants:[Participant!],
  }
  type DeleteAllOutput{
    count:Int!,
  }
  input CreateUserInput { 
    username: String!,
    email: String,   
  }
  input UpdateUserInput{
    id: ID!,
    username: String!,
    email: String,
  }
  input DeleteUserInput{
    id:ID!,
  }
  input CreateLocationInput{
    name: String!,
    desc: String,
    lat:Float!,
    lng:Float!,
  }
  input UpdateLocationInput{
    id: ID!,
    name: String!,
    desc: String,
    lat:Float!,
    lng:Float!,
  }
  input DeleteLocationInput{
    id:ID!,
  }



  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {

    events: [Event!]!,
    event(id:ID!):Event,

    locations: [Location!]!,
    location(id:ID!):Location!,

    users: [User!]!,
    user(id:ID!):User,

    participants: [Participant!]!,
    participant(id:ID!):Participant,

  }

  type Mutation{
    
    createUser(data:CreateUserInput!):User!
    updateUser(data:UpdateUserInput!):User!
    deleteUser(data:DeleteUserInput!):User!
    deleteAllUsers:DeleteAllOutput!

    createLocation(data:CreateLocationInput!):Location!
    updateLocation(data:UpdateLocationInput!):Location!
    deleteLocation(data:DeleteLocationInput!):Location!
    deleteAllLocations:DeleteAllOutput!

  }
`;


const resolvers = {
  
  Mutation: {

    //USER

    createUser: (parent, {data}) => {
      const user = {
        id: nanoid(),
        ...data
      }
      users.push(user)
      return user
    },
    updateUser: (parent, { data: { username, email, id } }) => {
      const updatedUserIndex = users.findIndex(us => String(us.id) === (id))
      if (updatedUserIndex===-1) {
        throw new Error("User not found!")
      }
      const updatedUser = users[updatedUserIndex] =    { ...users[updatedUserIndex], username, email } 
      return updatedUser
    },
    deleteUser: (parent, { data: { id } }) => {
      const deletedUserIndex = users.findIndex(us => String(us.id) === id)
      if (deletedUserIndex===-1) {
        throw new Error("User not found!")
      }
      const deletedUser = users[deletedUserIndex]
      users.splice(deletedUserIndex, 1)
      return deletedUser
    },
    deleteAllUsers: () => {
      const length = users.length
      users.splice(0, length)
      return {count:length}
    },

    //LOCATION

    createLocation:(parent, { data }) => {
      const location = {
      id: nanoid(),
      ...data
      }
      locations.push(location)
      return location
    },
    updateLocation: (parent, { data: { name, desc, lat,lng,id } }) => {
      const updatedLocationIndex = locations.findIndex(loc => String(loc.id) === (id))
      if (updatedLocationIndex===-1) {
        throw new Error("Location not found!")
      }
      const updatedLocation = locations[updatedLocationIndex] =    { ...locations[updatedLocationIndex],  name, desc, lat,lng } 
      return updatedLocation
    },
    deleteLocation: (parent, { data: { id } }) => {
      const deletedLocationIndex = locations.findIndex(loc => String(loc.id) === id)
      if (deletedLocationIndex===-1) {
        throw new Error("Location not found!")
      }
      const deletedLocation = locations[deletedLocationIndex]
      locations.splice(deletedLocationIndex, 1)
      return deletedLocation
    },
    deleteAllLocations: () => {
      const length = locations.length
      locations.splice(0, length)
      return {count:length}
    },


  },

  Query: {
    events: () => events,
    event: (parent, args) =>
      events.find((event) => event.id === Number(args.id)),
    locations: () => locations,
    location: (parent, args) =>
      locations.find((location) => location.id === Number(args.id)),

    users: () => users,
    user: (parent, args) => users.find((user) => user.id === Number(args.id)),

    participants: () => participants,
    participant: (parent, args) =>
      participants.find((participant) => participant.id === Number(args.id)),
  },
  User: {
    events: (parent, args) =>
      events.filter((event) => event.user_id === parent.id),
  },
  Event: {
    user: (parent, args) => users.find((user) => user.id === parent.user_id),
    location: (parent, args) =>
      locations.find((location) => location.id === parent.location_id),
    participants: (parent, args) =>
      participants.filter((participant) => participant.event_id === parent.id),
  },
  Participant: {
    username: (parent, args) =>
      users.find((user) => user.id === parent.user_id).username,
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
