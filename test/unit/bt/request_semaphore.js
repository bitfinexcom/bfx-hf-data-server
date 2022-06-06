/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
'use strict'

const { stub, assert } = require('sinon')
const { expect } = require('chai')

const RequestSemaphore = require('../../../lib/bt/request_semaphore')

describe('Request Semaphore', () => {
  const maxRequests = 5
  const maxTries = 1
  const interval = 1000

  const semaphore = new RequestSemaphore({ maxRequests, maxTries, interval })

  afterEach(() => {
    semaphore.reset()
  })

  it('enqueue', async () => {
    const req = stub().resolves(1)

    const response = await semaphore.add(req)

    assert.calledOnce(req)
    expect(response).to.eq(1)
  })

  it('delay queue when full', async () => {
    const req = stub().resolves()
    const n = 2 * maxRequests
    const pending = []

    for (let i = 0; i < n; i++) {
      pending.push(semaphore.add(req))
    }

    await Promise.all(pending)
    expect(req.callCount).to.eq(n)
  })

  it('retry', async () => {
    const req = stub()
    req.onCall(0).rejects()
    req.onCall(1).resolves(1)

    const response = await semaphore.add(req)

    assert.calledTwice(req)
    expect(response).to.eq(1)
  })

  it('max-retries', async () => {
    const err = new Error()
    const req = stub().rejects(err)

    try {
      await semaphore.add(req)
      assert.fail()
    } catch (e) {
      expect(e).to.be.eq(err)
    }
  })

  it('ratelimit', async () => {
    const err = new Error('429 - ["error",11010,"ratelimit: error"]')
    const req = stub()
    req.onCall(0).rejects(err)
    req.onCall(1).resolves()
    req.onCall(2).resolves()

    await Promise.all([
      semaphore.add(req), // activates rate limit
      semaphore.add(req) // is suspended
    ])

    expect(req.callCount).to.be.eq(3)
  })
})
