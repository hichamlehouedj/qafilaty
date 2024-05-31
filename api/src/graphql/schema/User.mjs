import { gql } from 'apollo-server-express';

export const typeDefs = gql`

    scalar Upload

    extend type Query {
        user(id: ID!): User!  @auth(requires: [ANY])
        currentUser: User! @auth(requires: [ANY])
        currentAdmin: User! @auth(requires: [ADMINCOMPANY])

        # deleted defullt value false
        allUsers(idStock: ID!, deleted: Boolean): [User!]!  @auth(requires: [ANY])
        
        # allUsersLimitedBy(offset: Int!,  limit: Int!, option: String): [User!]!
        refreshToken: AuthUser
    }

    extend type Mutation {
        authenticateUser(content: userInfo): AuthUser!
        createUser (content: contentUser): AuthUser!  @auth(requires: [ANY])
        emailVerification(token: String): statusUpdate!
        forgetPassword(email: String): statusUpdate!
        resendVerificationEmail(email: String): statusUpdate!
        changePassword(content: contenPassword): statusUpdate!
        updateUsers (id_person: ID!, content: contentUpdateUser): statusUpdate!  @auth(requires: [ANY])
        updateMyUser (id_person: ID!, content: contentMyUpdateUser): AuthUser  @auth(requires: [ANY])
        activeUser (id_person: ID!, activation: String): statusUpdate!  @auth(requires: [ANY])
        deleteUser (id_person: ID!): statusDelete  @auth(requires: [ANY])

        updateAccessesStock(idPerson: ID!, idStock: ID!): statusUpdate!  @auth(requires: [ANY])

        singleUpload(file: Upload!): File!  @auth(requires: [ANY])
        logOut: statusDelete 
    }

    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }

    type User {
        id:                 ID!
        user_name:          String
        password:           String @auth(requires: [USER])
        role:               String @auth(requires: [ANY])
        activation:         String
        lastConnection:     Date @date(format: "yyyy-MM-dd HH:mm:ss")
        lastDisconnection:  Date @date(format: "yyyy-MM-dd HH:mm:ss")
        person:             Person!
    }

    type AuthUser {
        token: String!
        user:  User
    }

    type AuthTrace {
        id:             ID!
        token:          String
        user_name:      String
        action:         String
        createdAt:      Date @date(format: "dd/MM/yyyy HH:mm:ss")
        company:        Company
    }

    enum roleCompany {
        Factor
        Driver
        Client
    }
    
    input contentUser {
        user_name:      String!
        password:       String!
        role:           roleCompany!
        id_person:      ID!
    }
    
    
    input contentUpdateUser {
        user_name:      String
        newPassword:    String
        role:           String
        person:         contentPerson
    }

    input contentMyUpdateUser {
        user_name:      String
        oldPassword:    String!
        newPassword:    String
        role:           String
        person:         contentPerson
    }

    input userInfo {
        email:      String!
        password:   String!
    }

    input contenPassword {
        token:              String!
        password:           String!
        confirmPassword:    String!
    }
`;