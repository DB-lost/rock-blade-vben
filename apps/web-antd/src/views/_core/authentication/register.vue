<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, h, reactive, ref } from 'vue';
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
import { LogIn, Mail, User } from 'lucide-vue-next';

import { sendEmailCodeApi, verifyEmailCode } from '#/api/core/auth';

defineOptions({ name: 'Register' });

const router = useRouter();
const stepIndex = ref(1);
const form = ref();
// const formData = reactive<{
//   agreePolicy?: boolean;
//   code?: string;
//   confirmPassword?: string;
//   email?: string;
//   password?: string;
//   username?: string;
// }>({});

const loading = ref(false);
// const countdown = ref(0);
const CODE_LENGTH = 6;

const steps = [
  {
    step: 1,
    title: $t('page.auth.verifyEmail'),
    description: $t('page.auth.verifyEmailDesc'),
    icon: Mail,
  },
  {
    step: 2,
    title: $t('page.auth.userInfo'),
    description: $t('page.auth.userInfoDesc'),
    icon: User,
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
          // 模拟发送验证码
          // Simulate sending verification code
          loading.value = true;
          if (!formApi) {
            loading.value = false;
            throw new Error('formApi is not ready');
          }
          await formApi.validateField('email');
          const isEmailReady = await formApi.isFieldValid('email');
          if (!isEmailReady) {
            loading.value = false;
            throw new Error('Email is not Ready');
          }
          const { email } = await formApi.getValues();
          await sendEmailCodeApi({ email, type: 'register' }).then(() => {
            message.success($t('page.auth.sendCodeSuccess'));
          });
          loading.value = false;
        },
        placeholder: $t('authentication.code'),
        type: 'register',
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
});

// 用户信息step的schema
const userFormSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('page.auth.usernameTip'),
      },
      fieldName: 'username',
      label: $t('page.auth.username'),
      rules: z.string().min(1, { message: $t('page.auth.usernameTip') }),
    },
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
    {
      component: 'VbenCheckbox',
      fieldName: 'agreePolicy',
      renderComponentContent: () => ({
        default: () =>
          h('span', [
            $t('page.auth.agree'),
            h(
              'a',
              {
                class: 'vben-link ml-1 ',
                href: '',
              },
              `${$t('page.auth.privacyPolicy')} & ${$t('page.auth.terms')}`,
            ),
          ]),
      }),
      rules: z.boolean().refine((value) => !!value, {
        message: $t('page.auth.agreeTip'),
      }),
    },
  ];
});

// 获取当前步骤的schema
const currentFormSchema = computed(() => {
  switch (stepIndex.value) {
    case 1: {
      return emailFormSchema.value;
    }
    case 2: {
      return userFormSchema.value;
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
          if (values) {
            const verified = await _verifyEmailCode(values);
            if (verified) stepIndex.value++;
          }
        } else if (stepIndex.value === 2) {
          const values = await formApi.validate();
          if (values) {
            const success = await _handleRegister(values);
            if (success) stepIndex.value++;
          }
        }
      },
    },
    actionButtonOptions: {
      show: true,
      resetButton: {
        show: computed(() => stepIndex.value !== 2),
        text: computed(() =>
          stepIndex.value === 1
            ? $t('page.auth.backToLogin')
            : $t('common.back'),
        ),
        variant: 'outline',
        size: 'lg',
        onClick: () => {
          if (stepIndex.value === 1) {
            router.push('/auth/login');
          } else {
            stepIndex.value--;
          }
        },
      },
      extraButtons: computed(() => {
        if (stepIndex.value !== 3) return [];
        return [
          {
            type: 'primary',
            size: 'lg',
            text: $t('page.auth.directLogin'),
            onClick: handleDirectLogin,
          },
          {
            variant: 'outline',
            size: 'lg',
            text: $t('page.auth.backToLogin'),
            onClick: () => router.push('/login'),
          },
        ];
      }),
    },
  }),
);

// 处理表单提交
// async function handleFormSubmit(values: Recordable<any>) {
//   Object.assign(formData, values);
// }

// 验证邮箱验证码
async function _verifyEmailCode(_values: Recordable<any>) {
  // 这里调用验证码验证API
  await verifyEmailCode({
    email: _values.values.email,
    code: _values.values.code,
    type: 'register',
  }).then(() => {
    message.success($t('page.auth.codeVerifySuccess'));
  });
  return true;
}

// 注册提交
async function _handleRegister(_values: Recordable<any>) {
  loading.value = true;
  try {
    // 这里调用注册API
    console.warn('register submit:', _values);
    return true;
  } catch {
    return false;
  } finally {
    loading.value = false;
  }
}

// 直接登录
function handleDirectLogin() {
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
        {{ $t('page.auth.createAnAccount') }} 🚀
      </h2>

      <p class="text-muted-foreground lg:text-md text-sm">
        {{ $t('page.auth.signUpSubtitle') }}
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
        <Form ref="form" />
      </div>
    </Stepper>
  </div>
</template>
