import { ApolloServer, gql } from 'apollo-server-micro'

const store = {
  messages: ['hi', 'how are you?'],
  todos: [
    {
      id: 0,
      text: "Go to the shop",
      complete: false
    },
    {
      id: 1,
      text: "Go to school",
      complete: true
    },
    {
      id: 2,
      text: "Use urql",
      complete: false
    }
  ]
};

const typeDefs = gql`
  type Query {
    todos: [Todo]
    messages: [String]
    messagesPaginated(from: Int! limit: Int!): [String]
    media: Media
    schoolBooks: [CoolBook]
  }

  type Mutation {
    toggleTodo(id: ID!): Todo!
    toggleTodos(id: [ID!]!): [Todo!]!
    toggleTodosOptionalArray(id: [ID!]!): [Todo!]
    toggleTodosOptionalEntity(id: [ID!]!): [Todo]!
    toggleTodosOptional(id: [ID!]!): [Todo]
    updateMedia(id: ID!): Media
  }

  interface CoolBook {
    id: ID
    title: String
    author: Author
  }

  type Textbook implements CoolBook {
    id: ID
    title: String
    author: Author
    todo: Todo
  }

  type Author {
    id: ID
    name: String
    friends: [Author]
    friendsPaginated(from: Int! limit: Int!): [Author]
  }

  type Todo {
    id: ID
    text: String
    complete: Boolean
    author: Author
  }

  union Media = Book | Movie

  
  type Book {
    id: ID
    title: String
    pages: Int
  }

  type Movie {
    id: ID
    title: String
    duration: Int
  }
`;

const resolvers = {
  Media: {
    __resolveType(obj, context, info){
      if(obj.name){
        return 'Author';
      }
      if(obj.title){
        return 'Book';
      }
      return null; // GraphQLError is thrown
    },
  },
  Query: {
    todos: () => store.todos,
    messages: () => store.messages,
  },
  Mutation: {
    toggleTodo: (_root, { id }) => {
      store.todos[id].complete = !store.todos[id].complete;
      return store.todos[id];
    }
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export const config = {
  api: {
    bodyParser: false,
  },
}

export default server.createHandler({ path: '/api/graphql' })
