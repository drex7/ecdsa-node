import { useState } from "react";
import { secp } from "ethereum-cryptography/secp256k1"
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { toHex } from "ethereum-cryptography/utils";

import server from "./server";
import signMessage  from "./helpers";

function Transfer({ address, setBalance, setNonce, nonce }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] =  useState("");
  const [recoveryBit, setRecoveryBit] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  
  // secp.recoverPublicKey(hashMessage(message), signature, recoveryBit);
  const setValue = (setter) => (evt) => setter(evt.target.value);

  const hashMessage = (message) => keccak256(utf8ToBytes(message));

  async function transfer(evt) {
    evt.preventDefault();

    const tx = {
      amount: parseInt(sendAmount),
      recipient,
      sender: address,
      nonce
    };

    // const hash = hashMessage(JSON.stringify(tx));

    const [ signature, recoveryBit ] = await signMessage(JSON.stringify(tx), privateKey);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        tx,
        signature: toHex(signature),
        recoveryBit
      });
      // console.log()
      setBalance(balance);
      setNonce(nonce);
      alert('Transfer successful');
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>
      
      <label>
        Private Key
        <input
          placeholder="Enter your private key to confirm transfer"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
