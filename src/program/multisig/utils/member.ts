import { type Address } from "gill";

export const MemberPermissions = {
  All: 7, // Cloud Key
  Vote: 2, // Recovery Key
};

export type Permissions = {
  mask: number;
};

export type Member = {
  key: Address;
  permissions: Permissions;
};

export const CLOUD_KEY_LABEL = "Cloud Key";
export const RECOVERY_KEY_LABEL = "Recovery Key";

export function isKeyMember(members: Member[], address: Address) {
  return members.some((m) => m.key === address);
}

export function hasCloudPermission(
  members: Member[],
  address: Address | undefined,
) {
  if (!members?.length || !address || !isKeyMember(members, address))
    return false;

  const member = members.find((m) => m.key === address);

  if (member?.permissions?.mask === MemberPermissions.All) return true;

  return false;
}

export function hasRecoveryPermission(
  members: Member[],
  address: Address | undefined,
) {
  if (!members?.length || !address || !isKeyMember(members, address))
    return false;

  const member = members.find((m) => m.key === address);

  if (member?.permissions?.mask === MemberPermissions.Vote) return true;

  return false;
}

export function getPermissionLabel(
  members: Member[],
  address: Address | undefined,
): string {
  if (!members?.length || !address || !isKeyMember(members, address)) return "";
  const member = members.find((m) => m.key === address);
  const permission = member?.permissions?.mask;

  if (permission === MemberPermissions.All) return CLOUD_KEY_LABEL;
  if (permission === MemberPermissions.Vote) return RECOVERY_KEY_LABEL;

  return "";
}
