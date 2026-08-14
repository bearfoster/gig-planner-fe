# Permission matrix

## Interpretation

Tenant roles are contextual to one tenant. Higher tenant roles retain ordinary
member capabilities. Platform administrator is a separate platform-wide grant,
not a tenant role. Every permission is enforced by the API per use case.

`Own` means the actor owns the personal resource. `Grant` means a Plan viewer or
editor grant applies independently of tenant role. Platform administrators act
under their own identity and produce cross-tenant audit records.

## Tenant and catalogue permissions

| Capability                                       | Member | Editor | Administrator | Owner | Platform administrator       |
| ------------------------------------------------ | ------ | ------ | ------------- | ----- | ---------------------------- |
| Browse private tenant catalogue                  | Yes    | Yes    | Yes           | Yes   | Yes, through platform access |
| Create own tenant                                | Yes    | Yes    | Yes           | Yes   | Yes                          |
| Edit tenant name/timezone                        | No     | No     | Yes           | Yes   | Yes                          |
| Create/edit/publish Event, Participant, Place    | No     | Yes    | Yes           | Yes   | Yes                          |
| Save human-authored event as draft               | No     | Yes    | Yes           | Yes   | Yes                          |
| Archive catalogue content                        | No     | Yes    | Yes           | Yes   | Yes                          |
| Restore an archived Event                        | No     | No     | No            | No    | No; create a new Event       |
| Manage categories                                | No     | No     | Yes           | Yes   | Yes                          |
| Manage custom-field definitions                  | No     | No     | Yes           | Yes   | Yes                          |
| Review/edit/approve/reject integration proposals | No     | Yes    | Yes           | Yes   | Yes                          |
| View tenant audit history                        | No     | No     | Yes           | Yes   | Yes                          |

## Membership and tenant lifecycle permissions

| Capability                                  | Member | Editor | Administrator | Owner                  | Platform administrator                          |
| ------------------------------------------- | ------ | ------ | ------------- | ---------------------- | ----------------------------------------------- |
| Invite member/editor                        | No     | No     | Yes           | Yes                    | Yes                                             |
| Invite administrator                        | No     | No     | Yes           | Yes                    | Yes                                             |
| Grant owner role                            | No     | No     | No            | Yes                    | Platform grant not used as tenant impersonation |
| Change/remove member, editor, administrator | No     | No     | Yes           | Yes                    | Yes                                             |
| Change/remove another owner                 | No     | No     | No            | Yes, except last owner | Yes, with safeguards                            |
| Leave tenant                                | Yes    | Yes    | Yes           | Yes, unless sole owner | Not applicable as platform role                 |
| Create integration service account/API key  | No     | No     | Yes           | Yes                    | Yes                                             |
| Rotate/revoke integration key               | No     | No     | Yes           | Yes                    | Yes                                             |
| Request tenant export                       | No     | No     | No            | Yes                    | No by default; platform inspection is separate  |
| Cancel pending tenant deletion              | No     | No     | No            | Yes                    | Yes                                             |
| Delete tenant                               | No     | No     | No            | Yes, confirmed         | Yes, confirmed with audit reason                |
| Suspend/unsuspend tenant                    | No     | No     | No            | No                     | Yes                                             |
| Grant platform-administrator privilege      | No     | No     | No            | No                     | Seed/configuration initially                    |

Administrators cannot promote anyone to owner or remove/demote an owner.
Inviting an existing member never changes their role.

## Personal planning permissions

| Capability                  | Resource owner | Plan editor grant | Plan viewer grant | Other tenant member       | Platform administrator                |
| --------------------------- | -------------- | ----------------- | ----------------- | ------------------------- | ------------------------------------- |
| Maintain own favourites     | Yes            | Not applicable    | Not applicable    | Own only                  | No impersonation                      |
| Create a plan               | Yes            | Not applicable    | Not applicable    | Yes, as owner of new plan | No impersonation                      |
| Read a plan                 | Yes            | Yes               | Yes               | No                        | Yes, through explicit platform access |
| Edit metadata and entries   | Yes            | Yes               | No                | No                        | Yes, attributed as platform action    |
| Change viewer/editor grants | Yes            | No                | No                | No                        | Yes, attributed as platform action    |
| Transfer plan ownership     | Yes            | No                | No                | No                        | Yes, with audit record                |
| Delete plan                 | Yes            | No                | No                | No                        | Yes, with audit record                |

Tenant editor/administrator/owner roles do not automatically grant access to
another member's plan. Access comes from ownership, an explicit Plan grant, or
explicit platform-administrator authority.

## Integration service-account permissions

| Capability                                   | Scoped integration credential                 |
| -------------------------------------------- | --------------------------------------------- |
| Read permitted tenant schema/custom fields   | With explicit read scope                      |
| Search/read permitted catalogue resources    | With explicit read scope                      |
| Propose new Event                            | With proposal-write scope and idempotency key |
| Propose update to Event                      | With proposal-write scope and idempotency key |
| Check own proposal status                    | With appropriate proposal-read scope          |
| Publish or approve content                   | Never                                         |
| Change custom-field definitions              | Never                                         |
| Manage membership, roles, or tenant settings | Never                                         |
| Manage integration credentials               | Never                                         |
| Cross tenant boundary                        | Never; key is tenant scoped                   |

Suspension immediately disables tenant member, tenant administrator,
integration, and MCP access. Platform administrators retain only the access
needed to inspect, unsuspend, restore, or delete the tenant under their own
identity.
