import {
  Defaults,
  Meta,
  GetHeadRequest,
  BodyFirstRequest,
  HttpVerbs,
  FetchyResponse,
  Json,
} from './interface'

const bodyTransform = ['arrayBuffer', 'blob', 'formData', 'json', 'text'] as const

export function create({ baseResource, interceptors, init }: Defaults) {
  return initialize({ baseResource, interceptors, init })
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
  const _init = {
    method: verb,
    ...init,
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
        'Passing body inside the third argument object will override whatever is passed as the second argument.'
      )
    }
    Object.assign({}, _init, init)
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

export default initialize({})

// TODO: add a timeout
// TODO: convert all resource type to Request | string
// TODO: cancel handler
// TODO: deep merge init
// TODO: define reasonable defaults
