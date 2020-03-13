import {
  Defaults,
  Meta,
  GetHeadRequest,
  BodyFirstRequest,
  HttpVerbs,
  FetchyResponse,
  Json,
} from './interface'
import { deepMerge } from './deep-merge'
import { validateDefaults, isHeadOrGet, appendToBaseResource } from './helpers'

const bodyTransform = ['arrayBuffer', 'blob', 'formData', 'json', 'text'] as const

export function create({ baseResource, interceptors, init }: Defaults) {
  return initialize({ baseResource, interceptors, init })
}

function initialize(defaults: Defaults) {
  const fetch = window.fetch.bind(window)
  validateDefaults(defaults)

  const _fetch =
    defaults.interceptors == undefined ? fetch : interceptFetchRequest(fetch, defaults.interceptors)

  const meta: Meta = {
    _fetch,
    baseResource: defaults.baseResource || '',
    init: defaults.init,
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

function instance(meta: Meta, verb: 'GET' | 'HEAD'): GetHeadRequest
function instance(meta: Meta, verb: 'POST' | 'PUT' | 'DELETE' | 'PATCH'): BodyFirstRequest
function instance(meta: Meta, verb: HttpVerbs) {
  if (isHeadOrGet(verb)) {
    return originalFetch.bind(null, meta, verb)
  }
  return jsonBodyFirstFetch.bind(null, meta, verb)
}

function throwOnFailHttpCode(response: Response): Response {
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response
}

function originalFetch(
  meta: Meta,
  verb: HttpVerbs,
  resource: string,
  init?: RequestInit
): FetchyResponse {
  const _resource = appendToBaseResource(meta.baseResource, resource)

  let _init = {
    method: verb,
    ...init,
  }

  if (meta.init) {
    _init = deepMerge(meta.init, _init)
  }
  return runFetch(meta._fetch, _resource, _init)
}

function jsonBodyFirstFetch(
  meta: Meta,
  verb: HttpVerbs,
  resource: string,
  body?: Json,
  init?: RequestInit
) {
  const _resource = appendToBaseResource(meta.baseResource, resource)

  let _init: RequestInit = {
    method: verb,
  }

  if (body) {
    _init['body'] = JSON.stringify(body)
  }

  if (init) {
    if (init.body) {
      console.warn(
        'Passing body inside the third argument object will override the second argument. Remember to JSON.stringify.'
      )
    }

    _init = Object.assign({}, _init, init)
  }

  if (meta.init) {
    _init = deepMerge(meta.init, _init)
  }

  return runFetch(meta._fetch, _resource, _init)
}

function attachBodyTransformsToResponse(_response: Promise<Response>): FetchyResponse {
  let response: Partial<FetchyResponse> = _response
  for (const methods of bodyTransform) {
    response[methods] = async () => (await _response).clone()[methods]()
  }
  return response as FetchyResponse
}

function interceptFetchRequest(
  _fetch: typeof fetch,
  interceptors: NonNullable<Defaults['interceptors']>
) {
  return (resource: RequestInfo, init?: RequestInit) => {
    interceptors(resource, init)
    const result = _fetch.call(null, resource, init)
    return result
  }
}

function runFetch(_fetch: typeof fetch, resource: string, init: RequestInit) {
  const response = _fetch(resource, init).then(throwOnFailHttpCode)
  return attachBodyTransformsToResponse(response)
}

export default initialize({})

// TODO: add a timeout
// TODO: cancel handler
