import { ref, computed } from "vue";
import { runner } from "./axios";

class Request {
  state;
  url;
  computedState;
  constructor(options, tokenKey) {
    this.url = typeof options === "string" ? options : options.url;
    this.state = {
      isLng: ref(true),
      isErr: ref(false),
      err: ref({ error: {}, message: "" }),
      data: ref([])
    }
    this.runner = runner(tokenKey ?? options.tokenKey);
    this.computedState = computed(() => this.state);
  }

  _setError(error) {
    this.state.err.value = error;
    this.state.isErr.value = true;
    this.state.isLng.value = false;
    this.state.data.value = [];
  }

  _setData(data) {
    this.state.data.value = data;
    this.state.isLng.value = false;
  }

  _setLoad() {
    this.state.isLng.value = true;
    this.state.err.value = { error: {} };
    this.state.isErr.value = false;
  }

  _returner(modif) {
    return {
      modif,
      data: computed(() => this.state.data.value),
      isLng: computed(() => this.state.isLng.value),
      isErr: computed(() => this.state.isErr.value),
      err: computed(() => this.state.err.value)
    }
  }
}

export class GetRequest extends Request {
  #expiresIn;
  #whenGet;
  #getAllParams;
  constructor(options, tokenKey, expiresIn) {
    super(options, tokenKey);
    this.#expiresIn = expiresIn ?? options.expiresIn ?? 10;
    this.#whenGet = 0;
    this.#getAllParams = {};
  }

  _urlWithParams(params) {
    let urlWithParams = this.url;
    if (typeof params === "object") {
      const paramsKeys = Object.keys(params);
      for (let key of paramsKeys) {
        if (params[key] !== this.#getAllParams[key]) {
          this.#whenGet = 0;
          this.#getAllParams = params;
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
    if (typeof params === "string" && (params.includes("=") || params.includes("&"))) {
      const paramsArr = params.split("&");
      for (let i = 0; i < paramsArr.length; i++) {
        let item = paramsArr[i].split("=");
        if (this.#getAllParams[item[0]] !== item[1]) {
          this.#whenGet = 0;
          break;
        }
      }
      for (let i = 0; i < paramsArr.length; i++) {
        let item = paramsArr[i].split("=");
        this.#getAllParams[item[0]] = item[1];
      }
      urlWithParams += "?" + params;
    }
    if (typeof params === "string" || typeof params === "number") {
      urlWithParams += params;
    }
    return urlWithParams;
  }

  get(params, config) {
    let path = this._urlWithParams(params)
    if ((Date.now() - this.#whenGet) > (this.#expiresIn * 60000)) {
      this._setLoad();
      this.runner.get(path, config)
        .then((res) => {
          this.#whenGet = Date.now();
          this._setData(res.data)
        })
        .catch((error) => {
          this._setError(error.response.data);
        })
    }
    return this._returner();
  }
}

export class PostRequest extends Request {
  post(config) {
    this.state.isLng.value = false;
    const modif = (data, options) => {
      this._setLoad();
      this.runner.post(this.url, data, config)
        .then((res) => {
          this._setData(res.data);
          options?.onSuccess && options.onSuccess(res.data);
        })
        .catch((error) => {
          this._setError(error.response.data);
          options?.onError && options.onError(error.response.data);
        })
    }
    return this._returner(modif);
  }
}

export class PutRequest extends Request {
  put(param, config) {
    this.state.isLng.value = false;
    const modif = (data, options) => {
      this._setLoad();
      this.runner.put(this.url + "/" + param, data, config)
        .then((res) => {
          this._setData(res.data);
          options?.onSuccess && options.onSuccess(res.data);
        })
        .catch((error) => {
          this._setError(error.response.data);
          options?.onError && options.onError(error.response.data);
        })
    }
    return this._returner(modif);
  }
}

export class PatchRequest extends Request {
  patch(param, config) {
    this.state.isLng.value = false;
    const modif = (data, options) => {
      this._setLoad();
      this.runner.patch(this.url + "/" + param, data, config)
        .then((res) => {
          this._setData(res.data);
          options?.onSuccess && options.onSuccess(res.data);
        })
        .catch((error) => {
          this._setError(error.response.data);
          options?.onError && options.onError(error.response.data);
        })
    }
    return this._returner(modif);
  }
}

export class DeleteRequest extends Request {
  delete(param, config) {
    this.state.isLng.value = false;
    const modif = (options) => {
      this._setLoad();
      this.runner.delete(this.url + "/" + param, config)
        .then((res) => {
          this._setData(res.data);
          options?.onSuccess && options.onSuccess(res.data);
        })
        .catch((error) => {
          this._setError(error.response.data);
          options?.onError && options.onError(error.response.data);
        })
    }
    return this._returner(modif);
  }
}
