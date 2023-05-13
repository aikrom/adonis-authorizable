import {
  ExcludeBuilderChain,
  ExcludeResourceChain,
  MemberContract,
  MemberScopeContract,
  MemberScopeRepositoryConfigContract,
  MemberScopeRepositoryContract,
  ResourceContract,
} from '@ioc:Adonis/Addons/Authorizable'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'
import ScopeRepository from './scope'

export default class MemberScopeRepository implements MemberScopeRepositoryContract {
  protected $member: MemberContract | null
  protected $resource: ResourceContract | null

  constructor(
    private readonly config: MemberScopeRepositoryConfigContract,
    private readonly database: DatabaseContract,
    private readonly scopeRepository: ScopeRepository
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

    const scope = await this.scopeRepository.find('name', name)

    const [id] = await this.database.table(this.config.table).returning('id').insert({
      scope_id: scope.id,
      member_id: this.$member!.id,
      resource_id: this.$resource!.id,
    })

    return id
  }

  public async detach(name: string): Promise<void> {
    this.check()

    const scope = await this.scopeRepository.find('name', name)

    await this.database
      .from(this.config.table)
      .where(`scope_id`, scope.id)
      .where(`member_id`, this.$member!.id)
      .where(`resource_id`, this.$resource!.id)
      .delete()
  }

  public async exists(name: string): Promise<boolean> {
    this.check()

    const isExists = await this.database
      .from(`${this.config.table} as ms`)
      .leftJoin(`${this.config.scope.table} as rs`, 'ms.scope_id', 'rs.id')
      .where(`rs.name`, name)
      .where(`ms.member_id`, this.$member!.id)
      .where(`ms.resource_id`, this.$resource!.id)
      .first()

    return !!isExists
  }

  public async existsById(id: number): Promise<boolean> {
    this.check()

    const isExists = await this.database
      .from(`${this.config.table} as ms`)
      .leftJoin(`${this.config.scope.table} as rs`, 'ms.scope_id', 'rs.id')
      .where(`rs.id`, id)
      .where(`ms.member_id`, this.$member!.id)
      .where(`ms.resource_id`, this.$resource!.id)
      .first()

    return !!isExists
  }

  public async all(): Promise<MemberScopeContract[]> {
    this.check()

    return await this.database
      .from(`${this.config.table} as ms`)
      .where(`ms.member_id`, this.$member!.id)
      .where(`ms.resource_id`, this.$resource!.id)
      .exec()
  }
}
