## API Interface

#### share public api
--- method get

```js

let url_param_public_key = "http://localhost:8184/login?method=get_key";
let url_param_check_login = "http://localhost:8184/login?method=check_login&username=password&password=password"; // by default admin, and admin, and note password should be encoded with the public key provided
let public_key = ""
fetch(url_param_public_key,{method:"GET"}).then((data)=>public_key = data); // returns public key
fetch(url_param_check_login,{method:"GET"}).then((data)=>console.log(data)); // checks user login and says "okay"
```

#### get media photos
-- method **get**
```js
let url_param = "http://localhost:3000/get_image?image_name='hello.png'";
let photo_name = "sth.png"; // *.jpg,*webm   
let response = await fetch(url_param, {method: "GET"});

if (response.status === 200) {
    const imageBlob = await response.blob()
    const imageObjectURL = URL.createObjectURL(imageBlob);
    const image = document.createElement('img')
    image.src = imageObjectURL
    const container = document.getElementById("your-container")
    container.append(image)
}
else {
    console.log("HTTP-Error: " + response.status)
}
```


#### delete media photos
-- method **get**
```js
let url_param = "http://localhost:3000/delete_image?username=admin&password=password&image_name='hello.png'";
let photo_name = "sth.png"; // *.jpg,*webm   
let response = await fetch(url_param, {method: "GET"});

if (response.status === 200) {
    const imageBlob = await response.blob()
    const imageObjectURL = URL.createObjectURL(imageBlob);
    const image = document.createElement('img')
    image.src = imageObjectURL
    const container = document.getElementById("your-container")
    container.append(image)
}
else {
    console.log("HTTP-Error: " + response.status)
}
```

#### post media images
-- method **post**
```js
const formData = new FormData();
const photos = document.querySelector('input[type="file"][multiple]');
let url_param = "http://localhost:3000/upload_image";
const username= "sth"
const password = "sth"
const photo_name = "sth.png"

formData.append('title', 'My Vegas Vacation');
for (let i = 0; i < photos.files.length; i++) {
  formData.append(`photos_${i}`, photos.files[i]);
}

fetch(url_param, {
  method: 'POST',
  body: formData,
})
.then(response => response.json())
.then(result => {
  console.log('Success:', result);
})
.catch(error => {
  console.error('Error:', error);
});
```

#### get json
-- method **get**
```js
let url_param = "localhost:3000/json?item_name=session&username=admin";
// note : item_name can be [session,images]
// session needs username
// images doesnot require username
const username= "admin"

/*
note: json structure is:
{
    session_time: 2,
    username: sth,
    log: logs_file_data,
    .....
}
*/

let json_param = "session_time";

fetch(url_param, {
  method: 'GET'
})
.then(response => response.json())
.then(result => {
  console.log('Success:', result);
})
.catch(error => {
  console.error('Error:', error);
});
```

#### create or delete user admin 
-- method **get**
```js
let url_param = "http:/.....";
const username= "sth" // note this username is prevililaged created 
const password = "sth"
const role = "admin"; // role must be admin to execute this function call
const json_param = `{method:add,username:"sth",password:"12345", role:"admin"}`;
/*
method can be 
1) add
    username
    password
    role 
        admin
        normal
2) delete
    username
    password
    role 
        admin
        normal
3) check_profile
*/

fetch(`${url_param}?method=add_user?json_param=${json_param}?username=${username}&password=${password}&role=${role}`, {
  method: 'GET'
})
.then(response => response.json())
.then(result => {
  console.log('Success:', result);
})
.catch(error => {
  console.error('Error:', error);
});
```


fetch(url_param+,{
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });)













  ------------------


refer to [this](https://www.fullstackfoundations.com/blog/public-key-cryptography) website.

```js
const crypto = require("crypto");
const fs = require("fs");

function genKeyPair() {
  // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096, // bits - standard for RSA keys
    publicKeyEncoding: {
      type: "pkcs1", // "Public Key Cryptography Standards 1"
      format: "pem", // Most common formatting choice
    },
    privateKeyEncoding: {
      type: "pkcs1", // "Public Key Cryptography Standards 1"
      format: "pem", // Most common formatting choice
    },
  });

  // Create the public key file
  fs.writeFileSync(__dirname + "/id_rsa_pub.pem", keyPair.publicKey);

  // Create the private key file
  fs.writeFileSync(__dirname + "/id_rsa_priv.pem", keyPair.privateKey);
}

// Generates the keypair
genKeyPair();
```

```js

const crypto = require("crypto");

function encryptWithPublicKey(publicKey, message) {
  const bufferMessage = Buffer.from(message, "utf8");

  return crypto.publicEncrypt(publicKey, bufferMessage);
}


const publicKey = fs.readFileSync(__dirname + "/id_rsa_pub.pem", "utf8");

// Stores a Buffer object
const encryptedMessage = encrypt.encryptWithPublicKey(
  publicKey,
  "Super secret message"
);

// If you try and "crack the code", you will just get gibberish
console.log(encryptedMessage.toString());
```

```js

const crypto = require("crypto");
const fs = require("fs");
const encrypt = require("./encrypt");
const decrypt = require("./decrypt");

function decryptWithPrivateKey(privateKey, encryptedMessage) {
  return crypto.privateDecrypt(privateKey, encryptedMessage);
}



// ==========================================
// ========= PART 1: Encrypt ================

const publicKey = fs.readFileSync(__dirname + "/id_rsa_pub.pem", "utf8");

// Stores a Buffer object
const encryptedMessage = encrypt.encryptWithPublicKey(
  publicKey,
  "Super secret message"
);

// ==========================================

// Imagine that this message is now sent over a network to another person...

// ==========================================
// ========= PART 2: Decrypt ================

const privateKey = fs.readFileSync(__dirname + "/id_rsa_priv.pem", "utf8");

const decryptedMessage = decrypt.decryptWithPrivateKey(
  privateKey,
  encryptedMessage
);

// Convert the Buffer to a string and print the message!
console.log(decryptedMessage.toString());

```

lastly an example

```js
// file: signMessage.js
// https://github.com/zachgoll/making-sense-of-public-key-cryptography/blob/master/signMessage.js

const crypto = require("crypto");
const hash = crypto.createHash("sha256");
const fs = require("fs");
const encrypt = require("./encrypt");
const decrypt = require("./decrypt");

const myData = {
  firstName: "Zach",
  lastName: "Gollwitzer",
  socialSecurityNumber:
    "NO NO NO.  Never put personal info in a digitally \
  signed message since this form of cryptography does not hide the data!",
};

// String version of our data that can be hashed
const myDataString = JSON.stringify(myData);

// Sets the value on the hash object: requires string format, so we must convert our object
hash.update(myDataString);

// Hashed data in Hexidecimal format
const hashedData = hash.digest("hex");

const senderPrivateKey = fs.readFileSync(
  __dirname + "/id_rsa_priv.pem",
  "utf8"
);

const signedMessage = encrypt.encryptWithPrivateKey(
  senderPrivateKey,
  hashedData
);

// This module will return the "package of data", which is what is sent over the network
module.exports = {
  algorithm: "sha256",
  originalData: myData,
  signedAndEncryptedData: signedMessage,
};
```

```js
// file: verifyIdentity.js
// https://github.com/zachgoll/making-sense-of-public-key-cryptography/blob/master/verifyIdentity.js

const crypto = require("crypto");
const fs = require("fs");
const decrypt = require("./decrypt");

// This is the data that we are receiving from the sender
const receivedData = require("./signMessage");

// Use the hash function provided!
const hash = crypto.createHash(receivedData.algorithm);

// We have the sender's public key here:
const publicKey = fs.readFileSync(__dirname + "/id_rsa_pub.pem", "utf8");

// ==================================
// Step 1: Decrypt the signed message
// ==================================
const decryptedMessage = decrypt.decryptWithPublicKey(
  publicKey,
  receivedData.signedAndEncryptedData
);

// By default, returns a Buffer object, so convert to string
const decryptedMessageHex = decryptedMessage.toString();

// ========================================
// Step 2: Take a hash of the original data
// ========================================
const hashOfOriginal = hash.update(JSON.stringify(receivedData.originalData));
const hashOfOriginalHex = hash.digest("hex");

// ========================================
// Step 3: Check if two hashes match
// ========================================
if (hashOfOriginalHex === decryptedMessageHex) {
  console.log(
    "Success!  The data has not been tampered with and the sender is valid."
  );
} else {
  console.log(
    "Uh oh... Someone is trying to manipulate the data or someone else is sending this!  Do not use!"
  );
}
```
