import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { test } from '@japa/runner'
import ResourceDriver from '../../src/drivers/resource'
import {
  cleanup,
  getMember,
  getResourceDriver,
  reset,
  setup,
  setupApplication,
} from '../../test-helpers'

let app: ApplicationContract

test.group('Resource Driver', (group) => {
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
    const resourceDriver = getResourceDriver(app)
    assert.instanceOf(resourceDriver, ResourceDriver)
  })

  test('should throw if resource does not defined', async ({ assert }) => {
    const resourceDriver = getResourceDriver(app)
    const member = getMember()

    assert.throws(() => resourceDriver.members.attach(member))
    assert.throws(() => resourceDriver.members.detach(member))
    assert.throws(() => resourceDriver.members.exists(member))
    assert.throws(() => resourceDriver.members.all())
  })
})
