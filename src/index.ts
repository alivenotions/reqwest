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

const bodyTransform = ['arrayBuffer', 'blob', 'formData', 'json', 'text'] as const

export function create({ baseResource, interceptors, init }: Defaults) {
  return initialize({ baseResource, interceptors, init })
}

function initialize(defaults: Defaults) {
  const _fetch =
    defaults.interceptors == undefined ? fetch : interceptFetchRequest(fetch, defaults.interceptors)

  const meta: Meta = {
    _fetch,
    baseResource: defaults.baseResource || '',
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

function isHeadOrGet(verb: HttpVerbs): verb is 'HEAD' | 'GET' {
  return verb === 'HEAD' || verb === 'GET'
}

function transformResponse(response: Response): Promise<FetchyResponse> {
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return attachBodyTransformsToResponse(response)
}

async function originalFetch(meta: Meta, verb: HttpVerbs, resource: string, init?: RequestInit) {
  const _resource = meta.baseResource + resource
  let _init = {
    method: verb,
    ...init,
  }

  if (meta.init) {
    _init = deepMerge(meta.init, _init)
  }
  const response = await meta._fetch(_resource, _init)
  return transformResponse(response)
}

async function jsonBodyFirstFetch(
  meta: Meta,
  verb: HttpVerbs,
  resource: string,
  body?: Json,
  init?: RequestInit
) {
  const _resource = meta.baseResource + resource

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
  const response = await meta._fetch(_resource, _init)
  return transformResponse(response)
}

async function attachBodyTransformsToResponse(_response: Response): Promise<FetchyResponse> {
  let response: FetchyResponse = _response
  for (const methods of bodyTransform) {
    response[methods] = async () => await _response.clone()[methods]()
  }
  return response
}

function interceptFetchRequest(
  _fetch: typeof window.fetch,
  interceptors: NonNullable<Defaults['interceptors']>
) {
  return (resource: RequestInfo, init?: RequestInit) => {
    interceptors(resource, init)
    const result = _fetch.call(null, resource, init)
    return result
  }
}

export default initialize({})

// TODO: add a timeout
// TODO: convert all resource type to Request | string
// TODO: cancel handler
// TODO: validate initial input
