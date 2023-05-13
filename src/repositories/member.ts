import {
  ExcludeResourceChain,
  MemberContract,
  MemberRepositoryConfigContract,
  MemberRepositoryContract,
  ResourceContract,
} from '@ioc:Adonis/Addons/Authorizable'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'

export default class MemberRepository implements MemberRepositoryContract {
  protected $resource: ResourceContract | null

  constructor(
    private readonly config: MemberRepositoryConfigContract,
    private readonly database: DatabaseContract
  ) {}

  protected check() {
    if (!this.$resource) {
      throw new Error('Resource does not found')
    }
  }

  public resource(resource: ResourceContract): ExcludeResourceChain<this> {
    this.$resource = resource
    return this
  }

  public async attach(member: MemberContract): Promise<number> {
    this.check()

    const isAlreadyExists = await this.exists(member)

    if (isAlreadyExists) {
      throw new Error('Member already does attached to resource')
    }

    const [id] = await this.database
      .table(this.config.table)
      .returning('id')
      .insert({
        [this.config.memberColumn]: member.id,
        [this.config.resourceColumn]: this.$resource!.id,
      })

    return id
  }

  public async detach(member: MemberContract): Promise<void> {
    this.check()

    await this.database
      .from(this.config.table)
      .where(this.config.resourceColumn, this.$resource!.id)
      .where(this.config.memberColumn, member.id)
      .delete()
  }

  public async exists(member: MemberContract): Promise<boolean> {
    this.check()

    const isExists = await this.database
      .from(this.config.table)
      .where(this.config.resourceColumn, this.$resource!.id)
      .where(this.config.memberColumn, member.id)
      .first()

    return !!isExists
  }

  public async find(): Promise<any> {
    throw new Error('Method not implemented.')
  }

  public async all(): Promise<MemberContract[]> {
    this.check()

    return await this.database
      .from(this.config.table)
      .where(this.config.resourceColumn, this.$resource!.id)
      .exec()
  }
}
