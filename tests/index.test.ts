import fetch from 'node-fetch'
;(global as any).fetch = fetch
const createTestServer = require('create-test-server')
import fetchy from '../src'

describe('fetchy', () => {
  it('should run the GET request', async done => {
    const server = await createTestServer()
    server.get('/', (_req: any, res: any) => {
      res.end()
    })

    expect((await fetchy.get(server.url)).ok).toEqual(true)
    await server.close()
    done()
  })
})
