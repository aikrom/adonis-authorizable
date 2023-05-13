import { test } from '@japa/runner'

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import ScopeRepository from '../../src/repositories/scope'
import { cleanup, getScopeRepository, reset, setup, setupApplication } from '../../test-helpers'

let app: ApplicationContract

test.group('Scope Repository', (group) => {
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
    const scopeRepository = getScopeRepository(app)
    assert.instanceOf(scopeRepository, ScopeRepository)
  })

  test('should create scope', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)

    const scopeId = await scopeRepository.create('test')
    assert.typeOf(scopeId, 'number')

    const isExists = await scopeRepository.exists('test')
    assert.isTrue(isExists)
  })

  test('should throw error if scope already exists', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)

    const scopeId = await scopeRepository.create('test')
    assert.typeOf(scopeId, 'number')

    const isExists = await scopeRepository.exists('test')
    assert.isTrue(isExists)

    assert.rejects(() => scopeRepository.create('test'))
  })

  test('should delete scope', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)

    const scopeId = await scopeRepository.create('test')
    assert.typeOf(scopeId, 'number')

    await scopeRepository.delete('test')
    const isExists = await scopeRepository.exists('test')
    assert.isFalse(isExists)
  })

  test('should check scope existance', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)

    const scopeId = await scopeRepository.create('test')
    assert.typeOf(scopeId, 'number')

    const isExists = await scopeRepository.exists('test')
    assert.isTrue(isExists)

    await scopeRepository.delete('test')
    const isExistsAfterDelete = await scopeRepository.exists('test')
    assert.isFalse(isExistsAfterDelete)
  })

  test('should find scope by ID', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)

    const scopeId = await scopeRepository.create('test')
    assert.typeOf(scopeId, 'number')

    const scope = await scopeRepository.find('id', scopeId)
    assert.deepEqual({ id: scopeId, name: 'test' }, scope)
  })

  test('should find scope by name', async ({ assert }) => {
    const scopeRepository = getScopeRepository(app)

    const scopeId = await scopeRepository.create('test')
    assert.typeOf(scopeId, 'number')

    const scope = await scopeRepository.find('name', 'test')
    assert.deepEqual({ id: scopeId, name: 'test' }, scope)
  })
})
