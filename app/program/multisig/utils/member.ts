import { Address } from "gill";

import { Member, MemberPermissions } from "~/program/multisig/codec";

export const CLOUD_KEY_LABEL = "Cloud Key";
export const RECOVERY_KEY_LABEL = "Recovery Key";

export function isMember(members: Member[], address: Address) {
  return members.some((m) => m.key === address);
}

export function hasCloudPermission(members: Member[], address: Address) {
  if (!isMember(members, address)) return false;

  const member = members.find((m) => m.key === address);

  if (member?.permissions?.mask === MemberPermissions.All) return true;

  return false;
}

export function hasRecoveryPermission(members: Member[], address: Address) {
  if (!isMember(members, address)) return false;

  const member = members.find((m) => m.key === address);

  if (member?.permissions?.mask === MemberPermissions.Vote) return true;

  return false;
}

export function getPermissionLabel(
  members: Member[],
  address: Address,
): string {
  if (!isMember(members, address)) return "";
  const member = members.find((m) => m.key === address);
  const permission = member?.permissions?.mask;

  if (permission === MemberPermissions.All) return CLOUD_KEY_LABEL;
  if (permission === MemberPermissions.Vote) return RECOVERY_KEY_LABEL;

  return "";
}
