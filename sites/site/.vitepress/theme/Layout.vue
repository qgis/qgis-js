<script setup>
import { ref } from "vue";
import DefaultTheme from "vitepress/theme-without-fonts";

const { Layout } = DefaultTheme;

const counter = ref(1);
setInterval(() => {
  counter.value++;
}, 1000);
</script>

<template>
  <Layout>
    <template #layout-top>
      <div>Counter value {{ counter }}</div>
    </template>
  </Layout>
</template>
