import { address } from "gill";
import { PROGRAM_ADDRESS } from "@sqds/multisig";

const SYSTEM_PROGRAM = "11111111111111111111111111111111";

export const MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64 = "4HR5ukShT+w=";
export const PROPOSAL_ACCOUNT_DISCRIMINATOR_BASE64 = "Gl69u3SINSE=";

export const SQUADS_PROGRAM_ID = address(PROGRAM_ADDRESS);
export const SYSTEM_PROGRAM_ADDRESS = address(SYSTEM_PROGRAM);
// export const TOKEN_PROGRAM_ID = address(
//   "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
// );
// export const TOKEN_2022_PROGRAM_ID = address(
//   "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEbSV",
// );
export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const TOKEN_2022_PROGRAM_ID =
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEbSV";
