import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

export default async function signMessage(message, PRIVATE_KEY) {
  return await secp.sign(hashMessage(message), PRIVATE_KEY, { recovered: true });
}
