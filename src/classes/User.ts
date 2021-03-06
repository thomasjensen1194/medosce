import Apollo from './Apollo';
import { gql } from 'apollo-boost';
import authReducer from 'redux/reducers/auth';
import Role from './Role';
import store from 'config/persistStore';

interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

interface UserInput {
  username: string;
  password: string;
  email: string;
}

class User {
  /**
   * Fetches the user object based on the stored cookie. Cookie can be placed by login or user creation.
   */
  static fetch = async () => {
    const query = gql`
      query {
        user {
          id
          username
          email
          role {
            id
          }
        }
      }
    `;

    const user = await Apollo.query<User>('user', query);
    store.dispatch(authReducer.actions.login(user));
  };

  /**
   * Logges in a user, returns a JWT-token as cookie
   */
  static login = async (data: UserInput) => {
    const query = gql`
      query($data: UserInput) {
        login(data: $data)
      }
    `;

    await Apollo.query<string>('login', query, { data }); // JWT-Token is stored in cookie
    await User.fetch();
  };

  /**
   * Creates user, and logges the user in. Returns a JWT-token as cookie.
   */
  static createUser = async (data: UserInput) => {
    const mutation = gql`
      mutation($data: UserInput) {
        createUser(data: $data)
      }
    `;
    await Apollo.mutate<string>('createUser', mutation, { data }); // JWT-Token
    await User.fetch();
  };

  /**
   * Logges a user out, by deleting the cookie, and removing from redux
   */
  static logout = async () => {
    const query = gql`
      query {
        logout
      }
    `;

    await Apollo.query<string>('logout', query);
    store.dispatch(authReducer.actions.logout());
  };
}

export default User;
