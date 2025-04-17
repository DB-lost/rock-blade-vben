import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/common/getUserInfo');
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/common/getCodes');
}

/**
 * 更新用户详细信息
 */
export async function updateUserDetailsApi(data: any) {
  return requestClient.post('/common/updateUserDetails', data);
}
