const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1"); 
const { toHex } = require("ethereum-cryptography/utils");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 }= require("ethereum-cryptography/keccak");
const port = 3042;

app.use(cors());
app.use(express.json());

const wallets = {
  "2a72fc57fdac928b9eb988b0fc781b5fa288a519": { balance: 100, nonce: 0 },   // 15ba04eaf894e51055fa6ff21929345f6744f44543ed45886b8fc870751178ac
  "4d34e83bc8fea965655c010dee8356adea88a78e": { balance: 50, nonce: 5 },    // ab37284848ad40e74bcc5497430253666e5ffc7eea02f435aeaafec5229adca9
  "d526b5dafe32c36fb1d79ade9d3c115874bdb886": { balance: 75, nonce: 3 },    // a7a0608bda6d47089f256388d0d91462815fda1deb5a30769bf9a9d6fda9d1dc
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = wallets[address] || { balance: 0, nonce: 0 };
  res.send({ ...balance });
});

app.post("/send", (req, res) => {
  console.log(req.body);
  const { tx, signature, recoveryBit } = req.body;
  const { sender, recipient, amount, nonce } = tx;
  const address = secp.recoverPublicKey(keccak256(utf8ToBytes(JSON.stringify(tx))), signature, recoveryBit);
  const senderAddress = toHex(keccak256(address.slice(1)).slice(-20));
  console.log(`sender: ${senderAddress}`);
  if (senderAddress !== sender) {
    return res.status(400).send({ message: 'Invalid signature, sender address not found.' });
  }

  const senderWallet = wallets[sender];
  const recipientWallet = wallets[recipient];
  if(senderWallet.nonce !== nonce) {
    return res.status(400).send({ message: "Invalid nonce."});
  }
  
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (wallets[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    wallets[sender].balance -= amount;
    wallets[recipient].balance += amount;
    wallets[sender].nonce++;
    res.send({ balance: wallets[sender].balance });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!wallets[address].balance) {
    wallets[address].balance = 0;
  }
}
