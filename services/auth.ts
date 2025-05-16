import { LoginResponse, OTPResponse, RefreshResponse, RegisterResponse, ResendOTPResponse, ResetPasswordConfirmResponse, ResetPasswordResponse } from "@/@types/auth"
import { User } from "@/@types/db"
import { StackResponse } from "@/@types/generics"
import { stackbase } from "@/lib/stackbase"
import { status as STATUS } from "@/constants/Status"

/**
 * `await getUser()` - Get the currently logged in user based on the cookie session.
 */
export async function getUser(): Promise<StackResponse<User | null>> {
  try {
    const { data } = await stackbase.get("/auth/user/")
    return data
  } catch (error: any) {
    return {
        message: error?.response?.data?.message || error?.response?.data?.detail,
        data: null,
        error: error?.response?.data,
        status: error?.status
    }
  }
}

/**
 * 
 * @param username - User's username which must be unique to every user.
 * @returns User | null
 */
export async function getProfile(username: string) {
  try {

    // const profile = await redis.get(`profile:${username}`)

    const { data } = await stackbase.get(`/profile/${username}/`)
    return data as User
  } catch (error: any) {
    console.error(error)
    return null
  }
}

/**
 * 
 * @param email - user's email
 * @param password - user's password
 * @returns 
 */
export async function login(email: string, password: string): Promise<StackResponse<LoginResponse | null>> {
  try {
    const { data, status } = await stackbase.post("/auth/login/", { email, password })
    const response = data as LoginResponse

    if (status === STATUS.HTTP_200_SUCCESSFUL) {

      return {
        data: response,
        message: "Log in successful",
        status: STATUS.HTTP_200_SUCCESSFUL,
        error: null
      }
    } else {
      return {
        data: null,
        message: "An unknown error has occured.",
        status: status,
        error: { detail: "An unknown error has occured." }
      }
    }

  } catch (error: any) {
    return {
      data: null,
      message: error?.response?.data?.detail,
      status: error?.status,
      error: { detail: error?.response?.data?.message || error?.response?.data?.detail }
    }
  }
}

/**
 * @description Log a user out - blacklists tokens on the backend.
 * @returns status response
 */
export async function logout(): Promise<StackResponse<{ message: string } | null>> {

  try {
    const { data, status } = await stackbase.post("/auth/logout/", { refresh: null })

    if (status === STATUS.HTTP_205_RESET_CONTENT) {

      
      return {
        data: { message: "Logged out successfully" },
        status: STATUS.HTTP_205_RESET_CONTENT,
        message: "Logged out successfully",
        error: null
      }
    } else {
      return {
        data: null,
        status: status,
        message: "An unknown error has occured.",
        error: { detail: "An unknown error has occured." }
      }
    }

  } catch (error: any) {
    return {
      data: null,
      message: error?.response?.data?.detail,
      status: error?.status,
      error: error?.response?.data
    }
  }
}

/**
 * @description get a user's refreshToken
 */
export async function refreshToken() {

  try {
    const { data } = await stackbase.post("/auth/refresh/", { refresh: null })

    return data as RefreshResponse

  } catch (error: any) {
    console.error(error)
    return null
  }
}

/**
 * @description a function that creates a new account for a user.
 * @param `email`, `password`, `username?`
 * @returns 
 */
export async function register({email, password, username}: { email: string; password: string, username?: string }): Promise<StackResponse<RegisterResponse | null>> {
  try {
    const { data, status } = await stackbase.post("/auth/register/", { email, password, username })
    
    const res = data as RegisterResponse

    if (status === STATUS.HTTP_201_CREATED || status === STATUS.HTTP_200_SUCCESSFUL) {

      return {
        data: res,
        status: status,
        message: "Account created successfully",
        error: null
      }
    } else {
      return {
        data: null,
        status: status,
        message: "An unknown error has occured.",
        error: { detail: "An unknown error has occured." }
      }
    }

  } catch (error: any) {
    return {
      data: null,
      message: error?.response?.data?.message || error?.response?.data?.detail,
      status: error?.status,
      error: { detail: error?.response?.data?.message || error?.response?.data?.detail }
    }
  }
}

/**
 * @param input - Partially update a user's info including:
 * `first_name, last_name and avatar`,
 * @returns 
 */
export async function updateUser(input: Partial<User>): Promise<StackResponse<User | null>> {
  try {
    const { data, status } = await stackbase.put(`/auth/update-user/`, input)

    if (data) {
      return {
        data: data as User,
        status: status,
        message: "User updated successfully",
        error: null
      }
    }

    else return {
      data: null,
      status: status,
      message: "An unknown error has occured.",
      error: { detail: "An unknown error has occured." }
    }
  } catch (error: any) {
    return {
      data: null,
      message: error?.response?.data?.message || error?.response?.data?.detail,
      status: error?.status,
      error: error?.response?.data
    }
  }
}

/**
 * @description This function works by adding a user to a user_followers array where a user is not already in the array.
 * Where a user is in the array, a subsequent request to this same endpoint with the same parameters will unfollow a user
 * @param userId - the user's id to be followed or unfollowed
 * @returns 
 */
export async function followUnfollowUser(userId: string) {
  try {
    const { data, status } = await stackbase.post(`/users/${userId}/follow/`)
    if (status === STATUS.HTTP_201_CREATED || status === STATUS.HTTP_200_SUCCESSFUL) {
      return data as { detail: string }
    } else {
      return data as { detail: string }
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * @description Verify a user's OTP
 * @param email - the user's email
 * @param otp - the otp sent to the user's email
 * @returns 
 */
export async function verifyOTP(email: string, otp: string): Promise<StackResponse<OTPResponse | null>> {
  try {
    const { data, status } = await stackbase.post(`/auth/verify-otp/`, {email, otp})

    if (status === STATUS.HTTP_200_SUCCESSFUL) {

      return {
        data: data as OTPResponse,
        status: status,
        message: "OTP verified successfully",
        error: null
      }
    } else {
      return {
        data: null,
        status: status,
        message: "An unknown error has occured.",
        error: { detail: "An unknown error has occured." }
      }
    }

  } catch (error: any) {
    return {
      data: null,
      message: error?.response?.data?.message || error?.response?.data?.detail,
      status: error?.status,
      error: error?.response?.data
    }
  }
}

/**
 * @description Resend an email otp to a user
 * @param email - a user's valid email, it must be in existence.
 * @returns 
 */
export async function resendOTP(email: string): Promise<StackResponse<ResendOTPResponse | null>> {
  try {
    const { data, status } = await stackbase.post(`/auth/resend-otp/`, {email})

    console.log(data)

    if (status === STATUS.HTTP_200_SUCCESSFUL) {

      return {
        data: data as ResendOTPResponse,
        status: status,
        message: "OTP sent successfully",
        error: null
      }
    } else {
      return {
        data: null,
        status: status,
        message: "An unknown error has occured.",
        error: { detail: "An unknown error has occured." }
      }
    }

  } catch (error: any) {
    return {
      data: null,
      message: error?.response?.data?.message || error?.response?.data?.detail,
      status: error?.status,
      error: error?.response?.data
    }
  }
}

/**
 * @description A function that resets a user's password based on his email.
 * @param email - The user's email
 * @returns 
 */
export async function resetPassword(email: string) {
  try {
    const { data, status } = await stackbase.post(`/auth/password-reset/`, {email})

    if (status === STATUS.HTTP_200_SUCCESSFUL) {

      return { data: data as ResetPasswordResponse, status }
    }

  } catch (err: any) {
    console.error(err)

    if (err?.status === STATUS.HTTP_400_BAD_REQUEST) {
      return { data: err?.response?.data as ResetPasswordResponse, status: err?.status }
    }

    if (err?.status === STATUS.HTTP_404_NOT_FOUND) {
      return { data: err?.response?.data as ResetPasswordResponse, status: err?.status }
    } else {
      throw new Error('An unknown error has occured.')
    }
  }
}

/**
 * @description a function that validates a token and returns a response
 * @param uid string (A uid string pickable from the urlParams)
 * @param token string (A valid base-64 encoded token)
 */
export async function validateToken(uid: string, token: string) {
  try {
    const { data, status } = await stackbase.post(`/auth/password-reset/validate-token/${uid}/${token}/`)

    if (status === STATUS.HTTP_200_SUCCESSFUL) {

      return { data: data as ResetPasswordResponse, status }
    }

  } catch (err: any) {
    console.error(err)

    if (err?.status === STATUS.HTTP_400_BAD_REQUEST) {
      return { data: err?.response?.data as ResetPasswordResponse, status: err?.status }
    }

    if (err?.status === STATUS.HTTP_404_NOT_FOUND) {
      return { data: err?.response?.data as ResetPasswordResponse, status: err?.status }
    } else {
      throw new Error('An unknown error has occured.')
    }
  }
}

/**
 * @description A function that simply resets a password after `validateToken()` is successful
 * @param { uid: string, token: string, password: string } - `password` is the new password field.
 */
export async function passwordResetConfirm({ uid, token, password }:{uid: string, token: string, password: string}) {
  try {
    const { data, status } = await stackbase.post(`/auth/password-reset/confirm/${uid}/${token}/`, { password })

    if (status === STATUS.HTTP_200_SUCCESSFUL) {
      const res = data as ResetPasswordConfirmResponse

      return { data: res, status }
    }

  } catch (err: any) {
    console.error(err)

    if (err?.status === STATUS.HTTP_400_BAD_REQUEST) {
      return { data: err?.response?.data as ResetPasswordConfirmResponse, status: err?.status }
    }

    if (err?.status === STATUS.HTTP_404_NOT_FOUND) {
      return { data: err?.response?.data as ResetPasswordConfirmResponse, status: err?.status }
    } else {
      throw new Error('An unknown error has occured.')
    }
  }
}
