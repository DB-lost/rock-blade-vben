<script lang="ts" setup>
import type { StepperTitleProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import { computed } from 'vue';

import { cn } from '@vben-core/shared/utils';

import { StepperTitle, useForwardProps } from 'reka-ui';

const props = defineProps<
  StepperTitleProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <StepperTitle
    v-bind="forwarded"
    :class="cn('text-md whitespace-nowrap font-semibold', props.class)"
  >
    <slot></slot>
  </StepperTitle>
</template>
