import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { events, locations, participants, users } from './data.js';
import { nanoid } from 'nanoid'



//  const pubSub = createPubSub()

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

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
    updateUser: (parent, { data }) => {
      const updatedUserIndex = users.findIndex(us => String(us.id) === (data.id))
      if (updatedUserIndex===-1) {
        throw new Error("User not found!")
      }
      const updatedUser = users[updatedUserIndex] =    { ...users[updatedUserIndex], ...data } 
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

    // EVENT

    createEvent:(parent, { data }) => {
      const event = {
      id: nanoid(),
      ...data
      }
      events.push(event)
      return event
    },
    updateEvent: (parent, { data }) => {
      const updatedEventIndex = events.findIndex(ev => String(ev.id) === (data.id))
      if (updatedEventIndex===-1) {
        throw new Error("Event not found!")
      }
      const updatedEvent = events[updatedEventIndex] =    { ...events[updatedEventIndex], ...data } 
      return updatedEvent
    },
    deleteEvent: (parent, { data: { id } }) => {
      const deletedEventIndex = events.findIndex(ev => String(ev.id) === id)
      if (deletedEventIndex===-1) {
        throw new Error("Event not found!")
      }
      const deletedEvent = events[deletedEventIndex]
      events.splice(deletedEventIndex, 1)
      return deletedEvent
    },
    deleteAllEvents: () => {
      const length = events.length
      events.splice(0, length)
      return {count:length}
    }, 

    // PARTICIPANT

    createParticipant: (_, { data }) => {
      const participant = {
      id: nanoid(),
      ...data
      }
      participants.push(participant)
      return participant
    },
    updateParticipant: (parent, { data }) => {
      const updatedParticipantIndex = participants.findIndex(par => String(par.id) === (data.id))
      if (updatedParticipantIndex===-1) {
        throw new Error("Participant not found!")
      }
      const updatedParticipant = participants[updatedParticipantIndex] =    { ...participants[updatedParticipantIndex] ,  ...data } 
      return updatedParticipant
    },
    deleteParticipant: (parent, { data: { id } }) => {
      const deletedParticipantIndex = participants.findIndex(par => String(par.id) === id)
      if (deletedParticipantIndex===-1) {
        throw new Error("Participant not found!")
      }
      const deletedParticipant = participants[deletedParticipantIndex]
      participants.splice(deletedParticipantIndex, 1)
      return deletedParticipant
    },
    deleteAllParticipants: () => {
      const length = participants.length
      participants.splice(0, length)
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
    username: (parent, args) => users.find((use) => String(use.id )=== String(parent.user_id))?.username
  },

  
};


 
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);