type HttpVerbs = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

const isHeadOrGet = (verb: HttpVerbs): verb is 'HEAD' | 'GET' =>
  verb === 'HEAD' || verb === 'GET'

// TODO: add a timeout
// TODO: convert all resource type to Request | string
// TODO: cancel handler
// TODO: deep merge init
// TODO: define reasonable defaults
// TODO: extract types to another file

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

const attachBodyTransformsToResponse = async (
  _response: Response
): Promise<FetchyResponse> => {
  let response: FetchyResponse = _response
  for (const methods of bodyTransform) {
    response[methods] = async () => await _response.clone()[methods]()
  }
  return response
}

const transformResponse = (response: Response): Promise<FetchyResponse> => {
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return attachBodyTransformsToResponse(response)
}

interface Meta {
  _fetch: typeof window.fetch
  baseResource?: string
  init?: RequestInit
}

interface Defaults {
  baseResource?: string
  init?: RequestInit
  interceptors?: (resource: RequestInfo, init?: RequestInit) => any
  timeout?: number
}

const originalFetch = async (
  meta: Meta,
  verb: HttpVerbs,
  resource: string,
  init?: RequestInit
) => {
  const _init = {
    method: verb,
    ...init,
  }
  const response = await meta._fetch(resource, _init)
  return transformResponse(response)
}

const jsonBodyFirstFetch = async (
  meta: Meta,
  verb: HttpVerbs,
  resource: string,
  body?: Json,
  init?: RequestInit
) => {
  const _init: RequestInit = {
    method: verb,
    ...(body && { body: JSON.stringify(body) }),
    ...(init && init),
  }

  const response = await meta._fetch(resource, _init)
  return transformResponse(response)
}

function instance(
  meta: Meta,
  verb: 'GET' | 'HEAD'
): (resource: string, init?: RequestInit) => Promise<FetchyResponse>
function instance(
  meta: Meta,
  verb: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
): (
  resource: string,
  body?: Json,
  init?: RequestInit
) => Promise<FetchyResponse>
function instance(meta: Meta, verb: HttpVerbs) {
  if (isHeadOrGet(verb)) {
    return originalFetch.bind(null, meta, verb)
  }
  return jsonBodyFirstFetch.bind(null, meta, verb)
}

function initialize(defaults: Defaults) {
  const _fetch =
    defaults.interceptors == undefined
      ? fetch
      : ((originalFetch, interceptors) => {
          return (resource: RequestInfo, init?: RequestInit) => {
            interceptors(resource, init)
            const result = originalFetch.call(null, resource, init)
            return result
          }
        })(fetch, defaults.interceptors)

  const meta = {
    _fetch,
  }

  return {
    get: instance(meta, 'GET'),
    post: instance(meta, 'POST'),
    put: instance(meta, 'PUT'),
    delete: instance(meta, 'DELETE'),
    patch: instance(meta, 'PATCH'),
    head: instance(meta, 'HEAD'),
  }
}

export function create({ baseResource, interceptors, init }: Defaults) {
  return initialize({ baseResource, interceptors, init })
}

export default initialize({})
