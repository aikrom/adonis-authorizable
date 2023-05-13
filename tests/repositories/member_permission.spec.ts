import { test } from '@japa/runner'

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { AuthorizationException } from '../../src/exceptions/authorization'
import MemberPermissionRepository from '../../src/repositories/member_permission'
import {
  cleanup,
  getMember,
  getMemberPermissionRepository,
  getMemberRepository,
  getMemberScopeRepository,
  getPermissionRepository,
  getResource,
  getScopeRepository,
  reset,
  setup,
  setupApplication,
} from '../../test-helpers'

let app: ApplicationContract

test.group('Member Permission Repository', (group) => {
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
    const memberPermissionRepository = getMemberPermissionRepository(app)
    assert.instanceOf(memberPermissionRepository, MemberPermissionRepository)
  })

  test('should throw if resource does not defined', async ({ assert }) => {
    const memberPermissionRepository = getMemberPermissionRepository(app)

    assert.rejects(() => memberPermissionRepository.attach(''))
    assert.rejects(() => memberPermissionRepository.detach(''))
    assert.rejects(() => memberPermissionRepository.exists(''))
    assert.rejects(() => memberPermissionRepository.all())
  })

  test('should throw if member does not defined', async ({ assert }) => {
    const memberPermissionRepository = getMemberPermissionRepository(app)
    const resource = getResource()

    assert.rejects(() => memberPermissionRepository.resource(resource).attach(''))
    assert.rejects(() => memberPermissionRepository.resource(resource).detach(''))
    assert.rejects(() => memberPermissionRepository.resource(resource).exists(''))
    assert.rejects(() => memberPermissionRepository.resource(resource).all())
  })

  test('should attach permission to member without fail', async ({ assert }) => {
    const memberPermissionRepository = getMemberPermissionRepository(app)
    const memberScopeRepository = getMemberScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await permissionRepository.create({ name: 'test', scope: 'test' })
    await permissionRepository.create({ name: 'test-two', scope: 'test' })
    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')
    await memberPermissionRepository.resource(resource).member(member).attach('test')

    const isExists = await Promise.all([
      memberPermissionRepository.resource(resource).member(member).exists('test'),
      memberPermissionRepository.resource(resource).member(member).exists('test-two'),
    ])

    assert.deepEqual([true, false], isExists)
  })

  test('should throw on attach permission to member if already attached', async ({ assert }) => {
    const memberPermissionRepository = getMemberPermissionRepository(app)
    const memberScopeRepository = getMemberScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await permissionRepository.create({ name: 'test', scope: 'test' })
    await permissionRepository.create({ name: 'test-two', scope: 'test' })
    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')
    await memberPermissionRepository.resource(resource).member(member).attach('test')

    try {
      await memberPermissionRepository.resource(resource).member(member).attach('test')
    } catch (error) {
      assert.instanceOf(error, Error)
    }
  })

  test('should throw on attach permission to member if does not have scope', async ({ assert }) => {
    const memberPermissionRepository = getMemberPermissionRepository(app)
    const memberScopeRepository = getMemberScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await scopeRepository.create('test-two')

    await permissionRepository.create({ name: 'test', scope: 'test' })
    await permissionRepository.create({ name: 'test-two', scope: 'test-two' })

    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test-two')
    await memberPermissionRepository.resource(resource).member(member).attach('test-two')

    try {
      await memberScopeRepository.resource(resource).member(member).attach('test')
    } catch (error) {
      assert.instanceOf(error, AuthorizationException)
    }
  })

  test('should detach permission from member without fail', async ({ assert }) => {
    const memberPermissionRepository = getMemberPermissionRepository(app)
    const memberScopeRepository = getMemberScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await scopeRepository.create('test-two')

    await permissionRepository.create({ name: 'test', scope: 'test' })
    await permissionRepository.create({ name: 'test-two', scope: 'test' })

    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')
    await memberPermissionRepository.resource(resource).member(member).attach('test')

    const isExists = await Promise.all([
      memberPermissionRepository.resource(resource).member(member).exists('test'),
      memberPermissionRepository.resource(resource).member(member).exists('test-two'),
    ])

    assert.deepEqual([true, false], isExists)

    await memberPermissionRepository.resource(resource).member(member).detach('test')

    const isExistsAfterDetach = await Promise.all([
      memberPermissionRepository.resource(resource).member(member).exists('test'),
      memberPermissionRepository.resource(resource).member(member).exists('test-two'),
    ])

    assert.deepEqual([false, false], isExistsAfterDetach)
  })

  test('should check existance by name', async ({ assert }) => {
    const memberPermissionRepository = getMemberPermissionRepository(app)
    const memberScopeRepository = getMemberScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await scopeRepository.create('test-two')

    await permissionRepository.create({ name: 'test', scope: 'test' })
    await permissionRepository.create({ name: 'test-two', scope: 'test' })

    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')
    await memberPermissionRepository.resource(resource).member(member).attach('test')

    const isExists = await Promise.all([
      memberPermissionRepository.resource(resource).member(member).exists('test'),
      memberPermissionRepository.resource(resource).member(member).exists('test-two'),
    ])

    assert.deepEqual([true, false], isExists)
  })

  test('should all member scopes', async ({ assert }) => {
    const memberPermissionRepository = getMemberPermissionRepository(app)
    const memberScopeRepository = getMemberScopeRepository(app)
    const permissionRepository = getPermissionRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')

    await permissionRepository.create({ name: 'test', scope: 'test' })
    await permissionRepository.create({ name: 'test-two', scope: 'test' })
    await permissionRepository.create({ name: 'test-three', scope: 'test' })
    await permissionRepository.create({ name: 'test-four', scope: 'test' })

    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')
    await memberPermissionRepository.resource(resource).member(member).attach('test')
    await memberPermissionRepository.resource(resource).member(member).attach('test-two')
    await memberPermissionRepository.resource(resource).member(member).attach('test-four')

    const allPermissions = await memberPermissionRepository.resource(resource).member(member).all()
    const allPermissionsIds = allPermissions.map((i) => i.permission_id)

    assert.equal(allPermissions.length, 3)
    assert.deepEqual(allPermissionsIds, [1, 2, 4])
  })
})
