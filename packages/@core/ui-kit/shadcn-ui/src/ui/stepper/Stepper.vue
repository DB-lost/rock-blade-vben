<script lang="ts" setup>
import type { StepperRootEmits, StepperRootProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import { computed } from 'vue';

import { cn } from '@vben-core/shared/utils';

import { StepperRoot, useForwardPropsEmits } from 'reka-ui';

const props = defineProps<
  StepperRootProps & { class?: HTMLAttributes['class'] }
>();
const emits = defineEmits<StepperRootEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <StepperRoot
    v-slot="slotProps"
    :class="cn('flex gap-2', props.class)"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps"></slot>
  </StepperRoot>
</template>
