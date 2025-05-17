import { useMutation, useQuery } from "@tanstack/react-query";
import { login, logout, register, updateUser, verifyOTP, resendOTP, resetPassword, passwordResetConfirm, getUser } from "@/services/auth";
import { User } from "@/@types/db";
import { QUERY_KEYS } from "./query-keys";
import { setItem, STORAGE_KEYS } from "@/lib/async-storage";

import { getUser as _getUser } from "@/lib/auth-storage";
import { StackResponse } from "@/@types/generics";

export const useRegister = () => useMutation({
  mutationKey: ['register'],
  mutationFn: async ({...data}: { email: string, username?: string, password: string}) => {
    const response = await register({...data});

    if (!response.error) {
      await setItem(STORAGE_KEYS.AUTH_TOKEN, response?.data?.data?.access_token);
      await setItem(STORAGE_KEYS.REFRESH_TOKEN, response?.data?.data?.refresh_token);
    }

    return response;
  }
})

export const useUser = () => useQuery({
  queryKey: [QUERY_KEYS.get_user],
  queryFn: async () => {
    const user = await _getUser()

    if (user) {
      return { data: user, error: null } as StackResponse<User>;
    } else {
      const response = await getUser();

      return response
    }
  },
})

export const useLogin = () => useMutation({
  mutationKey: ['login'],
  mutationFn: async ({email, password}: { email: string, password: string }) => {
    const response = await login(email, password);

    if (!response?.error) {
        await setItem(STORAGE_KEYS.AUTH_TOKEN, response?.data?.access);
        await setItem(STORAGE_KEYS.REFRESH_TOKEN, response?.data?.refresh);
    }

    return response;
  },
})

export const useLogout = () => useMutation({
  mutationKey: ['logout'],
  mutationFn: logout,
})

export const useUpdateUser = () => useMutation({
  mutationFn: (data: Partial<User>) => updateUser(data),
  mutationKey: [QUERY_KEYS.update_user]
})

export const useVerifyOTP = () => useMutation({
  mutationKey: ['verify-otp'],
  mutationFn: async ({email, otp}: { email: string, otp: string}) => {
    const response = await verifyOTP(email, otp);

    if (!response.error) {
      await setItem(STORAGE_KEYS.AUTH_TOKEN, response?.data?.access_token);
      await setItem(STORAGE_KEYS.REFRESH_TOKEN, response?.data?.refresh_token);
    }

    return response;
  },
})

export const useResendOTP = () => useMutation({
  mutationKey: ['resend-otp'],
  mutationFn: ({email}: { email: string }) => resendOTP(email),
})

export const useResetPassword = () => useMutation({
  mutationKey: ['reset-password'],
  mutationFn: ({email}: { email: string }) => resetPassword(email)
})

export const useResetPasswordConfirm = () => useMutation({
  mutationKey: ['reset-password-confirm'],
  mutationFn: (data: { uid: string, token: string, password: string }) => passwordResetConfirm(data)
})
