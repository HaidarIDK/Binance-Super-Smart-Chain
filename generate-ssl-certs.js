// Generate self-signed SSL certificates for local HTTPS testing
const forge = require('node-forge');
const fs = require('fs');

console.log('🔧 Generating self-signed SSL certificates...');

// Generate a keypair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create a certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [
  { name: 'countryName', value: 'US' },
  { name: 'stateOrProvinceName', value: 'State' },
  { name: 'localityName', value: 'City' },
  { name: 'organizationName', value: 'BSSC Test' },
  { name: 'organizationalUnitName', value: 'Development' },
  { name: 'commonName', value: 'localhost' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Add extensions
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true
  },
  {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  },
  {
    name: 'subjectAltName',
    altNames: [
      {
        type: 2, // DNS
        value: 'localhost'
      },
      {
        type: 7, // IP
        ip: '127.0.0.1'
      }
    ]
  }
]);

// Self-sign the certificate
cert.sign(keys.privateKey);

// Convert to PEM format
const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
const certificatePem = forge.pki.certificateToPem(cert);

// Write files
fs.writeFileSync('server-key.pem', privateKeyPem);
fs.writeFileSync('server-cert.pem', certificatePem);

console.log('✅ SSL certificates generated:');
console.log('  • server-key.pem (private key)');
console.log('  • server-cert.pem (certificate)');
console.log('');
console.log('⚠️  These are self-signed certificates for testing only.');
console.log('   Browsers will show a security warning - this is normal.');
