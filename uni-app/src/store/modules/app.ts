import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const title = ref('Nova Stack');

  function setTitle(value: string) {
    title.value = value;
  }

  return {
    title,
    setTitle,
  };
});
