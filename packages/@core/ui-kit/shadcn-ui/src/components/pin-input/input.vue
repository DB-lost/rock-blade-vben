<script setup lang="ts">
import type { PinInputProps } from './types';

import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

import { PinInput, PinInputGroup, PinInputInput } from '../../ui';
import { VbenButton } from '../button';

interface CountdownStorage {
  duration: number;
  startTime: number;
  type: string;
}

defineOptions({
  inheritAttrs: false,
});

const {
  codeLength = 6,
  createText = async () => {},
  disabled = false,
  handleSendCode = async () => {},
  loading = false,
  maxTime = 60,
  type = 'default',
} = defineProps<PinInputProps>();

const emit = defineEmits<{
  complete: [];
  sendError: [error: any];
}>();

const COUNTDOWN_STORAGE_KEY = 'pin_input_countdown';

function getStoredCountdown(): CountdownStorage | null {
  const stored = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
  if (!stored) return null;

  try {
    const data = JSON.parse(stored) as CountdownStorage;
    if (data.type !== type) return null;
    return data;
  } catch {
    return null;
  }
}

function setStoredCountdown(time: number) {
  const data: CountdownStorage = {
    duration: time,
    startTime: Date.now(),
    type,
  };
  localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(data));
}

function clearStoredCountdown() {
  localStorage.removeItem(COUNTDOWN_STORAGE_KEY);
}

function restoreCountdown() {
  const stored = getStoredCountdown();
  if (!stored) return;

  const elapsed = Math.floor((Date.now() - stored.startTime) / 1000);
  const remaining = stored.duration - elapsed;

  if (remaining > 0) {
    countdown.value = remaining;
    startCountdown();
  } else {
    clearStoredCountdown();
  }
}

const timer = ref<ReturnType<typeof setTimeout>>();

const modelValue = defineModel<string>();

const inputValue = ref<string[]>([]);
const countdown = ref(0);

const btnText = computed(() => {
  const countdownValue = countdown.value;
  return createText?.(countdownValue);
});

const btnLoading = computed(() => {
  return loading || countdown.value > 0;
});

watch(
  () => modelValue.value,
  () => {
    inputValue.value = modelValue.value?.split('') ?? [];
  },
);

watch(inputValue, (val) => {
  modelValue.value = val.join('');
});

function handleComplete(e: string[]) {
  modelValue.value = e.join('');
  emit('complete');
}

async function handleSend(e: Event) {
  try {
    e?.preventDefault();
    await handleSendCode();
    countdown.value = maxTime;
    setStoredCountdown(maxTime);
    startCountdown();
  } catch (error) {
    console.error('Failed to send code:', error);
    emit('sendError', error);
  }
}

function startCountdown() {
  if (countdown.value > 0) {
    timer.value = setTimeout(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearStoredCountdown();
      }
      startCountdown();
    }, 1000);
  }
}

onMounted(() => {
  restoreCountdown();
});

onBeforeUnmount(() => {
  countdown.value = 0;
  clearTimeout(timer.value);
  clearStoredCountdown();
});

const id = useId();
</script>

<template>
  <PinInput
    :id="id"
    v-model="inputValue"
    :disabled="disabled"
    class="flex w-full justify-between"
    otp
    placeholder="○"
    type="number"
    @complete="handleComplete"
  >
    <div class="relative flex w-full">
      <PinInputGroup class="mr-2">
        <PinInputInput
          v-for="(item, index) in codeLength"
          :key="item"
          :index="index"
        />
      </PinInputGroup>
      <VbenButton
        :disabled="disabled"
        :loading="btnLoading"
        class="flex-grow"
        size="lg"
        variant="outline"
        @click="handleSend"
      >
        {{ btnText }}
      </VbenButton>
    </div>
  </PinInput>
</template>
