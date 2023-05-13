declare module '@ioc:Adonis/Addons/Authorizable' {
  import type { ManagerContract } from '@poppinss/manager'

  export type ExcludeResourceChain<T> = Omit<T, 'resource'>
  export type ExcludeMemberChain<T> = Omit<T, 'member'>
  export type ExcludeBuilderChain<T> = Omit<T, 'resource' | 'member'>

  export interface ResourceContract {
    id: number
  }

  export interface MemberContract {
    id: number
  }

  export interface ScopeContract {
    id: number
    name: string
  }

  export interface PermissionContract {
    id: number
    name: string
    scope_id: number
  }

  export interface MemberScopeContract {
    id: number
    scope_id: number
    member_id: number
    resource_id: number
  }

  export interface MemberPermissionContract {
    id: number
    member_id: number
    resource_id: number
    permission_id: number
  }

  export interface ManyToOneRepositoryContract<
    TCreateData = any,
    TDeleteData = any,
    TExistsData = any,
    TData = any
  > {
    create(data: TCreateData): Promise<number>
    delete(data: TDeleteData): Promise<void>
    exists(data: TExistsData): Promise<boolean>
    find(field: string, value: any): Promise<TData>
  }

  export interface ManyToManyRepositoryContract<
    TAttachData = any,
    TDetachData = any,
    TExistsData = any,
    TData = any
  > {
    attach(data: TAttachData): Promise<number>
    detach(data: TDetachData): Promise<void>
    exists(data: TExistsData): Promise<boolean>
    all(): Promise<TData>
  }

  export interface ScopeRepositoryContract
    extends ManyToOneRepositoryContract<string, string, string, ScopeContract> {}

  export interface ScopeRepositoryConfigContract {
    table: string
  }

  export interface PermissionRepositoryContract
    extends ManyToOneRepositoryContract<
      { name: string; scope: string },
      string,
      string,
      PermissionContract
    > {}

  export interface PermissionRepositoryConfigContract {
    table: string
  }

  export interface MemberRepositoryContract
    extends ManyToManyRepositoryContract<
      MemberContract,
      MemberContract,
      MemberContract,
      MemberContract[]
    > {
    resource(resource: ResourceContract): ExcludeResourceChain<this>
  }

  export interface MemberRepositoryConfigContract {
    table: string
    memberColumn: string
    resourceColumn: string
  }

  export interface MemberScopeRepositoryContract
    extends ManyToManyRepositoryContract<string, string, string, MemberScopeContract[]> {
    resource(resource: ResourceContract): ExcludeResourceChain<this>
    member(member: MemberContract): ExcludeBuilderChain<this>
    existsById(scopeId: number): Promise<boolean>
  }

  export interface MemberScopeRepositoryConfigContract {
    table: string
    scope: ScopeRepositoryConfigContract
  }

  export interface MemberPermissionRepositoryContract
    extends ManyToManyRepositoryContract<string, string, string, MemberPermissionContract[]> {
    resource(resource: ResourceContract): ExcludeResourceChain<this>
    member(member: MemberContract): ExcludeBuilderChain<this>
  }

  export interface MemberPermissionRepositoryConfigContract {
    table: string
    permission: PermissionRepositoryConfigContract
  }

  export interface MemberDriverContract {
    scopes: ExcludeBuilderChain<MemberScopeRepositoryContract>
    permissions: ExcludeBuilderChain<MemberPermissionRepositoryContract>

    resource(resource: ResourceContract): ExcludeResourceChain<this>
    member(member: MemberContract): ExcludeBuilderChain<this>
  }

  export interface ResourceDriverContract {
    scopes: ScopeRepositoryContract
    permissions: PermissionRepositoryContract
    members: ExcludeBuilderChain<MemberRepositoryContract>

    resource(resource: ResourceContract): ExcludeResourceChain<this>
    member(member: MemberContract): ExcludeBuilderChain<MemberDriverContract>
  }

  export interface Config {
    scope: ScopeRepositoryConfigContract
    permission: PermissionRepositoryConfigContract
    member: MemberRepositoryConfigContract & {
      scope: Omit<MemberScopeRepositoryConfigContract, 'scope'>
      permission: Omit<MemberPermissionRepositoryConfigContract, 'permission'>
    }
  }

  export interface AuthorizableManagerMapping {}

  export type MappingList = {
    [key in keyof AuthorizableManagerMapping]: Omit<ResourceDriverContract, 'members' | 'member'>
  }

  export interface AuthorizableConfig {
    list: {
      [k in keyof AuthorizableManagerMapping]: Config
    }
  }

  export type AuthorizableManager = ManagerContract<
    any,
    Omit<ResourceDriverContract, 'members' | 'member'>,
    Omit<ResourceDriverContract, 'members' | 'member'>,
    MappingList
  >

  const Authorizable: AuthorizableManager
  export default Authorizable
}
