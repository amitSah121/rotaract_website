const { genKeyPair, decryptWithPrivateKey, encryptWithPublicKey } = require('./key_generator')
const express = require('express')
const app = express()
const fs = require("fs")
require('dotenv').config()
const bodyParser = require('body-parser');
const port = 3000//process.env.port | 8000
const sqlite3 = require('sqlite3');

const os = require("node:os");
const multer  = require('multer');
// const upload = multer({ dest: os.tmpdir() });

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './images')
    },
    filename: (req, file, cb)=>{
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage });
  


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
// //   res.send('Hello World!')
//     let temp="Gello";
//     const db = new sqlite3.Database('Hello');
//     // console.log("Hello");
//     db.serialize(() => {
//         db.run("CREATE TABLE lorem (info TEXT)",(e)=> console.log(e));

//         const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//         for (let i = 0; i < 10; i++) {
//             stmt.run("Ipsum " + i);
//         }
//         stmt.finalize();
//         db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//             temp += row.id + ": " + row.info;
//             // console.log(temp);
//         });
//         // res.send(temp);
//     });
    
//     db.close();
//     const p = setTimeout(()=>{
//         res.send(temp);
//         clearInterval(p);
//     }, 1000);
    res.send("Get");
})

app.get("/setup",(req,res)=>{
    // const db = new sqlite3.Database('user');
    // // db.run("CREATE TABLE USER (id INT, name TEXT, password TEXT, session INT)",(e)=>console.log(e));
    // db.run("INSERT INTO USER values(1,'admin','admin',0)",e=>console.log(e));
    // db.each("SELECT id,name,password,session from USER",(err,row)=>{
    //     console.log(row)
    // });
    // db.close();
    res.send("Done");
});

app.get("/login",(req,res)=>{
    if(req.query.method == "get_key"){
        genKeyPair();
        const publicKey = fs.readFileSync(__dirname + "/id_rsa_pub.pem", "utf8");
        res.send(publicKey);
    }
    else if(req.query.method == "check_login"){
        let username = req.query.username;
        let enc_password = req.query.password;
        // let public_key = req.query.public_key;
        const privateKey = fs.readFileSync(__dirname + "/id_rsa_priv.pem", "utf8");
        let password = decryptWithPrivateKey(privateKey,enc_password);

        // console.log(username,password);
        
        // check username and password
        const db = new sqlite3.Database('user');
        db.serialize(()=>{
            db.each("SELECT id,name,password,session from USER",(err,row)=>{
                if(err) throw err;
                if(row.name == username && row.password == password){
                    db.run(`Update USER set session=10000 where name="${username}"`);
                    // console.log("hello");
                    let p = setInterval(()=>{
                        const db1 = new sqlite3.Database('user');
                        // console.log("hrr");
                        db1.serialize(()=>{
                            let temp = 0;
                            db1.each(`SELECT session from USER where name="${username}"`,(err,row)=>{
                                temp = row.session;
                                // console.log(temp,username);
                            })
                            let q = setTimeout(()=>{
                                db1.run(`update USER set session=${temp+1} where name="${username}"`);
                                if(temp >= 11800){
                                    db1.run(`update USER set session=0 where name="${username}"`)
                                    clearInterval(p);
                                }
                                clearTimeout(q);
                                db1.close();
                            },100);
                        });

                    }, 1000);
                }
            })
        });
        let p = setTimeout(()=>{
            db.close();
            clearTimeout(p);
        },1000);
        res.send("Done");
    }

})

app.get("/session",(req,res)=>{
    let username = req.query.username;
    // console.log(username);
    let temp = 0;
    const db = new sqlite3.Database('user');
    db.each(`SELECT session from USER  where name="${username}"`,(err,row)=>{
        console.log(row);
        temp = row.session;
        // res.send(row.session);
    });
    db.close();
    let p = setTimeout(()=>{
        res.send(" "+temp);
        clearTimeout(p);
    },10);
});


app.post('/upload_image', upload.single('photo'), function(req, res) {
    // const file = req.file;
    // console.log(file);
    
    res.sendStatus(200);
});

app.get("/get_image",function(req,res){
    let file_name = req.query.image_name;
    const image = fs.readFileSync('./images/'+file_name) 
    const imageBase64 = new Buffer(image).toString('base64') 
    // res.send("<img src='./images/abc.png'/>");
    const jsonData = { 
        name: file_name, 
        data: imageBase64 
    } 
    const jsonString = JSON.stringify(jsonData);
    res.send(jsonString);
});

app.get("/delete_image",function(req,res){
    let username = req.query.username;
    let enc_password = req.query.password;
    const privateKey = fs.readFileSync(__dirname + "/id_rsa_priv.pem", "utf8");
    let password = decryptWithPrivateKey(privateKey,enc_password);

    const db = new sqlite3.Database('user');
    db.serialize(()=>{
        db.each(`SELECT id,name,password,session from USER where name="${username}"`,(err,row)=>{
            if(err) throw err;
            if(row.name == username && row.password == password){
                const db = new sqlite3.Database('user');
                db.each(`SELECT session from USER  where name="${username}"`,(err,row)=>{
                    // console.log(row);
                    temp = row.session;
                    if(temp != 0){
                        let file_name = req.query.image_name;
                        fs.unlinkSync(`./images/${file_name}`);
                    }
                    // res.send(row.session);
                });
            }
        })
    });

    db.close();
    res.send("Okay");
})

app.get("/json",(req,res)=>{
    let item = req.query.item_name;
    let temp = "";
    if(item == "images"){
        fs.readdir('./images', (err, files) => {
            files.forEach(file => {
                temp += file + "\n";
        })});
    }else if(item == "session"){
        let username = req.query.username;
        let temp = 0;
        const db = new sqlite3.Database('user');
        db.each(`SELECT session from USER  where name="${username}"`,(err,row)=>{
            // console.log(row);
            temp = row.session;
        });
        db.close();
        let p = setTimeout(()=>{
            res.send(" "+temp);
            clearTimeout(p);
        },10);
        return;
    }
    let p = setTimeout(()=>{
        res.send(temp);
        clearTimeout(p);
    },100)
});

app.listen(port, () => {
  console.log(`Example app listening on port localhost:${port}`)
})