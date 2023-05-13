import { test } from '@japa/runner'

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import PermissionRepository from '../../src/repositories/permission'
import {
  cleanup,
  getPermissionRepository,
  getScopeRepository,
  reset,
  setup,
  setupApplication,
} from '../../test-helpers'

let app: ApplicationContract

test.group('Permission Repository', (group) => {
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
    const permissionRepository = getPermissionRepository(app)
    assert.instanceOf(permissionRepository, PermissionRepository)
  })

  test('should create permission', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)

    await scopeRepository.create('test')

    const permissionId = await permissionRepository.create({ name: 'test', scope: 'test' })
    assert.typeOf(permissionId, 'number')

    const isExists = await permissionRepository.exists('test')
    assert.isTrue(isExists)
  })

  test('should throw error on create if scope does not exists', async ({ assert }) => {
    const string = app.container.use('Adonis/Core/Helpers').string
    const permissionRepository = getPermissionRepository(app)

    assert.rejects(
      async () =>
        await permissionRepository.create({
          name: 'test',
          scope: string.generateRandom(10),
        })
    )
  })

  test('should throw error on create if permission already exists', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)

    await scopeRepository.create('test')

    const permissionId = await permissionRepository.create({ name: 'test', scope: 'test' })
    assert.typeOf(permissionId, 'number')

    const isExists = await permissionRepository.exists('test')
    assert.isTrue(isExists)

    assert.rejects(() => permissionRepository.create({ name: 'test', scope: 'test' }))
  })

  test('should delete permission', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)

    await scopeRepository.create('test')

    const permissionId = await permissionRepository.create({ name: 'test', scope: 'test' })
    assert.typeOf(permissionId, 'number')

    await permissionRepository.delete('test')
    const isExists = await permissionRepository.exists('test')
    assert.isFalse(isExists)
  })

  test('should check permission existance', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)

    await scopeRepository.create('test')

    const permissionId = await permissionRepository.create({ name: 'test', scope: 'test' })
    assert.typeOf(permissionId, 'number')

    const isExists = await permissionRepository.exists('test')
    assert.isTrue(isExists)

    await permissionRepository.delete('test')
    const isExistsAfterDelete = await permissionRepository.exists('test')
    assert.isFalse(isExistsAfterDelete)
  })

  test('should find permission by ID', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)

    const scopeId = await scopeRepository.create('test')

    const permissionId = await permissionRepository.create({ name: 'test', scope: 'test' })
    assert.typeOf(permissionId, 'number')

    const permission = await permissionRepository.find('name', 'test')
    assert.deepEqual({ id: permissionId, name: 'test', scope_id: scopeId }, permission)
  })

  test('should find permission by name', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)

    const scopeId = await scopeRepository.create('test')

    const permissionId = await permissionRepository.create({ name: 'test', scope: 'test' })
    assert.typeOf(permissionId, 'number')

    const permission = await permissionRepository.find('name', 'test')
    assert.deepEqual({ id: permissionId, name: 'test', scope_id: scopeId }, permission)
  })
})
