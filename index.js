'use latest';

const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const csurf = require('csurf');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const _ = require('lodash');

const PORT = process.env.PORT || 5000

const app = express();

app.use(cookieSession({
  name: 'session',
  secret: 'shhh...',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const csrfProtection = csurf();

app.post('/callback',  (req, res) => {
      console.log(req.body);
       const formData = _.omit(req.body, '_csrf');
      const HTML = renderReturnView({
        action: `https://${process.env.AUTH0_CUSTOM_DOMAIN}/continue?state=${req.session.state}`,
        formData
      });


      // clear session
      req.session = null;

      res.set('Content-Type', 'text/html');
      res.status(200).send(HTML);

});

app.get('/', verifyInputToken, csrfProtection, (req, res) => {
  // get required fields from JWT passed from Auth0 rule
  // store data in session that needs to survive the POST
  req.session.subject = req.tokenPayload.sub;
  req.session.state = req.query.state;

  // render the profile form
  const data = {
    subject: req.tokenPayload.sub,
    csrfToken: req.csrfToken(),
    fields: {},
    action: req.originalUrl.split('?')[0]
  };

    console.log(req.tokenPayload);
    data.fields.email = req.tokenPayload.login_hint;
    data.fields.connection = req.tokenPayload.connection;
    data.fields.domain = process.env.AUTH0_CUSTOM_DOMAIN;
    data.fields.clientID = process.env.AUTH0_CLIENT_ID;
    data.fields.redirectUri = process.env.AUTH0_REDIRECT_URI;

  const html = renderProfileView(data);

  res.set('Content-Type', 'text/html');
  res.status(200).send(html);
});

const parseBody = bodyParser.urlencoded({ extended: false });


app.get('/skip', (req, res) => {

  // render form that auth-posts back to Auth0 with collected data
  const formData = _.omit({skip: true, connection: req.query.connection}, '_csrf');
  const HTML = renderReturnView({
    action: `https://${process.env.AUTH0_CUSTOM_DOMAIN}/continue?state=${req.session.state}`,
    formData
  });

  // clear session
  req.session = null;

  res.set('Content-Type', 'text/html');
  res.status(200).send(HTML);
});

// module.exports = fromExpress(app);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

// middleware functions

function verifyInputToken(req, res, next) {
  const options = {
    issuer: process.env.ISSUER,
    audience: process.env.AUDIENCE
  }

  try {
    req.tokenPayload = jwt.verify(req.query.token, process.env.SECRET, options);
  } catch (err) {
    return next(err);
  }
  return next();
}

function createOutputToken(user_id, state, originalToken, SECRET) {

  var payload = {}
  if (original_session_token !== null) {
    payload = originalToken
  }
  payload["iat"] = new Date();
  payload["state"] = state;
  payload["user_id"] = user_id;

  payload["exp"] = new Date() + (5*600);
  encoded = jwt.encode(payload, SECRET, algorithm="HS256")
  return encoded

}

// view functions

function renderProfileView(data) {
  const template = `
<html lang="en">
   <script type="text/javascript" src="chrome-extension://mdnleldcmiljblolnjhpnblkcekpdkpa/libs/customElements.js" class="__REQUESTLY__SCRIPT"></script>
   <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="robots" content="noindex, nofollow">
      <script src="https://cdn.auth0.com/js/auth0/9.14/auth0.min.js"></script>
      <link rel="stylesheet" href="https://cdn.auth0.com/ulp/react-components/1.82.34/css/main.cdn.min.css">
      <style id="custom-styles-container">
         :root {
         --primary-color: #e41c30;
         }
         :root {
         --button-font-color: #ffffff;
         }
         :root {
         --secondary-button-border-color: #c9cace;
         --social-button-border-color: #c9cace;
         --radio-button-border-color: #c9cace;
         }
         :root {
         --secondary-button-text-color: #1e212a;
         }
         :root {
         --link-color: #e41c30;
         }
         :root {
         --title-font-color: #1e212a;
         }
         :root {
         --font-default-color: #1e212a;
         }
         :root {
         --widget-background-color: #ffffff;
         }
         :root {
         --box-border-color: #c9cace;
         }
         :root {
         --font-light-color: #65676e;
         }
         :root {
         --input-text-color: #000000;
         }
         :root {
         --input-border-color: #c9cace;
         --border-default-color: #c9cace;
         }
         :root {
         --input-background-color: #ffffff;
         }
         :root {
         --icon-default-color: #65676e;
         }
         :root {
         --error-color: #d03c38;
         --error-text-color: #ffffff;
         }
         :root {
         --success-color: #13a688;
         }
         :root {
         --base-focus-color: #e41c30;
         --transparency-focus-color: rgba(228,28,48, 0.15);
         }
         :root {
         --base-hover-color: #000000;
         --transparency-hover-color: rgba(0,0,0, var(--hover-transparency-value));
         }
         html, :root {
         font-size: 16px;
         --default-font-size: 16px;
         }
         body {
         --title-font-size: 1.5rem;
         --title-font-weight: var(--font-bold-weight);
         }
         .c9379085c {
         font-size: 0.875rem;
         font-weight: var(--font-default-weight);
         }
         .cc350c5e1 {
         font-size: 0.875rem;
         font-weight: var(--font-default-weight);
         }
         .ulp-passkey-benefit-heading {
         font-size: 1.025rem;
         }
         .c320322a4, .c92735da5 {
         font-size: 1rem;
         font-weight: var(--font-bold-weight);
         }
         body {
         --ulp-label-font-size: 1rem;
         --ulp-label-font-weight: var(--font-default-weight);
         }
         .c02d1a4e5, .c334acb20, [id^='ulp-container-'] a {
         font-size: 0.875rem;
         font-weight: var(--font-bold-weight) !important;
         }
         :root {
         --button-border-width: 1px;
         --social-button-border-width: 1px;
         --radio-border-width: 1px;
         }
         body {
         --button-border-radius: 9999px;
         --radio-border-radius: 9999px;
         }
         :root {
         --input-border-width: 1px;
         }
         body {
         --input-border-radius: 3px;
         }
         :root {
         --border-radius-outer: 45px;
         }
         :root {
         --box-border-width: 0px;
         }
         body {
         --logo-alignment: 0 auto;
         }
         .c9b87a0bf {
         content: url('https://i.pinimg.com/originals/16/8e/32/168e32c587e6b89ff700d7778657e5c8.jpg');
         }
         body {
         --logo-height: 94px;
         }
         .c9b87a0bf {
         height: var(--logo-height);
         }
         body {
         --header-alignment: center;
         }
         .c76df42b0 {
         --page-background-alignment: left;
         }
         body {
         --page-background-color: #000000;
         }
      </style>
      <style>
         /* By default, hide features for javascript-disabled browsing */
         /* We use !important to override any css with higher specificity */
         /* It is also overriden by the styles in
         <noscript>
         in the header file */
         .no-js {
         clip: rect(0 0 0 0);
         clip-path: inset(50%);
         height: 1px;
         overflow: hidden;
         position: absolute;
         white-space: nowrap;
         width: 1px;
         }
      </style>
      <noscript>
         <style>
            /* We use !important to override the default for js enabled */
            /* If the display should be other than block, it should be defined specifically here */
            .js-required { display: none !important; }
            .no-js {
            clip: auto;
            clip-path: none;
            height: auto;
            overflow: auto;
            position: static;
            white-space: normal;
            width: var(--prompt-width);
            }
         </style>
      </noscript>
      <title>Link your existing account</title>
   </head>
   <body>
      <script>
            var params = Object.assign({
                    overrides: {
                        __tenant: "<%= fields.domain %>",
                        __token_issuer: "<%= fields.domain %>"
                    },
                    domain: "<%= fields.domain %>",
                    clientID: "<%= fields.clientID %>",
                    redirectUri: "<%= fields.redirectUri %>",
                    responseMode: 'form_post',
                    responseType: 'id_token'
                });

            var webAuth = new auth0.WebAuth(params);
      </script>
      <script type="text/javascript">


            function continueWithLinking() {


              console.log("in web redirect");
              webAuth.authorize({
                login_hint: "<%= fields.email %>",
                connection: "<%= fields.connection %>",
                prompt: "login"
              });
            }


      </script>
      <div class="c1da5ed5a c76df42b0">
         <main class="cc0898f2e login">
            <section class="c514c2a0c _prompt-box-outer cad7272d7">
               <div class="c04280c84 ce8c6dd06">
                  <div class="c5129532b">
                     <header class="ca119bfbc cc64120cb">
                        <h1 class="ccfc394ca c07f2d8b3">Do you want to link your existing account?</h1>
                        <div class="c9379085c c70c2a3ce">
                           <p class="c129646bd cd98a4fb9">Login with your existing account to link your existing profile</p>
                        </div>
                     </header>
                     <div class="cc350c5e1 c6887ef26">
                           <div style="visibility: hidden !important; position: absolute !important" aria-hidden="true">
                              <button onclick="continueWithLinking()" name="action" value="default" style="visibility: hidden !important" aria-hidden="true" tabindex="-1">Link account</button>
                           </div>
                           <div class="c63db4457">
                              <button onclick="continueWithLinking()" name="action" value="default" class="c320322a4 c480bc568 c20af198f ce9190a97 cbb0cc1ad" data-action-button-primary="true">Link Account</button>
                           </div>
                        <div class="ulp-alternate-action  _alternate-action __s16nu9">
                           <p class="c129646bd cd98a4fb9 caf04fd1b">Or
                              <a class="c334acb20 c71d13e70" href="/skip?connection=<%= fields.connection %>" aria-label="">Skip this step</a>
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
         </main>
      </div>
   </body>
</html>`;

  return ejs.render(template, data);
}

function renderReturnView (data) {
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>

    <body>
      <form id="return_form" method="post" action="<%= action %>">
        <% Object.keys(formData).forEach((key) => { %>
        <input type="hidden" name="<%= key %>" value="<%= formData[key] %>">
        <% }); %>
      </form>
      <script>
        // automatically post the above form
        var form = document.getElementById('return_form');
        form.submit();
      </script>
    </body>
    </html>
  `;

  return ejs.render(template, data);
}