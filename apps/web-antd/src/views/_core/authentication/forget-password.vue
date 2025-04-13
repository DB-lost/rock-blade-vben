<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useVbenForm, VbenButton, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@vben-core/shadcn-ui';

import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import { Key, LogIn, Mail } from 'lucide-vue-next';

import {
  getPublicKey,
  resetPassword,
  sendEmailCodeApi,
  verifyEmailCode,
} from '#/api/core/auth';
import { useAuthStore } from '#/store';
import { rsaCrypto } from '#/utils/crypto';

defineOptions({ name: 'ForgetPassword' });

const authStore = useAuthStore();
const router = useRouter();
const stepIndex = ref(1);
const email = ref('');
const password = ref('');
const loading = ref(false);
const CODE_LENGTH = 6;

// 创建防抖发送函数
const debouncedSendCode = debounce(async (email: string, type: string) => {
  await sendEmailCodeApi({ email, type }).then(() => {
    message.success($t('page.auth.sendCodeSuccess'));
  });
}, 500);

const steps = [
  {
    step: 1,
    title: $t('page.auth.verifyEmail'),
    description: $t('page.auth.verifyEmailDesc'),
    icon: Mail,
  },
  {
    step: 2,
    title: $t('page.auth.resetPassword'),
    description: $t('page.auth.resetPasswordDesc'),
    icon: Key,
  },
  {
    step: 3,
    title: $t('page.auth.completed'),
    description: $t('page.auth.completedDesc'),
    icon: LogIn,
  },
];

// 邮箱验证step的schema
const emailFormSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('page.auth.emailTip'),
      },
      fieldName: 'email',
      label: $t('page.auth.email'),
      rules: z.string().email({ message: $t('page.auth.emailFormatTip') }),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        createText: (countdown: number) => {
          const text =
            countdown > 0
              ? $t('authentication.sendText', [countdown])
              : $t('authentication.sendCode');
          return text;
        },
        handleSendCode: async () => {
          loading.value = true;
          try {
            if (!formApi) {
              throw new Error('formApi is not ready');
            }
            await formApi.validateField('email');
            const isEmailReady = await formApi.isFieldValid('email');
            if (!isEmailReady) {
              throw new Error('Email is not Ready');
            }
            const { email } = await formApi.getValues();
            await debouncedSendCode(email, 'reset');
          } catch (error: unknown) {
            if (error instanceof Error) {
              message.error(error.message);
            }
          } finally {
            loading.value = false;
          }
        },
        placeholder: $t('authentication.code'),
        type: 'reset',
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
});

// 重置密码step的schema
const resetPasswordFormSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('page.auth.password'),
      },
      fieldName: 'password',
      label: $t('page.auth.password'),
      renderComponentContent() {
        return {
          strengthText: () => $t('page.auth.passwordStrength'),
        };
      },
      rules: z.string().min(1, { message: $t('page.auth.passwordTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('page.auth.confirmPassword'),
      },
      dependencies: {
        rules(values) {
          const { password } = values;
          return z
            .string({ required_error: $t('page.auth.passwordTip') })
            .min(1, { message: $t('page.auth.passwordTip') })
            .refine((value) => value === password, {
              message: $t('page.auth.confirmPasswordTip'),
            });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirmPassword',
      label: $t('page.auth.confirmPassword'),
    },
  ];
});

const currentFormSchema = computed(() => {
  switch (stepIndex.value) {
    case 1: {
      return emailFormSchema.value;
    }
    case 2: {
      return resetPasswordFormSchema.value;
    }
    default: {
      return [];
    }
  }
});

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      hideLabel: true,
      hideRequiredMark: true,
    },
    schema: currentFormSchema,
    resetButtonOptions: {
      size: 'lg',
      content: computed(() =>
        stepIndex.value === 2
          ? $t('page.auth.back')
          : $t('page.auth.backToLogin'),
      ),
      show: computed(() => stepIndex.value !== 3),
      onClick: async () => {
        if (stepIndex.value === 1) {
          router.push('/auth/login');
        } else if (stepIndex.value === 2) {
          stepIndex.value = 1;
        }
      },
    },
    submitButtonOptions: {
      size: 'lg',
      content: computed(() =>
        stepIndex.value === 2 ? $t('page.auth.submit') : $t('page.auth.next'),
      ),
      show: computed(() => stepIndex.value !== 3),
      onClick: async () => {
        if (stepIndex.value === 1) {
          const values = await formApi.validate();
          if (values.valid) {
            const verified = await _verifyEmailCode(values);
            if (verified) stepIndex.value++;
          }
        } else if (stepIndex.value === 2) {
          const values = await formApi.validate();
          if (values.valid) {
            const success = await _handleResetPassword(values);
            if (success) stepIndex.value++;
          }
        }
      },
    },
  }),
);

// 验证邮箱验证码
async function _verifyEmailCode(_values: Recordable<any>) {
  // 这里调用验证码验证API
  await verifyEmailCode({
    email: _values.values.email,
    code: _values.values.code,
    type: 'reset',
  }).then(() => {
    message.success($t('page.auth.codeVerifySuccess'));
  });
  email.value = _values.values.email;
  return true;
}

// 重置密码
async function _handleResetPassword(_values: Recordable<any>) {
  loading.value = true;
  try {
    // 获取公钥
    await getPublicKey().then((res) => {
      // 使用工具类设置公钥和nonce
      rsaCrypto.setPublicKey(res.publicKey, res.nonce);
    });
    // 使用RSA工具类加密密码
    const encryptedPassword = rsaCrypto.encryptData(_values.values.password);

    if (!encryptedPassword) {
      message.error($t('page.auth.encryptionFailure'));
      return;
    }
    // 调用重置密码API
    await resetPassword({
      /** 邮箱 */
      email: email.value,
      /** 密码 */
      password: encryptedPassword,
      /** 随机数 */
      nonce: rsaCrypto.getNonce(),
    }).then(() => {
      message.success($t('page.auth.resetPasswordSuccess'));
      password.value = _values.values.password;
    });
    return true;
  } finally {
    loading.value = false;
  }
}

// 直接登录
async function handleDirectLogin() {
  stepIndex.value = 1;
  authStore
    .authLogin({
      email: email.value,
      password: password.value,
    })
    .finally(() => {
      email.value = '';
      password.value = '';
    });
}

// 返回登录界面
function handleBackToLogin() {
  router.replace('/login');
}
</script>

<template>
  <div>
    <!-- title -->
    <div
      class="mb-7 flex flex-col items-center sm:mx-auto sm:w-full sm:max-w-md"
    >
      <h2
        class="text-foreground mb-3 text-3xl font-bold leading-9 tracking-tight lg:text-4xl"
      >
        {{ $t('authentication.forgetPassword') }} 🔑
      </h2>

      <p class="text-muted-foreground lg:text-md text-sm">
        {{ $t('authentication.forgetPasswordSubtitle') }}
      </p>
    </div>
    <Stepper v-model="stepIndex" class="block w-full">
      <div class="flex-start flex w-full gap-2">
        <StepperItem
          v-for="step in steps"
          :key="step.step"
          v-slot="{ state }"
          class="relative flex w-full flex-col items-center justify-center"
          :step="step.step"
        >
          <StepperSeparator
            v-if="step.step !== steps?.[steps.length - 1]?.step"
            class="bg-muted group-data-[state=completed]:bg-primary absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full"
          />

          <StepperTrigger as-child>
            <VbenButton
              :variant="
                state === 'completed' || state === 'active'
                  ? 'default'
                  : 'outline'
              "
              size="icon"
              class="z-10 shrink-0 rounded-full"
              :class="[
                state === 'active' &&
                  'ring-ring ring-offset-background ring-2 ring-offset-2',
              ]"
              :disabled="state !== 'completed'"
            >
              <component
                :is="step.icon"
                class="size-5"
                :class="{
                  'text-primary': state === 'completed' || state === 'active',
                  'text-muted-foreground': state === 'inactive',
                }"
              />
            </VbenButton>
          </StepperTrigger>

          <div class="mt-5 flex flex-col items-center text-center">
            <StepperTitle
              :class="[state === 'active' && 'text-primary']"
              class="text-sm font-semibold transition lg:text-base"
            >
              {{ step.title }}
            </StepperTitle>
            <StepperDescription
              :class="[state === 'active' && 'text-primary']"
              class="text-muted-foreground sr-only text-xs transition md:not-sr-only lg:text-sm"
            >
              {{ step.description }}
            </StepperDescription>
          </div>
        </StepperItem>
      </div>

      <div class="mt-4">
        <div v-if="stepIndex === 3">
          <div class="flex justify-center gap-4">
            <VbenButton
              class="mt-4"
              size="lg"
              :loading="loading"
              @click="handleDirectLogin"
            >
              {{ $t('page.auth.loginNow') }}
            </VbenButton>
            <VbenButton
              class="mt-4"
              variant="outline"
              size="lg"
              :loading="loading"
              @click="handleBackToLogin"
            >
              {{ $t('page.auth.backToLogin') }}
            </VbenButton>
          </div>
        </div>
        <Form />
      </div>
    </Stepper>
  </div>
</template>
