import { test } from '@japa/runner'

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import MemberScopeRepository from '../../src/repositories/member_scope'
import {
  cleanup,
  getMember,
  getMemberRepository,
  getMemberScopeRepository,
  getResource,
  getScopeRepository,
  reset,
  setup,
  setupApplication,
} from '../../test-helpers'

let app: ApplicationContract

test.group('Member Scope Repository', (group) => {
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
    const memberScopeRepository = getMemberScopeRepository(app)
    assert.instanceOf(memberScopeRepository, MemberScopeRepository)
  })

  test('should throw if resource does not defined', async ({ assert }) => {
    const memberScopeRepository = getMemberScopeRepository(app)

    assert.rejects(() => memberScopeRepository.attach(''))
    assert.rejects(() => memberScopeRepository.detach(''))
    assert.rejects(() => memberScopeRepository.exists(''))
    assert.rejects(() => memberScopeRepository.existsById(1))
    assert.rejects(() => memberScopeRepository.all())
  })

  test('should throw if member does not defined', async ({ assert }) => {
    const memberScopeRepository = getMemberScopeRepository(app)
    const resource = getResource()

    assert.rejects(() => memberScopeRepository.resource(resource).attach(''))
    assert.rejects(() => memberScopeRepository.resource(resource).detach(''))
    assert.rejects(() => memberScopeRepository.resource(resource).exists(''))
    assert.rejects(() => memberScopeRepository.resource(resource).existsById(1))
    assert.rejects(() => memberScopeRepository.resource(resource).all())
  })

  test('should attach scope to member without fail', async ({ assert }) => {
    const memberScopeRepository = getMemberScopeRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await scopeRepository.create('test-two')
    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')

    const isExists = await Promise.all([
      memberScopeRepository.resource(resource).member(member).exists('test'),
      memberScopeRepository.resource(resource).member(member).exists('test-two'),
    ])

    assert.deepEqual([true, false], isExists)
  })

  test('should throw on attach scope to member if already attached', async ({ assert }) => {
    const memberScopeRepository = getMemberScopeRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')

    try {
      await memberScopeRepository.resource(resource).member(member).attach('test')
    } catch (error) {
      assert.instanceOf(error, Error)
    }
  })

  test('should detach scope from member without fail', async ({ assert }) => {
    const memberScopeRepository = getMemberScopeRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await scopeRepository.create('test-two')
    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')

    const isExists = await Promise.all([
      memberScopeRepository.resource(resource).member(member).exists('test'),
      memberScopeRepository.resource(resource).member(member).exists('test-two'),
    ])

    assert.deepEqual([true, false], isExists)

    await memberScopeRepository.resource(resource).member(member).detach('test')

    const isExistsAfterDetach = await Promise.all([
      memberScopeRepository.resource(resource).member(member).exists('test'),
      memberScopeRepository.resource(resource).member(member).exists('test-two'),
    ])

    assert.deepEqual([false, false], isExistsAfterDetach)
  })

  test('should check existance by ID', async ({ assert }) => {
    const memberScopeRepository = getMemberScopeRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    const scopeIds = await Promise.all([
      scopeRepository.create('test'),
      scopeRepository.create('test-two'),
    ])

    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')

    const isExists = await Promise.all([
      memberScopeRepository.resource(resource).member(member).existsById(scopeIds[0]),
      memberScopeRepository.resource(resource).member(member).existsById(scopeIds[1]),
    ])

    assert.deepEqual([true, false], isExists)
  })

  test('should check existance by name', async ({ assert }) => {
    const memberScopeRepository = getMemberScopeRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await scopeRepository.create('test-two')
    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')

    const isExists = await Promise.all([
      memberScopeRepository.resource(resource).member(member).exists('test'),
      memberScopeRepository.resource(resource).member(member).exists('test-two'),
    ])

    assert.deepEqual([true, false], isExists)
  })

  test('should all member scopes', async ({ assert }) => {
    const memberScopeRepository = getMemberScopeRepository(app)
    const memberRepository = getMemberRepository(app)
    const scopeRepository = getScopeRepository(app)
    const resource = getResource()
    const member = getMember()

    await scopeRepository.create('test')
    await scopeRepository.create('test-two')
    await scopeRepository.create('test-three')
    await scopeRepository.create('test-four')
    await memberRepository.resource(resource).attach(member)
    await memberScopeRepository.resource(resource).member(member).attach('test')
    await memberScopeRepository.resource(resource).member(member).attach('test-two')
    await memberScopeRepository.resource(resource).member(member).attach('test-four')

    const allScopes = await memberScopeRepository.resource(resource).member(member).all()
    const allScopesIds = allScopes.map((i) => i.scope_id)

    assert.equal(allScopes.length, 3)
    assert.deepEqual(allScopesIds, [1, 2, 4])
  })
})
