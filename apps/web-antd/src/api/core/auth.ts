import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 发送邮箱验证码 */
  export interface SendEmailCodeRequest {
    /** 邮箱 */
    email: string;
    /** 业务类型（register-注册 reset-重置密码） */
    type: string;
  }

  /** 校验邮箱验证码 */
  export interface VerifyEmailCodeRequest {
    /** 邮箱 */
    email: string;
    /** 业务类型（register-注册 reset-重置密码） */
    type: string;
    /** 验证码 */
    code: string;
  }

  /** 用户注册请求 */
  export interface RegisterRequest {
    /** 邮箱 */
    email: string;
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
    /** 随机数 */
    nonce: string;
    /** 手机号 */
    phone: string;
  }

  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  export interface GetPublicKeyResponse {
    publicKey: string;
    nonce: string;
  }

  /** 重置密码请求 */
  export interface ResetPasswordRequest {
    /** 邮箱 */
    email: string;
    /** 密码 */
    password: string;
    /** 随机数 */
    nonce: string;
  }
}

enum Api {
  GetPublicKey = '/auth/getPublicKey',
  Register = '/auth/register',
  ResetPassword = '/auth/resetPassword',
  SendEmailCode = '/auth/sendEmailCode',
  VerifyEmailCode = '/auth/verifyEmailCode',
}

/**
 * 发送邮箱验证码
 * @param data
 */
export async function sendEmailCodeApi(data: AuthApi.SendEmailCodeRequest) {
  return requestClient.post(Api.SendEmailCode, data);
}

/**
 * 校验邮箱验证码
 * @param data
 */
export async function verifyEmailCode(data: AuthApi.VerifyEmailCodeRequest) {
  return requestClient.post(Api.VerifyEmailCode, data);
}

/**
 * 获取公钥
 */
export async function getPublicKey() {
  return requestClient.post<AuthApi.GetPublicKeyResponse>(Api.GetPublicKey, {});
}

/**
 * 用户注册
 * @param data
 */
export async function register(data: AuthApi.RegisterRequest) {
  return requestClient.post(Api.Register, data);
}

/**
 * 重置密码
 * @param data
 */
export async function resetPassword(data: AuthApi.ResetPasswordRequest) {
  return requestClient.post(Api.ResetPassword, data);
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
