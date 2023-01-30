import { ref, computed } from "vue";
import { runner } from "./axios";

export class ApiResource {
  state;
  computedState;
  #params;
  #url;
  #expiresIn;
  #whenAllGet;
  #whenOneGet;
  #getAllReqParams;
  constructor(options, tokenKey, expiresIn) {
    this.#url = typeof options === "string" ? options : options.url;
    this.#expiresIn = expiresIn ?? options.expiresIn ?? 10;
    this.#whenOneGet = 0;
    this.#whenAllGet = 0;
    this.#getAllReqParams = {};
    this.state = {
      isLng: ref(true),
      isErr: ref(false),
      err: ref({ error: {}, message: "" }),
      all: ref([]),
      one: ref(null),
      mutitem: ref(null),
    }
    this.runner = runner(tokenKey ?? options.tokenKey);
    this.computedState = computed(() => this.state);
  }
  _urlWithParams(params) {
    let urlWithParams = this.#url;
    if (typeof params === "object") {
      const paramsKeys = Object.keys(params);
      for (let key of paramsKeys) {
        if (params[key] !== this.#getAllReqParams[key]) {
          this.#whenAllGet = 0;
          this.#getAllReqParams = params;
          break;
        }
      }
      urlWithParams += "?";
      for (let i = 0; i < paramsKeys.length; i++) {
        if (i === paramsKeys.length - 1) {
          urlWithParams += `${paramsKeys[i]}=${params[paramsKeys[i]]}`
        } else {
          urlWithParams += `${paramsKeys[i]}=${params[paramsKeys[i]]}&`
        }
      }
    }
    if (typeof params === "string" && params.length > 0) {
      const paramsArr = params.split("&");
      for (let i = 0; i < paramsArr.length; i++) {
        let item = paramsArr[i].split("=");
        if (this.#getAllReqParams[item[0]] !== item[1]) {
          this.#whenAllGet = 0;
          break;
        }
      }
      for (let i = 0; i < paramsArr.length; i++) {
        let item = paramsArr[i].split("=");
        this.#getAllReqParams[item[0]] = item[1];
      }
      urlWithParams += "?" + params;
    }
    return urlWithParams;
  }

  getAll(params, config) {
    this.#params = params;
    let urlWithParams = this._urlWithParams(params);
    if ((Date.now() - this.#whenAllGet) > (this.#expiresIn * 60000)) {
      this._setLoad();
      this.runner.get(urlWithParams, config)
        .then((res) => {
          this.#whenAllGet = Date.now();
          this.state.all.value = res.data;
          this.state.isLng.value = false;
        })
        .catch((error) => {
          this._setError(error.response.data);
        })
    }
    return this._returner({ which: "all" });
  }

  getOne(param, config) {
    if ((Date.now() - this.#whenOneGet) > (this.#expiresIn * 60000)) {
      this._setLoad();
      this.runner.get(this.#url + "/" + param, config)
        .then((res) => {
          this.#whenOneGet = Date.now();
          this.state.one.value = res.data;
          this.state.isLng.value = false;
        })
        .catch((error) => {
          this._setError(error.response.data);
        })
    }
    return this._returner({ which: "one" });
  }

  create(config) {
    this.state.isLng.value = false;
    const modif = (data, options) => {
      this._setLoad();
      this.runner.post(this.#url, data, config)
        .then((res) => {
          this._setMutationData(res.data);
          options?.onSuccess && options.onSuccess(res.data);
        })
        .catch((error) => {
          this._setError(error.response.data);
          options?.onError && options.onError(error.response.data);
        })
    }
    return this._returner({ which: "mutitem", modif });
  }

  update(param, config) {
    this.state.isLng.value = false;
    const modif = (data, options) => {
      this._setLoad();
      this.runner.put(this.#url + "/" + param, data, config)
        .then((res) => {
          this._setMutationData(res.data);
          options?.onSuccess && options.onSuccess(res.data);
        })
        .catch((error) => {
          this._setError(error.response.data);
          options?.onError && options.onError(error.response.data);
        })
    }
    return this._returner({ which: "mutitem", modif });
  }

  patch(param, config) {
    this.state.isLng.value = false;
    const modif = (data, options) => {
      this._setLoad();
      this.runner.put(this.#url + "/" + param, data, config)
        .then((res) => {
          this._setMutationData(res.data);
          options?.onSuccess && options.onSuccess(res.data);
        })
        .catch((error) => {
          this._setError(error.response.data);
          options?.onError && options.onError(error.response.data);
        })
    }
    return this._returner({ which: "mutitem", modif });
  }

  delete(param, config) {
    this.state.isLng.value = false;
    const modif = (options) => {
      this._setLoad();
      this.runner.delete(this.#url + "/" + param, config)
        .then((res) => {
          this._setMutationData(res.data);
          options?.onSuccess && options.onSuccess(res.data);
        })
        .catch((error) => {
          this._setError(error.response.data);
          options?.onError && options.onError(error.response.data);
        })
    }
    return this._returner({ which: "mutitem", modif });
  }

  _setError(error) {
    this.state.err.value = error;
    this.state.isErr.value = true;
    this.state.isLng.value = false;
  }

  _setLoad() {
    this.state.isLng.value = true;
    this.state.err.value = { error: {} };
    this.state.isErr.value = false;
  }

  _setMutationData(data) {
    this.#whenAllGet = 0;
    this.#whenOneGet = 0;
    this.state.mutitem.value = data;
    this.state.isLng.value = false;
    this.getAll(this.#params);
  }

  _returner({ which, modif }) {
    return {
      modif,
      data: computed(() => this.state[which]['value']),
      isLng: computed(() => this.state.isLng.value),
      isErr: computed(() => this.state.isErr.value),
      err: computed(() => this.state.err.value)
    }
  }
}
