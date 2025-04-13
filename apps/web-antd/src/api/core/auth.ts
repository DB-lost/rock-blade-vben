import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口返回值 */
  export interface SendEmailCodeRequest {
    /** 邮箱 */
    email: string;
    /** 业务类型（register-注册 reset-重置密码） */
    type: string;
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
}

enum Api {
  SendEmailCode = '/auth/sendEmailCode',
}

/**
 * 发送邮箱验证码
 * @param data
 */
export async function sendEmailCodeApi(data: AuthApi.SendEmailCodeRequest) {
  return requestClient.post(Api.SendEmailCode, data);
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
