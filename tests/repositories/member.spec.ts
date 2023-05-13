import { test } from '@japa/runner'

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import MemberRepository from '../../src/repositories/member'
import {
  cleanup,
  getMember,
  getMemberRepository,
  getResource,
  reset,
  setup,
  setupApplication,
} from '../../test-helpers'

let app: ApplicationContract

test.group('Member Repository', (group) => {
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
    const memberRepository = getMemberRepository(app)
    assert.instanceOf(memberRepository, MemberRepository)
  })

  test('should throw if resource does not defined', async ({ assert }) => {
    const memberRepository = getMemberRepository(app)
    const member = getMember()

    assert.rejects(() => memberRepository.attach(member))
    assert.rejects(() => memberRepository.detach(member))
    assert.rejects(() => memberRepository.exists(member))
    assert.rejects(() => memberRepository.all())
    assert.rejects(() => memberRepository.find())
  })

  test('should attach member to resource', async ({ assert }) => {
    const memberRepository = getMemberRepository(app)
    const member = getMember()
    const resource = getResource()

    const result = await memberRepository.resource(resource).attach(member)
    assert.typeOf(result, 'number')

    const isExists = await memberRepository.resource(resource).exists(member)
    assert.isTrue(isExists)
  })

  test('should throw on attach member to resource if already exists', async ({ assert }) => {
    const memberRepository = getMemberRepository(app)
    const member = getMember()
    const resource = getResource()

    const result = await memberRepository.resource(resource).attach(member)
    assert.typeOf(result, 'number')

    const isExists = await memberRepository.resource(resource).exists(member)
    assert.isTrue(isExists)

    assert.rejects(() => memberRepository.resource(resource).attach(member))
  })

  test('should detach member from resource', async ({ assert }) => {
    const memberRepository = getMemberRepository(app)
    const member = getMember()
    const resource = getResource()

    const result = await memberRepository.resource(resource).attach(member)
    assert.typeOf(result, 'number')

    const isExists = await memberRepository.resource(resource).exists(member)
    assert.isTrue(isExists)

    await memberRepository.resource(resource).detach(member)

    const isExistsAfterDetach = await memberRepository.exists(member)
    assert.isFalse(isExistsAfterDetach)
  })

  test('should check existance by name', async ({ assert }) => {
    const memberRepository = getMemberRepository(app)
    const memberA = getMember()
    const memberB = getMember()
    const resource = getResource()

    const result = await memberRepository.resource(resource).attach(memberA)
    assert.typeOf(result, 'number')

    const isExistsA = await memberRepository.resource(resource).exists(memberA)
    assert.isTrue(isExistsA)

    const isExistsB = await memberRepository.resource(resource).exists(memberB)
    assert.isFalse(isExistsB)
  })

  test('should get all members ', async ({ assert }) => {
    const memberRepository = getMemberRepository(app)
    const resourceA = getResource()
    const resourceB = getResource()
    const memberA = getMember()
    const memberB = getMember()
    const memberC = getMember()

    await memberRepository.resource(resourceA).attach(memberA)
    await memberRepository.resource(resourceA).attach(memberB)
    await memberRepository.resource(resourceB).attach(memberC)

    const members = await memberRepository.resource(resourceA).all()

    assert.equal(members.length, 2)
    assert.deepEqual(
      [1, 2],
      members.map((i) => i.id)
    )
  })
})
