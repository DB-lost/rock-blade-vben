import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: number;
    name: string;
    permissions: string[];
    remark?: string;
    status: '0' | '1';
  }
}

enum Api {
  BaseRole = '/role',
  RoleList = '/role/list',
}

/**
 * 获取角色列表数据
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(Api.RoleList, {
    params,
  });
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post(Api.BaseRole, data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.put(Api.BaseRole, data);
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteRole(id: number) {
  return requestClient.delete(`${Api.BaseRole}/${id}`);
}

export { createRole, deleteRole, getRoleList, updateRole };
