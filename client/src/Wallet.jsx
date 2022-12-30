import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1'; 
import { toHex } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';

function Wallet({ address, setAddress, balance, setBalance, setNonce }) {
  async function onChange(evt) {
    const address = evt.target.value;
    // const address = toHex(keccak256(secp.getPublicKey(nonce).slice(1)).slice(-20));
    setAddress(address);
    if (address) {
      // const {
      //   data: { balance },
      // } 
      const { data } = await server.get(`balance/${address}`);
      console.log(data);
      setNonce(data.nonce);
      setBalance(data.balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type your address" value={address} onChange={onChange}></input>
      </label>
      <div className="addres">{address}</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
