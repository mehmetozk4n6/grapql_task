import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { events, locations, participants, users } from './data.js';

// Odev1 tamamlandı

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
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
  type Location {   
    id: ID!,
    name: String!,
    desc: String,
    lat:Float!,
    lng:Float!,
  }
  type User {   
    id: ID!,
    username: String!,
    email: String,
    events:[Event!],
  }
  type Participant {   
    id: ID!,
    user_id: ID!,
    event_id: ID!,
    username:String!,
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
`;

const resolvers = {
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
