const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require('express');
const admin = require("firebase-admin");
const Product = require('./models/product');
const Service = require('./models/service');
const path = require('path');
const multer = require('multer');
const fs = require('fs')

const serviceAccount = require("./serviceAccountKey.json");
const { fstat } = require("fs");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://server-auth-41acc.firebaseio.com",
  });
const firestore = admin.firestore();
const csrfMiddleware = csrf({ cookie: true });
//file upload controller;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images/showcase')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, Date.now() + path.extname(file.originalname))
  }

});
const upload = multer({storage: storage})

const port = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.use(function (req, res, next) {
    var token = req.csrfToken();
    res.cookie("XSRF-TOKEN", token);
    res.locals.csrfToken = token;
    next();
  });
//public routes
app.get('/', async (req, res) => {
  const service = firestore.collection('services');
  const data = await service.get();
  const services = [];
  if(data.empty) {
    return null;
  }else {
    data.forEach(doc => {
        const service = new Service(
            doc.id,
            doc.data().title,
            doc.data().subtitle,
        );
        services.push(service);
    });
    
  }
  const showcaseref = firestore.collection('showcase').doc('nEyjlOFanwfyfYjianar');
  const showdata = await showcaseref.get();
  var showcase = {};
  if(!showdata.exists) {
    res.status(404)
  }else {
    showcase = showdata.data();
            
  }
  var images = [];
  fs.promises.readdir('./images/showcase', (err, files) => {
      images = files;
      res.status(200).render('client/index', {services, images, showcase});
    })
  
  
});
app.get('/about', (req, res) => {
  res.status(200).render('client/Бидний-Тухай');
});
app.get('/sales', (req, res) => {
  res.status(200).render('client/Борлуулалт');
});
app.get('/contact', (req, res) => {
  res.status(200).render('client/Холбоо-барих');
});
//admin routes
app.get("/admin", (req, res) => {
    const sessionCookie = req.cookies.session || "";
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/index')
    })
    .catch((error) => {
      res.redirect("/login");
    });
    
});
app.get('/admin/sales', async (req, res) => {
    const sessionCookie = req.cookies.session || "";
    const product = await firestore.collection('products');
        const data = await product.get();
        const products = [];
        if(data.empty) {
            return null;
        }else {
            data.forEach(doc => {
                const product = new Product(
                    doc.id,
                    doc.data().name,
                    doc.data().desc1,
                    doc.data().category,
                );
                products.push(product);
            });
            
        }
    console.log(products)
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/sales', {products});
    })
    .catch((error) => {
      res.redirect("/login");
    });
    
});

app.get('/admin/sales/:id', async (req, res) => {
    const sessionCookie = req.cookies.session || "";
    const id = req.params.id;
    const link = '../../images/bg2.jpg';
    const ref = await firestore.collection('products').doc(id);
        const data = await ref.get();
        var product = {};
        if(!data.exists) {
            res.status(404)
        }else {
            product = data.data();
            
        }
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/product', {product , link});
    })
    .catch((error) => {
      res.redirect("/login");
    });
    
});

app.get('/admin/service', async (req, res) => {
    const sessionCookie = req.cookies.session || "";
    const service = await firestore.collection('services');
        const data = await service.get();
        const services = [];
        if(data.empty) {
            return null;
        }else {
            data.forEach(doc => {
                const service = new Service(
                    doc.id,
                    doc.data().title,
                    doc.data().subtitle,
                );
                services.push(service);
            });
            
        }
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/Нүүр', {services});
    })
    .catch((error) => {
      res.redirect("/login");
    });
    
});

app.get('/admin/showcase', async (req, res) => {
    const sessionCookie = req.cookies.session || "";
    
    const service = firestore.collection('showcase').doc('nEyjlOFanwfyfYjianar');
        const data = await service.get();
        var showcase = {};
        if(!data.exists) {
            res.status(404)
        }else {
            showcase = data.data();
        }
    var images = [];
    fs.readdir('./images/showcase', (err, files) => {
      images = files;
      admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then((userData) => {
        console.log("Logged in:", userData.email)
        res.render('admin/Санал-болгох', {showcase, images});
      })
      .catch((error) => {
        res.redirect("/login");
      });
    })
    
    
    
    
});
app.get('/admin/showcase/edit', async (req, res) => {
    const sessionCookie = req.cookies.session || "";
    const service = firestore.collection('showcase').doc('nEyjlOFanwfyfYjianar');
        const data = await service.get();
        var showcase = {};
        if(!data.exists) {
            res.status(404)
        }else {
            showcase = data.data();
            
        }
        console.log(showcase)
    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/Санал-болгох-засах', {showcase});
    })
    .catch((error) => {
      res.redirect("/login");
    });
    
});
app.post('/admin/sales/product-save1', upload.array('images', 3), (req, res) => {
  res.status(200)
});

app.post('/admin/showcase/upload', upload.array('images', 4), async (req, res) => {
  fs.readdir('./images/showcase', (err, files) => {
    const path1 = './images/showcase/' + files[0];
    const path2 = './images/showcase/' + files[1];
    const path3 = './images/showcase/' + files[2];
    const path4 = './images/showcase/' + files[3];
    fs.unlinkSync(path1);
    fs.unlinkSync(path2);
    fs.unlinkSync(path3);
    fs.unlinkSync(path4);
  });
  const sessionCookie = req.cookies.session || "";
  console.log(req.body)
  const formData = {
    title: req.body.title,
    subtitle: req.body.subtitle,
  } 
  const service = firestore.collection('showcase').doc('nEyjlOFanwfyfYjianar');
  await service.update(formData);
  admin
  .auth()
  .verifySessionCookie(sessionCookie, true /** checkRevoked */)
  .then(async (userData) => {
    console.log("Logged in:", userData.email);
    
        
    res.redirect('/admin/showcase');
  })
  .catch((error) => {
    res.redirect("/admin/showcase");
  });
  
});




app.get("/login", function (req, res) {
    res.render("admin/login");
  });



app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
  
    const expiresIn = 60 * 60 * 24 * 7 * 1000;
  
    admin
      .auth()
      .createSessionCookie(idToken, { expiresIn })
      .then(
        (sessionCookie) => {
          const options = { maxAge: expiresIn, httpOnly: true };
          res.cookie("session", sessionCookie, options);
          res.end(JSON.stringify({ status: "success" }));
        },
        (error) => {
          res.status(401).send("UNAUTHORIZED REQUEST!");
        }
      );
  });

  app.post("/admin/update-service", async (req, res) => {
    const sessionCookie = req.cookies.session || "";
    const ref = firestore.collection('services');
    const data1 = {
        title: req.body.title1,
        subtitle: req.body.subtitle1,
    }
    const data2 = {
        title: req.body.title2,
        subtitle: req.body.subtitle2,
    }
    const data3 = {
        title: req.body.title3,
        subtitle: req.body.subtitle3,
    }

    admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (userData) => {
        console.log("Logged in:", userData.email)
        try {
            await ref.doc(req.body.id1).update(data1);
            await ref.doc(req.body.id2).update(data2);
            await ref.doc(req.body.id3).update(data3);
            res.set('Content-Type', 'text/html');
            res.status(201).send('Done');
        } catch (e) {
            res.status(500);
            console.log(e)
        }
        
      
    })
    .catch((error) => {
      res.redirect("/login");
    });
  });
  
  app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/login");
  });

app.listen(port, () => {
    console.log(`>DEBUG: Server is listening at http://localhost:${port} `);
});