import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: string;
    username: string;
    nickname: string;
    email?: string;
    status: '0' | '1';
    updatedAt: string;
    deptInfo: {
      deptIds: string[];
      depts: string[];
    };
    roleInfo: {
      roleIds: string[];
      roles: string[];
    };
  }

  export interface DeptList {
    id: string;
    name: string;
  }

  export interface RoleList {
    id: string;
    roleName: string;
  }
}

enum Api {
  BaseUser = '/user',
  GetDeptList = '/user/getDeptList',
  GetRoleList = '/user/getRoleList',
  UserPage = '/user/page',
}

/**
 * 获取用户分页数据
 */
async function getUserPage(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(Api.UserPage, {
    params,
  });
}

/**
 * 创建用户
 * @param data 用户数据
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.post(Api.BaseUser, data);
}

/**
 * 更新用户
 * @param data 用户数据
 */
async function updateUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.put(Api.BaseUser, data);
}

/**
 * 删除用户
 * @param id 用户 ID
 */
async function deleteUser(id: string) {
  return requestClient.delete(`${Api.BaseUser}/${id}`);
}

/**
 * 获取部门列表
 */
async function getDeptList() {
  return requestClient.get<Array<SystemUserApi.DeptList>>(Api.GetDeptList);
}

/**
 * 获取角色列表
 */
async function getRoleList() {
  return requestClient.get<Array<SystemUserApi.RoleList>>(Api.GetRoleList);
}

export {
  createUser,
  deleteUser,
  getDeptList,
  getRoleList,
  getUserPage,
  updateUser,
};
