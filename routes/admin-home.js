const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const admin = require("firebase-admin");
const path = require('path');
const Company = require('../models/comapny');

const companyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/companies')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }

});

const comapanyUpload = multer({ storage: companyStorage });
const homeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/home')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }

});

const homeUpload = multer({ storage: homeStorage });

// GET Methods
router.get('/home', async (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/home.json'));

  const sessionCookie = req.cookies.session || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/home', { data });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});
router.get('/socials', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/socials.json'));
  const sessionCookie = req.cookies.session || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/socials', { data });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});
router.get('/business', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/company.json'));
  var items = data.items
  const sessionCookie = req.cookies.session || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/Бизнес', { items });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});
router.get('/business/:id', (req, res) => {
  const sessionCookie = req.cookies.session || "";
  var data = JSON.parse(fs.readFileSync('./public/company.json'));
  var items = data.items
  const id = req.params.id;
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/Бизнес-edit', { items, id });
    })
    .catch((error) => {
      console.log(error)
      res.redirect("/login");
    });
});
router.get('/about', (req, res) => {
  const sessionCookie = req.cookies.session || "";
  var data = JSON.parse(fs.readFileSync('./public/about.json'));
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((userData) => {
      console.log("Logged in:", userData.email)
      res.render('admin/about', { data });
    })
    .catch((error) => {
      console.log(error)
      res.redirect("/login");
    });
});

// Post Methods
router.post('/socials/save', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/socials.json'));
  console.log(data);
  data.facebook = req.body.facebook;
  data.instagram = req.body.instagram;
  data.twitter = req.body.twitter;
  console.log(req.body);
  fs.writeFile('./public/socials.json', JSON.stringify(data, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(data, null, 2));
  });
  res.redirect('/admin/socials');

});
router.post('/business/:id/save', comapanyUpload.single('image', 1), (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/company.json'));
  const id = req.params.id;
  var imgName;
  if (req.file == undefined) {
    imgName = data.items[id].img;
  } else {
    imgName = req.file.filename;
    const imagePath = './public/images/companies/' + data.items[id].img;
    if (data.items[id].img == "default-image.jpg") {
      console.log('skipped unlink')
    } else {
      fs.unlinkSync(imagePath);
    }

  }

  const newdata = {
    "img": imgName,
    "heading": req.body.heading,
    "paragraph": req.body.paragraph,
    "href": req.body.href
  }
  data.items[id] = newdata;
  fs.writeFile('./public/company.json', JSON.stringify(data, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(data, null, 2));
  });
  res.redirect('/admin/business');

});
router.post('/business/:id/delete', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/company.json'));
  const id = req.params.id;
  const imgName = data.items[id].img;
  data.items.splice(id, 1);
  fs.writeFile('./public/company.json', JSON.stringify(data, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(data, null, 2));
  });
  const imagePath = './public/images/companies/' + imgName;
  if (item == "default-image.jpg") {
    console.log('skipped unlink')
  } else {
    fs.unlinkSync(imagePath);
  }
  res.redirect('/admin/business');

});
router.post('/business/create', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/company.json'));
  const newdata = {
    "img": "default-image.jpg",
    "heading": "Шинэ Өгөгдөл",
    "paragraph": "lorem ipsum",
    "href": "taigam-altai.mn"
  }
  data.items.push(newdata);
  fs.writeFile('./public/company.json', JSON.stringify(data, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(data, null, 2));
  });
  res.status(201).send('Done');

});
router.post('/home/slide1', homeUpload.single('images', 1), (req, res) => {
  if (req.file == null) {
    res.sendStatus('Hooson file ilgeesen baina');
  } else {
    var data = JSON.parse(fs.readFileSync('./public/home.json'));
    const imagePath = './public/images/home/' + data.s1i;
    fs.unlinkSync(imagePath);
    data.s1i = req.file.filename;
    fs.writeFile('./public/home.json', JSON.stringify(data, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(data));
    });
    res.redirect('/admin/home');
  }

});

// some error here
router.post('/home/slidetwo', homeUpload.single('images', 1), (req, res) => {
  if (req.file == null) {
    res.sendStatus('Hooson file ilgeesen baina')
  } else {
    var data = JSON.parse(fs.readFileSync('./public/home.json'));
    const imagePath = './public/images/home/' + data.s2i;
    fs.unlinkSync(imagePath);
    data.s2i = req.file.filename;

    fs.writeFileSync('./public/home.json', JSON.stringify(data, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
      res.sendStatus(200)

    });
    res.redirect('/admin/home');
  }



});
router.post('/home/showcase', homeUpload.array('images', 4), (req, res) => {
  try {
    var data = JSON.parse(fs.readFileSync('./public/home.json'));
    const imagePath0 = './public/images/home/' + data.showcasei[0];
    const imagePath1 = './public/images/home/' + data.showcasei[1];
    const imagePath2 = './public/images/home/' + data.showcasei[2];
    const imagePath3 = './public/images/home/' + data.showcasei[3];
    // fs.unlinkSync(imagePath0);
    // fs.unlinkSync(imagePath1);
    // fs.unlinkSync(imagePath2);
    // fs.unlinkSync(imagePath3);
    data.showcasei[0] = req.files[0].filename;
    data.showcasei[1] = req.files[1].filename;
    data.showcasei[2] = req.files[2].filename;
    data.showcasei[3] = req.files[3].filename;
    fs.writeFile('./public/home.json', JSON.stringify(data, null, 2), function writeJSON(err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(data, null, 2));
    });
    res.redirect('/admin/home');
  } catch (error) {
    res.send('Форм алдаатай байна. 4 Ширхэг зураг сонгоно уу!')
  }

});
router.post('/home/update-text', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/home.json'));
  data.s1h = req.body.s1h.replace(/['"]+/g, '');
  data.s1p = req.body.s1p.replace(/['"]+/g, '');
  data.s2h = req.body.s2h.replace(/['"]+/g, '');
  data.s2p = req.body.s2p.replace(/['"]+/g, '');
  data.service1h = req.body.service1h.replace(/['"]+/g, '');
  data.service2h = req.body.service2h.replace(/['"]+/g, '');
  data.service3h = req.body.service3h.replace(/['"]+/g, '');
  data.service4h = req.body.service4h.replace(/['"]+/g, '');
  data.service1p = req.body.service1p.replace(/['"]+/g, '');
  data.service2p = req.body.service2p.replace(/['"]+/g, '');
  data.service3p = req.body.service3p.replace(/['"]+/g, '');
  data.service4p = req.body.service4p.replace(/['"]+/g, '');
  data.abouth = req.body.abouth.replace(/['"]+/g, '');
  data.aboutp = req.body.aboutp.replace(/['"]+/g, '');
  data.careerh = req.body.careerh.replace(/['"]+/g, '');
  data.careerp = req.body.careerp.replace(/['"]+/g, '');
  fs.writeFile('./public/home.json', JSON.stringify(data, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(data, null, 2));
  });
  res.sendStatus(201);
});
router.post('/about/update-text', (req, res) => {
  var data = JSON.parse(fs.readFileSync('./public/about.json'));
  var s1h = req.body.s1h
  var s1p1 = req.body.s1p1
  var s1p2 = req.body.s1p2
  var s2h = req.body.s2h
  var s2p1 = req.body.s2p1
  var s2p2 = req.body.s2p2
  var s2p3 = req.body.s2p3
  s1h.replace(/['"]+/g, '');
  s1p1.replace(/['"]+/g, '');
  s1p2.replace(/['"]+/g, '');
  s2h.replace(/['"]+/g, '');
  s2p1.replace(/['"]+/g, '');
  s2p2.replace(/['"]+/g, '');
  s2p3.replace(/['"]+/g, '');
  data.s1h = s1h;
  data.s1p1 = s1p1;
  data.s1p2 = s1p2;
  data.s2h = s2h;
  data.s2p1 = s2p1;
  data.s2p2 = s2p2;
  data.s2p3 = s2p3;

  fs.writeFile('./public/about.json', JSON.stringify(data, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(data, null, 2));
  });
  res.sendStatus(201);
});

module.exports = router;