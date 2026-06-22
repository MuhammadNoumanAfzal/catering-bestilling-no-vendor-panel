export const LOGIN_USER_MUTATION = `
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      success
      access
      user {
        id
        email
        firstName
        lastName
        phone
        role
        isActive
      }
    }
  }
`;

export const REGISTER_VENDOR_MUTATION = `
  mutation RegisterVendor(
    $email: String!
    $phone: String!
    $password: String!
    $role: String!
    $firstName: String!
    $lastName: String!
    $companyName: String!
    $postCode: Int!
  ) {
    registerUser(
      input: {
        email: $email
        phone: $phone
        password: $password
        role: $role
        firstName: $firstName
        lastName: $lastName
        companyName: $companyName
        postCode: $postCode
      }
    ) {
      success
      message
      user {
        id
        email
        firstName
        lastName
        phone
        role
        companyName
        postCode
        isActive
      }
    }
  }
`;
