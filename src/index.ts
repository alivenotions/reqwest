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
import { validateDefaults, isHeadOrGet, appendToBaseUrl } from './helpers'

const bodyTransform = ['arrayBuffer', 'blob', 'formData', 'json', 'text'] as const

function create({ baseUrl, interceptors, init }: Defaults) {
  return initialize({ baseUrl, interceptors, init })
}

function initialize(defaults: Defaults) {
  const fetch = window.fetch.bind(window)
  validateDefaults(defaults)

  const _fetch =
    defaults.interceptors == undefined ? fetch : interceptFetchRequest(fetch, defaults.interceptors)

  const meta: Meta = {
    _fetch,
    baseUrl: defaults.baseUrl || '',
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
  url: string,
  init?: RequestInit
): FetchyResponse {
  const _url = appendToBaseUrl(meta.baseUrl, url)

  let _init = {
    method: verb,
    ...init,
  }

  if (meta.init) {
    _init = deepMerge(meta.init, _init)
  }
  return runFetch(meta._fetch, _url, _init)
}

function jsonBodyFirstFetch(
  meta: Meta,
  verb: HttpVerbs,
  url: string,
  body?: Json,
  init?: RequestInit
) {
  const _url = appendToBaseUrl(meta.baseUrl, url)

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

  return runFetch(meta._fetch, _url, _init)
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
  return (url: RequestInfo, init?: RequestInit) => {
    interceptors(url, init)
    const result = _fetch.call(null, url, init)
    return result
  }
}

function runFetch(_fetch: typeof fetch, url: string, init: RequestInit) {
  const response = _fetch(url, init).then(throwOnFailHttpCode)
  return attachBodyTransformsToResponse(response)
}

export { create as createFetchyConfiguration }
export default initialize({})
