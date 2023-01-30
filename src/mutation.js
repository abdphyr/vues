import { runner } from "./axios";
import { ref, computed } from "vue";

export function useModification(options, method, tokenKey) {
  const url = typeof options === "string" ? options : options.url;
  const state = {
    isLng: ref(false),
    isErr: ref(false),
    err: ref({ error: {}, message: "" }),
    data: ref([])
  }
  const run = runner(tokenKey ?? options.tokenKey);
  const modif = (data, qOptions) => {
    state.isLng.value = true;
    const meth = typeof method === "object" ? null : method;
    const config = typeof method === "object" ? method : null;
    run[meth ?? options.method](url, data, config)
      .then((res) => {
        state.data.value = res.data;
        state.isLng.value = false;
        qOptions?.onSuccess && qOptions.onSuccess(res.data);
      })
      .catch((error) => {
        state.err.value = error.response.data;
        state.isErr.value = true;
        state.isLng.value = false;
        qOptions?.onError && qOptions.onError(error.response.data);
      })
  }
  return {
    modif,
    data: computed(() => state.data.value),
    isLng: computed(() => state.isLng.value),
    isErr: computed(() => state.isErr.value),
    err: computed(() => state.err.value)
  };
}