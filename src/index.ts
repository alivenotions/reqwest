type httpVerbs = 
    'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

const instance = (fetch: typeof window.fetch) => (verb: httpVerbs) => (url: string, body?: any) => fetch(url, {
    method: verb,
    body: JSON.stringify(body),
})

const defaultInstance = instance(window.fetch);

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
    9. return cancel to kill it
 */