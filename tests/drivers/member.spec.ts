import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { test } from '@japa/runner'
import MemberDriver from '../../src/drivers/member'
import {
  cleanup,
  getMemberDriver,
  getResource,
  reset,
  setup,
  setupApplication,
} from '../../test-helpers'

let app: ApplicationContract

test.group('Member Driver', (group) => {
  group.setup(async () => {
    app = await setupApplication()
    await setup(app)
  })

  group.teardown(async () => {
    await cleanup(app)
  })

  group.each.teardown(async () => {
    await reset(app)
  })

  test('should successfully create instance', ({ assert }) => {
    const memberDriver = getMemberDriver(app)
    assert.instanceOf(memberDriver, MemberDriver)
  })

  test('should throw if resource does not defined', async ({ assert }) => {
    const memberDriver = getMemberDriver(app)

    assert.rejects(() => memberDriver.scopes.attach(''))
    assert.rejects(() => memberDriver.scopes.detach(''))
    assert.rejects(() => memberDriver.scopes.exists(''))
    assert.rejects(() => memberDriver.scopes.all())
    assert.rejects(() => memberDriver.permissions.attach(''))
    assert.rejects(() => memberDriver.permissions.detach(''))
    assert.rejects(() => memberDriver.permissions.exists(''))
    assert.rejects(() => memberDriver.permissions.all())
  })

  test('should throw if member does not defined', async ({ assert }) => {
    const memberDriver = getMemberDriver(app)
    const resource = getResource()

    assert.rejects(() => memberDriver.resource(resource).scopes.attach(''))
    assert.rejects(() => memberDriver.resource(resource).scopes.detach(''))
    assert.rejects(() => memberDriver.resource(resource).scopes.exists(''))
    assert.rejects(() => memberDriver.resource(resource).scopes.all())
    assert.rejects(() => memberDriver.resource(resource).permissions.attach(''))
    assert.rejects(() => memberDriver.resource(resource).permissions.detach(''))
    assert.rejects(() => memberDriver.resource(resource).permissions.exists(''))
    assert.rejects(() => memberDriver.resource(resource).permissions.all())
  })
})
