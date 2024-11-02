const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { TextDecoder } = require('util');

const app = express();
const port = 3000;
const utf8Decoder = new TextDecoder();
const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

app.use(cors({ origin: '*' }));
app.use(express.json());

let gateway;
async function initializeGateway() {
  const client = await newGrpcConnection();
  gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    hash: hash.sha256,
  });
}

app.get('/assets', async (req, res) => {
  try {
    const contract = getContract();
    const resultBytes = await contract.evaluateTransaction('GetAllAssets');
    const result = JSON.parse(utf8Decoder.decode(resultBytes));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/asset', async (req, res) => {
    const { id, who, what, when, where, why, how } = req.body;
    try {
        const contract = getContract();
        await contract.submitTransaction('CreateAsset', id, who, what, when, where, why, how);
        res.status(200).json({ message: 'Ativo criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/asset/:id', async (req, res) => {
    const { who, what, when, where, why, how } = req.body;
    const { id } = req.params;
    try {
        const contract = getContract();
        await contract.submitTransaction('UpdateAsset', id, who, what, when, where, why, how);
        res.status(200).json({ message: 'Ativo atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/transferAsset', async (req, res) => {
    const { id, newOwner } = req.body;
    try {
        const contract = getContract();
        await contract.submitTransaction('TransferAsset', id, newOwner);
        res.status(200).json({ message: 'Transferência de posse realizada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function getContract() {
  const network = gateway.getNetwork(channelName);
  return network.getContract(chaincodeName);
}

app.listen(port, async () => {
  await initializeGateway();
  console.log(`Servidor rodando em http://localhost:${port}`);
});

async function newGrpcConnection() {
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    'grpc.ssl_target_name_override': peerHostAlias,
  });
}

async function newIdentity() {
  const certPath = await getFirstDirFileName(certDirectoryPath);
  const credentials = await fs.readFile(certPath);
  return { mspId, credentials };
}

async function newSigner() {
  const keyPath = await getFirstDirFileName(keyDirectoryPath);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

async function getFirstDirFileName(dirPath) {
  const files = await fs.readdir(dirPath);
  if (!files.length) {
    throw new Error(`Nenhum arquivo encontrado em: ${dirPath}`);
  }
  return path.join(dirPath, files[0]);
}

function envOrDefault(key, defaultValue) {
  return process.env[key] || defaultValue;
}

const cryptoPath = envOrDefault(
  'CRYPTO_PATH',
  path.resolve(__dirname, '..', '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com')
);
const keyDirectoryPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore');
const certDirectoryPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts');
const tlsCertPath = path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');
