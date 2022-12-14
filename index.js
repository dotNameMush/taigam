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
    cb(null, './public/images/showcase')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }

});
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/product')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }

});

const upload = multer({ storage: storage })

const productUpload = multer({ storage: productStorage })

const port = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.use(function (req, res, next) {
  var socials = JSON.parse(fs.readFileSync('./public/socials.json'));
  var token = req.csrfToken();
  res.cookie("XSRF-TOKEN", token);
  res.locals.csrfToken = token;
  res.locals.socials = socials;
  next();
});
//public routes
app.get('/', async (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/home.json'));
  res.status(200).render('client/index', { data });

});
app.get('/company', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/company.json'));
  var items = data.items
  res.render('client/????????????', { items })
})
app.get('/about', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/about.json'));
  res.status(200).render('client/????????????-??????????', { data });
});
app.get('/sales', async (req, res) => {
  const product = firestore.collection('products').orderBy('timestamp');
  const data = await product.get();
  const products = [];
  if (data.empty) {
    return null;
  } else {
    data.forEach(doc => {
      const product = new Product(
        doc.id,
        doc.data().name,
        doc.data().desc1,
        doc.data().desc2,
        doc.data().category,
        doc.data().top1,
        doc.data().top2,
        doc.data().top3,
        doc.data().mid,
        doc.data().bottomList,
        doc.data().midTitle,
        doc.data().midTSubtitle,
        doc.data().headline,
        doc.data().article,
        doc.data().quote,
      );
      products.push(product);
    });

  }
  res.status(200).render('client/????????????????????', { products });
});
app.get('/sales/:id', async (req, res) => {

  const id = req.params.id;
  const ref = firestore.collection('products').doc(id);
  const data = await ref.get();
  var product = {};
  if (!data.exists) {
    res.status(404)
  } else {
    product = data.data();

  }
  res.render('client/product', { product, id });


});
app.get('/contact', (req, res) => {
  res.status(200).render('client/????????????-??????????');
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
  const product = firestore.collection('products').orderBy('timestamp');
  const data = await product.get();
  const products = [];
  if (data.empty) {
    return null;
  } else {
    data.forEach(doc => {
      const product = new Product(
        doc.id,
        doc.data().name,
        doc.data().desc1,
        doc.data().desc2,
        doc.data().category,
        doc.data().top1,
        doc.data().top2,
        doc.data().top3,
        doc.data().mid,
        doc.data().bottomList,
        doc.data().midTitle,
        doc.data().midTSubtitle,
        doc.data().headline,
        doc.data().article,
        doc.data().quote,
      );
      products.push(product);
    });

  }

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/sales', { products });
    })
    .catch((error) => {
      res.redirect("/login");
    });

});
app.post('/admin/sales/create', async (req, res) => {
  const data = {
    name: 'New Sales',
    desc1: 'Sample text. Lorem ipsum dolor sit amet, consectetur adipiscing elit nullam nunc justo sagittis suscipit ultrices.',
    desc2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    category: '???????? ????????',
    top1: 'default-image.jpg',
    top2: 'default-image.jpg',
    top3: 'default-image.jpg',
    mid: 'default-image.jpg',
    bottomList: ['default-image.jpg', 'default-image.jpg'],
    midTitle: 'We are here to help you to finding a best way',
    midTSubtitle: 'Sample text. Lorem ipsum dolor sit amet, consectetur adipiscing elit nullam nunc justo sagittis suscipit ultrices.',
    headline: 'Sample Headline',
    article: 'Sample text. Click to select the text box. Click again or double click to start editing the text. Dictum non consectetur a erat nam at. Aliquam malesuada bibendum arcu vitae elementum curabitur vitae. Tellus mauris a diam maecenas sed enim ut sem. Ipsum faucibus vitae aliquet.',
    quote: 'Euismod in pellentesque massa placerat. Risus quis varius quam quisque. Fermentum leo vel orci porta non pulvinar neque. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu vitae. Viverra aliquet eget sit amet. Platea dictumst vestibulum rhoncus est. Leo integer malesuada nunc vel risus commodo viverra maecenas accumsan. ',
    timestamp: admin.firestore.Timestamp.fromDate(new Date()),
  };
  const ref = firestore.collection('products');
  try {
    await ref.add(data);
    res.set('Content-Type', 'text/html');
    res.status(201).send('Done');
  } catch (e) {
    res.status(500);
    console.log(e)
  }

  console.log('data created')
});

app.get('/admin/sales/:id', async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  const id = req.params.id;
  const ref = firestore.collection('products').doc(id);
  const data = await ref.get();
  var product = {};
  if (!data.exists) {
    res.status(404)
  } else {
    product = data.data();

  }
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/product', { product, id });
    })
    .catch((error) => {
      res.redirect("/login");
    });

});
app.post('/admin/sales/delete', async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  const id = req.body.id;
  const ref = firestore.collection('products').doc(id);
  try {
    await ref.delete();
    res.set('Content-Type', 'text/html');
    res.status(201).send('Done');
  } catch (e) {
    res.status(500);
    console.log(e)
  }

});
app.post('/admin/sales/update-text', async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  const ref = firestore.collection('products').doc(req.body.id);
  const formData = {
    name: req.body.name.replace(/['"]+/g, ''),
    desc1: req.body.desc1.replace(/['"]+/g, ''),
    desc2: req.body.desc2.replace(/['"]+/g, ''),
    midTitle: req.body.midTitle.replace(/['"]+/g, ''),
    midSubtitle: req.body.midSubtitle.replace(/['"]+/g, ''),
    headline: req.body.headline.replace(/['"]+/g, ''),
    article: req.body.article.replace(/['"]+/g, ''),
    quote: req.body.quote.replace(/['"]+/g, ''),
  }

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (userData) => {
      console.log("Logged in:", userData.email)
      try {
        await ref.update(formData);
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
app.post('/admin/sales/product-save1', productUpload.array('image', 3), async (req, res) => {
  const ref = firestore.collection('products').doc(req.body.id);
  const oldData = await ref.get();
  const doc = oldData.data();
  const path1 = './public/images/product/' + doc.top1;
  const path2 = './public/images/product/' + doc.top2;
  const path3 = './public/images/product/' + doc.top3;
  if (doc.top1 == "default-image.jpg") {
    console.log('skipped unlink')
  } else {
    fs.unlinkSync(path1);
  }
  if (doc.top2 == "default-image.jpg") {
    console.log('skipped unlink')
  } else {
    fs.unlinkSync(path2);
  }
  if (doc.top3 == "default-image.jpg") {
    console.log('skipped unlink')
  } else {
    fs.unlinkSync(path3);
  }
  const formData = {
    top1: req.files[1].filename,
    top2: req.files[0].filename,
    top3: req.files[2].filename,
  }
  await ref.update(formData);
  const href = "/admin/sales/" + req.body.id;
  res.redirect(href);
});
app.post('/admin/sales/product-save2', productUpload.single('image', 1), async (req, res) => {
  const ref = firestore.collection('products').doc(req.body.id);
  const oldData = await ref.get();
  const doc = oldData.data();
  const path = './public/images/product/' + doc.mid;
  if (doc.mid == "default-image.jpg") {
    console.log('skipped unlink')
  } else {
    fs.unlinkSync(path);
  }

  const formData = {
    mid: req.file.filename,
  }
  await ref.update(formData);
  const href = "/admin/sales/" + req.body.id;
  res.redirect(href);
});
app.post('/admin/sales/product-save3', productUpload.array('images', 12), async (req, res) => {
  const ref = firestore.collection('products').doc(req.body.id);
  const oldData = await ref.get();
  const doc = oldData.data();
  doc.bottomList.forEach(item => {
    const path = './public/images/product/' + item;
    if (item == "default-image.jpg") {
      console.log('skipped unlink')
    } else {
      fs.unlinkSync(path);
    }
  });
  const listOfImages = req.files.map(({ filename }) => (filename));
  const formData = {
    bottomList: listOfImages,
  }
  await ref.update(formData);
  const href = "/admin/sales/" + req.body.id;
  res.redirect(href);
});

app.get('/admin/service', async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  const service = firestore.collection('services');
  const data = await service.get();
  const services = [];
  if (data.empty) {
    return null;
  } else {
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
      res.render('admin/????????', { services });
    })
    .catch((error) => {
      res.redirect("/login");
    });

});
const adminHome = require('./routes/admin-home');
app.use('/admin', adminHome)

app.get('/admin/showcase/edit', async (req, res) => {
  const sessionCookie = req.cookies.session || "";
  const service = firestore.collection('showcase').doc('nEyjlOFanwfyfYjianar');
  const data = await service.get();
  var showcase = {};
  if (!data.exists) {
    res.status(404)
  } else {
    showcase = data.data();
  }

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/??????????-????????????-??????????', { showcase });
    })
    .catch((error) => {
      res.redirect("/login");
    });

});



app.post('/admin/showcase/upload', upload.array('images', 4), async (req, res) => {
  fs.readdir('./public/images/showcase', (err, files) => {
    const path1 = './public/images/showcase/' + files[0];
    const path2 = './public/images/showcase/' + files[1];
    const path3 = './public/images/showcase/' + files[2];
    const path4 = './public/images/showcase/' + files[3];
    fs.unlinkSync(path1);
    fs.unlinkSync(path2);
    fs.unlinkSync(path3);
    fs.unlinkSync(path4);
  });
  const sessionCookie = req.cookies.session || "";

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
    title: req.body.title1.replace(/['"]+/g, ''),
    subtitle: req.body.subtitle1.replace(/['"]+/g, ''),
  }
  const data2 = {
    title: req.body.title2.replace(/['"]+/g, ''),
    subtitle: req.body.subtitle2.replace(/['"]+/g, ''),
  }
  const data3 = {
    title: req.body.title3.replace(/['"]+/g, ''),
    subtitle: req.body.subtitle3.replace(/['"]+/g, ''),
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