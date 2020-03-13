import fetch from 'node-fetch'
;(window as any).fetch = fetch

// ts-jest was complaining about the types and it
// was not getting resolved by declaring a module.
const createTestServer = require('create-test-server')

import fetchy, { create } from '../src'

describe('fetchy hitting the server', () => {
  let server: any
  beforeAll(async () => {
    server = await createTestServer()

    server.get('/', (_req: any, res: any) => {
      res.end()
    })

    server.get('/base', (_req: any, res: any) => {
      res.end()
    })

    server.post('/', (_req: any, res: any) => {
      res.end()
    })

    server.put('/', (_req: any, res: any) => {
      res.end()
    })

    server.patch('/', (_req: any, res: any) => {
      res.end()
    })

    server.delete('/', (_req: any, res: any) => {
      res.end()
    })
    server.head('/', (_req: any, res: any) => {
      res.end()
    })
  })

  afterAll(async () => {
    await server.close()
  })

  it('should run the GET request', async done => {
    expect((await fetchy.get(server.url)).ok).toEqual(true)
    done()
  })

  it('should run the POST request', async done => {
    expect((await fetchy.post(server.url)).ok).toEqual(true)
    done()
  })

  it('should run the PUT request', async done => {
    expect((await fetchy.put(server.url)).ok).toEqual(true)
    done()
  })

  it('should run the PATCH request', async done => {
    expect((await fetchy.patch(server.url)).ok).toEqual(true)
    done()
  })

  it('should run the DELETE request', async done => {
    expect((await fetchy.delete(server.url)).ok).toEqual(true)
    done()
  })

  it('should run the HEAD request', async done => {
    expect((await fetchy.head(server.url)).ok).toEqual(true)
    done()
  })

  it('should create an instance with a base url', async done => {
    const api = create({
      baseResource: server.url,
    })

    expect((await api.get('/base')).ok).toEqual(true)
    done()
  })

  it('call the callback passed to the interceptor property before every request', async done => {
    const callback = jest.fn()
    const api = create({
      baseResource: server.url,
      interceptors: callback,
    })

    await api.get('/base')
    expect(callback).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith(`${server.url}/base`, { method: 'GET' })
    await api.get('/')
    expect(callback).toHaveBeenCalledTimes(2)
    done()
  })

  it('should throw if an invalid baseResource is passed', async done => {
    expect.assertions(1)
    try {
      create({
        baseResource: 2 as any,
      })
    } catch (e) {
      expect(e).toBeDefined()
    }
    done()
  })

  it('should throw if an invalid interceptor is passed', async done => {
    expect.assertions(1)
    try {
      create({
        interceptors: 2 as any,
      })
    } catch (e) {
      expect(e).toBeDefined()
    }
    done()
  })

  it('should throw if init is not an object', async done => {
    expect.assertions(1)
    try {
      create({
        init: 2 as any,
      })
    } catch (e) {
      expect(e).toBeDefined()
    }
    done()
  })

  it('should throw if slashes mismatch between baseUrl and the request url', async done => {
    expect.assertions(2)
    try {
      const api = create({
        baseResource: server.url + '/',
      })

      await api.get('/base')
    } catch (e) {
      expect(e).toBeDefined()
    }

    try {
      const api = create({
        baseResource: server.url,
      })

      await api.get('base')
    } catch (e) {
      expect(e).toBeDefined()
    }
    done()
  })
})
