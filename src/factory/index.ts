import { Config } from '@ioc:Adonis/Addons/Authorizable'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'
import MemberDriver from '../drivers/member'
import ResourceDriver from '../drivers/resource'
import MemberRepository from '../repositories/member'
import MemberPermissionRepository from '../repositories/member_permission'
import MemberScopeRepository from '../repositories/member_scope'
import PermissionRepository from '../repositories/permission'
import ScopeRepository from '../repositories/scope'

export default function AuthorizableFactory(config: Config, database: DatabaseContract) {
  const scopeRepository = new ScopeRepository(config.scope, database)
  const memberRepository = new MemberRepository(config.member, database)
  const permissionRepository = new PermissionRepository(
    config.permission,
    database,
    scopeRepository
  )
  const memberScopeRepository = new MemberScopeRepository(
    { ...config.member.scope, scope: config.scope },
    database,
    scopeRepository
  )
  const memberPermissionRepository = new MemberPermissionRepository(
    { ...config.member.permission, permission: config.permission },
    database,
    permissionRepository,
    memberScopeRepository
  )
  const memberDriver = new MemberDriver(memberScopeRepository, memberPermissionRepository)
  const resourceDriver = new ResourceDriver(
    scopeRepository,
    permissionRepository,
    memberRepository,
    memberDriver
  )

  return resourceDriver
}
