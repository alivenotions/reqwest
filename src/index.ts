type httpVerbs = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

const isHeadOrGet = (verb: httpVerbs) => verb === 'HEAD' || verb === 'GET'

// TODO: bake in errors as rejection
// TODO: creation of instances
// TODO: add reasonable defaults
// TODO: add a timeout
// TODO: interceptors

const bodyTransform = [
  'arrayBuffer',
  'blob',
  'formData',
  'json',
  'text',
] as const

interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray
}

interface JsonArray
  extends Array<string | number | boolean | Date | Json | JsonArray> {}

interface FetchyResponse extends Response {
  arrayBuffer(): Promise<ArrayBuffer>
  blob(): Promise<Blob>
  formData(): Promise<FormData>
  json<T>(): Promise<T>
  text(): Promise<string>
}

const instance = (fetch: typeof window.fetch) => (verb: httpVerbs) => async (
  resource: string,
  body?: Json,
  init?: Omit<RequestInit, 'body'>
): Promise<FetchyResponse> => {
  const _init: RequestInit = {
    method: verb,
    ...(body && isHeadOrGet(verb) && { body: JSON.stringify(body) }),
    ...(init && init),
  }
  const _response = await fetch(resource, _init)
  let result: FetchyResponse = _response
  for (const methods of bodyTransform) {
    result[methods] = await _response[methods]()
  }
  return result
}

const defaultInstance = instance(fetch)

export default {
  get: defaultInstance('GET'),
  post: defaultInstance('POST'),
  put: defaultInstance('PUT'),
  delete: defaultInstance('DELETE'),
  patch: defaultInstance('PATCH'),
  head: defaultInstance('HEAD'),
}

/*
    1. req.get
    2. req.post
    3. req.put
    4. req.patch
    5. req.head
    6. req.delete
    7. req.createInstance(baseurl, interceptors, timeout)
    8. req.extendInstance(baseurl, interceptors, timeout)
    9. return cancel to kill it?
 */
