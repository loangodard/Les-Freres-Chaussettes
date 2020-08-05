const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const https = require('https')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
var sslRedirect = require('heroku-ssl-redirect');


const errorController = require('./controllers/error');
const User = require('./models/user')
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@lfc-dufxi.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
}) //stockage de la session

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert')

const converter = require('./util/convert')

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(helmet())
app.use(compression())
app.use(morgan('combined',{stream:accessLogStream}))
// enable ssl redirect
app.use(sslRedirect());

const { fstat } = require('fs')
const cart = require('./models/cart')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store })) //Initialisation de la sessions

// app.use((req, res, next) => {
//     User.findById('5eff3a583c14fef80550115e')
//         .then(user => {
//             req.user = user
//             next()
//         })
// })

app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.isLoggedIn = false
        req.session.user = new User({
            nom: 'invité',
            prenom: 'invité',
            email: 'invité',
            password: 'invité',
            grade: 'invité',
            items: []
        })
        req.session.cart = new cart({})
    }
    next()
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log('connected with mongoose')
        console.log('listening on 3000')
        app.listen(process.env.PORT || 3000)
        // https.createServer({key:privateKey,cert:certificate},app).listen(process.env.PORT || 3000)
    })
    .catch(err => {
        console.log(err)
    })