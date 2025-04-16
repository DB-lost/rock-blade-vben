import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    id: string;
    name: string;
    remark?: string;
    status: '0' | '1';
    createdAt: string;
  }
}

enum Api {
  BaseDept = '/dept',
  GetDeptList = '/dept/list',
}

/**
 * 获取部门列表数据
 */
async function getDeptList() {
  return requestClient.get<Array<SystemDeptApi.SystemDept>>(Api.GetDeptList);
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.post(Api.BaseDept, data);
}

/**
 * 更新部门
 *
 * @param id 部门 ID
 * @param data 部门数据
 */
async function updateDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.put(Api.BaseDept, data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: string) {
  return requestClient.delete(`${Api.BaseDept}/${id}`);
}

export { createDept, deleteDept, getDeptList, updateDept };
