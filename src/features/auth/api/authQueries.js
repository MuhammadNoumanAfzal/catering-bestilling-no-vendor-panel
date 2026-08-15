export const SEND_SIGNUP_OTP_MUTATION = `
  mutation SendSignupOTP($email: String!) {
    sendSignupOtp(email: $email) {
      success
      message
    }
  }
`;

export const LOGIN_USER_MUTATION = `
  mutation LoginUser($email: String!, $password: String!, $role: String!) {
    loginUser(email: $email, password: $password, role: $role) {
      success
      access
      user {
        id
        email
        firstName
        lastName
        phone
        postCode
        role
        isActive
        applicationStatus
        vendorStatus
        status
      }
    }
  }
`;

export const REGISTER_VENDOR_MUTATION = `
  mutation RegisterVendor($input: SignupFormInput!, $otp: String!) {
    registerUser(input: $input, otp: $otp) {
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
        applicationStatus
        vendorStatus
        status
      }
    }
  }
`;

export const PASSWORD_RESET_MAIL_MUTATION = `
  mutation PasswordResetMail($email: String!, $role: String!) {
    passwordResetMail(email: $email, role: $role) {
      success
      message
    }
  }
`;

export const VERIFY_RESET_CODE_MUTATION = `
  mutation VerifyResetCode($email: String!, $pin: String!) {
    verifyResetCode(email: $email, pin: $pin) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword(
    $email: String!
    $token: String!
    $password1: String!
    $password2: String!
  ) {
    resetPassword(
      email: $email
      token: $token
      password1: $password1
      password2: $password2
    ) {
      success
      message
    }
  }
`;

export const LOGOUT_USER_MUTATION = `
  mutation LogoutUser {
    logoutUser {
      success
      message
    }
  }
`;
