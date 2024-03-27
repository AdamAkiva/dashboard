### Research results:

We should use OAuth2.0 to allow signing in with google. Please read the links before
going further to be familiar with the terminology:  
[Google OAuth](https://developers.google.com/identity/protocols/oauth2)  
[Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)

There are 2 options, either the client or the server making the authentication.  
Logic dictates the FE should redirect to google login, so let's start with that approach:  
With that approach, the FE should redirect to the google login page
(probably giving a sign-in with google button).  
Now comes the question of what is the redirect address, do we tell google the
redirect address is to the frontend or the backend?  
Who should handle the code exchange? (Exchanging the code with a token) the frontend
or the backend?
What about the refresh behavior? Who handles that and how?

---

On another note, the backend approach should go something like this:  
Having a route which the frontend calls.  
That route will should redirect the user to google login screen.  
The server is then the one responsible for handling whether the user accept or
deny the terms.  
After the user accepts the server can immediately store the token in a
database/cache and be the one responsible for the token refresh strategy.
