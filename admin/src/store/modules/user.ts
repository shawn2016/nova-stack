import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(null);

  function setToken(value: string | null) {
    token.value = value;
  }

  function clearToken() {
    token.value = null;
  }

  return {
    token,
    setToken,
    clearToken,
  };
});
