import {
  ExcludeBuilderChain,
  ExcludeResourceChain,
  MemberContract,
  MemberDriverContract,
  MemberPermissionRepositoryContract,
  MemberScopeRepositoryContract,
  ResourceContract,
} from '@ioc:Adonis/Addons/Authorizable'

export default class MemberDriver implements MemberDriverContract {
  constructor(
    private readonly memberScopeRepository: MemberScopeRepositoryContract,
    private readonly memberPermissionRepository: MemberPermissionRepositoryContract
  ) {}

  protected $member: MemberContract | null
  protected $resource: ResourceContract | null

  public resource(resource: ResourceContract): ExcludeResourceChain<this> {
    this.$resource = resource
    return this
  }

  public member(member: MemberContract): ExcludeBuilderChain<this> {
    this.$member = member
    return this
  }

  protected check() {
    if (!this.$resource) {
      throw new Error('Resource does not found')
    }
    if (!this.$member) {
      throw new Error('Member does not found')
    }
  }

  public get scopes() {
    this.check()
    return this.memberScopeRepository.resource(this.$resource!).member(this.$member!)
  }

  public get permissions() {
    this.check()
    return this.memberPermissionRepository.resource(this.$resource!).member(this.$member!)
  }
}
