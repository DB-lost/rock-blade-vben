<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import type { SystemDeptApi } from '#/api/system/dept';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { preferences } from '@vben/preferences';

import { VbenAvatar } from '@vben-core/shadcn-ui';

import { useVbenForm } from '#/adapter/form';
import { getUserInfoApi, updateUserDetailsApi } from '#/api/core/common';
import { $t } from '#/locales';

const emit = defineEmits(['success']);
const formData = ref<SystemDeptApi.SystemDept>();
const getTitle = computed(() => {
  return $t('system.user.persionInfo');
});

function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Upload',
      componentProps: {
        maxSize: 2,
        maxCount: 1,
        accept: 'image/*',
        showUploadList: false,
        uploadUrl: '/api/upload',
      },
      fieldName: 'avatar',
      label: $t('system.user.avatar'),
    },
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
      component: 'Input',
      fieldName: 'phone',
      label: $t('system.user.phone'),
    },
  ];
}

const avatar = computed(() => {
  return formData.value?.avatar ?? preferences.app.defaultAvatar;
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    modalApi.lock();
    const data = await formApi.getValues();
    try {
      await updateUserDetailsApi(data);
      modalApi.close();
      emit('success');
    } finally {
      modalApi.lock(false);
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = await getUserInfoApi();
      formApi.setValues(data);
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4">
      <template #avatar>
        <VbenAvatar
          :src="avatar"
          class="size-20"
          dot-class="bottom-0 right-1 border-2 size-4 bg-green-500"
        />
      </template>
    </Form>
  </Modal>
</template>
