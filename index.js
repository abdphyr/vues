import { ApiResource } from "./src/resources";
import { GetRequest, PostRequest, PutRequest, PatchRequest, DeleteRequest } from "./src/requests";
import { useModification } from "./src/mutation";

export const defineApiResource = (options, tokenKey, expiresIn) => new ApiResource(options, tokenKey, expiresIn);
export const defineGetRequest = (options, tokenKey, expiresIn) => new GetRequest(options, tokenKey, expiresIn);
export const definePostRequest = (options, tokenKey) => new PostRequest(options, tokenKey);
export const definePutRequest = (options, tokenKey) => new PutRequest(options, tokenKey);
export const definePatchRequest = (options, tokenKey) => new PatchRequest(options, tokenKey);
export const defineDeleteRequest = (options, tokenKey) => new DeleteRequest(options, tokenKey);
export const useModif = (options, method, tokenKey) => useModification(options, method, tokenKey);