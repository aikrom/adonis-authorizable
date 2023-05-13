import {
  ExcludeBuilderChain,
  ExcludeResourceChain,
  MemberContract,
  MemberPermissionContract,
  MemberPermissionRepositoryConfigContract,
  MemberPermissionRepositoryContract,
  MemberScopeRepositoryContract,
  PermissionRepositoryContract,
  ResourceContract,
} from '@ioc:Adonis/Addons/Authorizable'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'
import { AuthorizationException } from '../exceptions/authorization'

export default class MemberPermissionRepository implements MemberPermissionRepositoryContract {
  protected $member: MemberContract | null
  protected $resource: ResourceContract | null

  constructor(
    private readonly config: MemberPermissionRepositoryConfigContract,
    private readonly database: DatabaseContract,
    private readonly permissionRepository: PermissionRepositoryContract,
    private readonly memberScopeRepository: MemberScopeRepositoryContract
  ) {}

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

  public async attach(name: string): Promise<number> {
    this.check()

    const permission = await this.permissionRepository.find('name', name)

    const isExists = await this.memberScopeRepository
      .resource(this.$resource!)
      .member(this.$member!)
      .existsById(permission.scope_id)

    if (!isExists) {
      throw new AuthorizationException('Permission out of member scopes')
    }

    const [id] = await this.database.table(this.config.table).returning('id').insert({
      member_id: this.$member!.id,
      permission_id: permission.id,
      resource_id: this.$resource!.id,
    })

    return id
  }

  public async detach(name: string): Promise<void> {
    this.check()

    const permission = await this.permissionRepository.find('name', name)

    await this.database
      .from(this.config.table)
      .where('member_id', this.$member!.id)
      .where('permission_id', permission.id)
      .where('resource_id', this.$resource!.id)
      .delete()
  }

  public async exists(name: string): Promise<boolean> {
    this.check()

    const isExists = await this.database
      .from(`${this.config.table} as mp`)
      .leftJoin(`${this.config.permission.table} as rp`, 'mp.permission_id', 'rp.id')
      .where('rp.name', name)
      .where('mp.member_id', this.$member!.id)
      .where('mp.resource_id', this.$resource!.id)
      .first()

    return !!isExists
  }

  public async all(): Promise<MemberPermissionContract[]> {
    this.check()

    return await this.database
      .from(`${this.config.table} as mp`)
      .where('mp.member_id', this.$member!.id)
      .where('mp.resource_id', this.$resource!.id)
      .exec()
  }
}
