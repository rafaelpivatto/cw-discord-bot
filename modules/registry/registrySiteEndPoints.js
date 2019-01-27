const logger = require('heroku-logger');
const request = require('request');
const session = require('express-session');

const logName = '[registrySiteEndPoints] ';

exports.execute = (app) => {
    logger.info(logName + ' start registry express endpoints');
    
    const isUserLogged = (req, res, next) => {
        if (req.cookies.user_sid && req.session.userToken) {
            next();
        } else {
            res.redirect('/');
        }
    };

    // initialize express-session to allow us track the logged-in user across sessions.
    app.use(session({
        key: 'user_sid',
        secret: 'somerandonstuffs',
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000
        }
    }));

    // This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
    // This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
    app.use((req, res, next) => {
        if (req.cookies.user_sid && !req.session.user) {
            res.clearCookie('user_sid');        
        }
        next();
    });

    app.get('/', function (req, res) {
        res.sendFile(`${global.appRoot}/src/site/public/index.html`);
    });

    app.get('/signin', function (req, res) {
        const clientId = process.env.CLIENT_ID;
        const urlCallback = process.env.LOGGED_IN_URL_CALLBACK;
        const scope = process.env.DISCORD_OAUTH_SCOPE;
        const discordUrl = `https://discordapp.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${urlCallback}&response_type=code&scope=${scope}`;
        res.redirect(discordUrl);
    });

    app.get('/signout', function (req, res) {
        if (req.session.user && req.cookies.user_sid) {
            res.clearCookie('user_sid');
        }
        res.redirect('/');
    });

    app.get('/loggedIn', function (req, res) {
        if (req.cookies.user_sid && req.session.userToken) {
            res.redirect('/home');
        } else {
            const options = {
                url: process.env.DISCORD_TOKEN_URL,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: {
                    'client_id': process.env.CLIENT_ID,
                    'client_secret': process.env.CLIENT_SECRET,
                    'grant_type': 'authorization_code',
                    'code': req.query.code,
                    'redirect_uri': process.env.LOGGED_IN_URL_CALLBACK,
                    'scope': process.env.DISCORD_OAUTH_SCOPE
                }
            };
    
            request.post(options, (error, response) => {
                if(error) {
                    res.redirect('/error');
                }
                const access_token = JSON.parse(response.body).access_token;
                req.session.userToken = access_token;
                const options = {
                    url: `${process.env.DISCORD_API_URL}/users/@me`,
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                };
                request.get(options, (error, response) => {
                    if(error) {
                        res.clearCookie('user_sid');
                        res.redirect('/error');
                    }
                    req.session.user = JSON.parse(response.body);
                    res.redirect('/home');
                });        
            });
        }
    });

    app.get('/home', isUserLogged, function (req, res) {
        var options = {
            headers: {
                'x-timestamp': Date.now(),
                'user-name': req.session.user.username
            }
        };
        res.sendFile(`${global.appRoot}/src/site/private/home.html`, options);
        //res.redirect(`Bem-vindo ${req.session.user.username}`);
    });

    // route for handling 404 requests(unavailable routes)
    app.use(function (req, res, next) {
        res.status(404).send('Sorry can\'t find that!');
        next();
    });
};

module.exports = exports;