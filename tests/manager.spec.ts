import { test } from '@japa/runner'

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import MemberDriver from '../src/drivers/member'
import ResourceDriver from '../src/drivers/resource'
import AuthorizableManager from '../src/manager'
import MemberRepository from '../src/repositories/member'
import MemberPermissionRepository from '../src/repositories/member_permission'
import MemberScopeRepository from '../src/repositories/member_scope'
import PermissionRepository from '../src/repositories/permission'
import ScopeRepository from '../src/repositories/scope'
import {
  cleanup,
  getManager,
  getMember,
  getResource,
  reset,
  setup,
  setupApplication,
} from '../test-helpers'
let app: ApplicationContract

test.group('Authorizable', (group) => {
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

  test('successfully create authorizable manager instance', ({ assert }) => {
    const manager = getManager(app)
    const member = getMember()
    const resource = getResource()

    assert.instanceOf(manager, AuthorizableManager)
    assert.instanceOf(manager.use('resource'), ResourceDriver)
    assert.instanceOf(manager.use('resource').resource(resource).member(member), MemberDriver)
    assert.instanceOf(manager.use('resource').scopes, ScopeRepository)
    assert.instanceOf(manager.use('resource').permissions, PermissionRepository)
    assert.instanceOf(manager.use('resource').resource(resource).members, MemberRepository)
    assert.instanceOf(
      manager.use('resource').resource(resource).member(member).scopes,
      MemberScopeRepository
    )
    assert.instanceOf(
      manager.use('resource').resource(resource).member(member).permissions,
      MemberPermissionRepository
    )
  })
})
