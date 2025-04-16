import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user';

import { getDeptList, getRoleList } from '#/api/system/user';
import { $t } from '#/locales';

export function useFormSchema(): {
  schemas: VbenFormSchema[];
} {
  const schemas = [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.user.nickname'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.user.email'),
      componentProps: {
        type: 'email',
      },
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('system.user.phone'),
    },
    {
      component: 'ApiSelect',
      fieldName: 'dept',
      label: $t('system.user.dept'),
      componentProps: {
        placeholder: $t('system.user.dept'),
        api: getDeptList,
        labelField: 'name',
        valueField: 'id',
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'roles',
      label: $t('system.user.roles'),
      componentProps: {
        placeholder: $t('system.user.roles'),
        api: getRoleList,
        labelField: 'roleName',
        valueField: 'id',
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.user.status'),
    },
  ];

  return {
    schemas,
  };
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.user.nickname'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.user.email'),
    },
    {
      component: 'ApiSelect',
      fieldName: 'dept',
      label: $t('system.user.dept'),
      componentProps: {
        api: getDeptList,
        labelField: 'name',
        valueField: 'id',
      },
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getRoleList,
        labelField: 'roleName',
        valueField: 'id',
      },
      fieldName: 'roles',
      label: $t('system.user.roles'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: '1' },
          { label: $t('common.disabled'), value: '0' },
        ],
      },
      fieldName: 'status',
      label: $t('system.user.status'),
    },
  ];
}

export function useColumns<T = SystemUserApi.SystemUser>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'username',
      title: $t('system.user.username'),
      width: 150,
    },
    {
      field: 'nickname',
      title: $t('system.user.nickname'),
      width: 150,
    },
    {
      field: 'email',
      title: $t('system.user.email'),
      width: 200,
    },
    {
      field: 'phone',
      title: $t('system.user.phone'),
      width: 150,
    },
    {
      field: 'depts',
      title: $t('system.user.dept'),
    },
    {
      field: 'roles',
      title: $t('system.user.roles'),
      width: 500,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: {
          checkedValue: '1',
          unCheckedValue: '0',
        },
      },
      field: 'status',
      title: $t('system.user.status'),
      width: 100,
    },
    {
      field: 'createdAt',
      title: $t('system.user.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: $t('system.user.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 130,
    },
  ];
}
