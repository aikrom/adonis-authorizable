import {
  ExcludeBuilderChain,
  ExcludeResourceChain,
  MemberContract,
  MemberDriverContract,
  MemberRepositoryContract,
  ResourceContract,
  ResourceDriverContract,
  ScopeRepositoryContract,
} from '@ioc:Adonis/Addons/Authorizable'
import PermissionRepository from '../repositories/permission'

export default class ResourceDriver implements ResourceDriverContract {
  private $resource: ResourceContract

  constructor(
    private scopeRespository: ScopeRepositoryContract,
    private permissionRepository: PermissionRepository,
    private memberRepository: MemberRepositoryContract,
    private memberDriver: MemberDriverContract
  ) {}

  public get scopes() {
    return this.scopeRespository
  }

  public get permissions() {
    return this.permissionRepository
  }

  protected check() {
    if (!this.$resource) {
      throw new Error('Resource does not defined')
    }
  }

  public get members() {
    this.check()
    return this.memberRepository.resource(this.$resource)
  }

  public resource(resource: ResourceContract): ExcludeResourceChain<this> {
    this.$resource = resource
    return this
  }

  public member(member: MemberContract): ExcludeBuilderChain<MemberDriverContract> {
    this.check()
    return this.memberDriver.resource(this.$resource).member(member)
  }
}
