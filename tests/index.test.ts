import fetch from 'node-fetch'
;(global as any).fetch = fetch

// ts-jest was complaining about the types and it
// was not getting resolved by declaring a module.
const createTestServer = require('create-test-server')
import fetchy from '../src'

describe('fetchy hitting the server', () => {
  let server: any
  beforeAll(async () => {
    server = await createTestServer()

    server.get('/', (_req: any, res: any) => {
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
})
