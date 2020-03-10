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

const attachTransformsToResponse = async (
  _response: Response
): Promise<FetchyResponse> => {
  let response: FetchyResponse = _response
  for (const methods of bodyTransform) {
    response[methods] = await _response[methods]()
  }
  return response
}

const originalFetch = async (
  _fetch: typeof window.fetch,
  verb: httpVerbs,
  resource: string,
  init?: RequestInit
) => {
  const _init = {
    method: verb,
    ...init,
  }
  const response = await _fetch(resource, _init)
  return attachTransformsToResponse(response)
}

const jsonBodyFirstFetch = async (
  _fetch: typeof window.fetch,
  verb: httpVerbs,
  resource: string,
  body?: Json,
  init?: RequestInit
) => {
  const _init: RequestInit = {
    method: verb,
    ...(body && { body: JSON.stringify(body) }),
    ...(init && init),
  }

  const response = await _fetch(resource, _init)
  return attachTransformsToResponse(response)
}

function instance(
  _fetch: typeof window.fetch,
  verb: 'GET' | 'HEAD'
): (resource: string, init?: RequestInit) => Promise<FetchyResponse>
function instance(
  _fetch: typeof window.fetch,
  verb: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
): (
  resource: string,
  body?: Json,
  init?: RequestInit
) => Promise<FetchyResponse>
function instance(_fetch: typeof window.fetch, verb: httpVerbs) {
  if (isHeadOrGet(verb)) {
    return originalFetch.bind(null, _fetch, verb)
  }
  return jsonBodyFirstFetch.bind(null, _fetch, verb)
}

function init() {
  return {
    get: instance(fetch, 'GET'),
    post: instance(fetch, 'POST'),
    put: instance(fetch, 'PUT'),
    delete: instance(fetch, 'DELETE'),
    patch: instance(fetch, 'PATCH'),
    head: instance(fetch, 'HEAD'),
  }
}

export default init()
