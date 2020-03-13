import { Defaults, HttpVerbs } from './interface'

export function validateDefaults({ interceptors, init, baseUrl }: Defaults): void {
  if (interceptors != undefined && typeof interceptors !== 'function') {
    throw new Error(
      'The interceptor should be a function that can expect the url and init options as arguments.'
    )
  }

  if (init != undefined && typeof init !== 'object') {
    throw new Error(
      'Init should be an object. Please check https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch for correct options'
    )
  }

  if (baseUrl != undefined && typeof baseUrl !== 'string') {
    throw new Error(
      'Base url should be a string. If you are using request, consider using a string url with init options'
    )
  }
}

export function appendToBaseUrl(base: string, url: string): string {
  if (Boolean(base) && base.endsWith('/') && url.startsWith('/')) {
    throw new Error(
      'The configured base url already ends with a slash, remove the slash in the request url'
    )
  }

  if (Boolean(base) && !base.endsWith('/') && !url.startsWith('/')) {
    throw new Error(
      'The configured base url also does not end with a slash, add a slash in the request url'
    )
  }

  return base + url
}

export function isHeadOrGet(verb: HttpVerbs): verb is 'HEAD' | 'GET' {
  return verb === 'HEAD' || verb === 'GET'
}
