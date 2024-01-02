const express= require('express');
const router =express.Router();

const passport= require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User=require('../models/User')
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    
    const newUser={
      googleId: profile.id,
      displayName:profile.displayName,
      firstName:profile.name.givenName,
      lastName:profile.name.familyName,
      profileImage:profile.photos[0].value
    }
    try{
      let user=await User.findOne({googleId: profile.id});
if (user){
  done(null, user);
}else{
  user=await User.create(newUser);
}

    }catch(error){
      console.log(error);
    }

}
));

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/',
                                  successRedirect:'/dashboard' }),
  
  );

  router.get('/login-failure',(req, res)=>{
    res.send('Something went wrong...')
  })


 router.get('/logout',(req,res)=>{
  req.session.destroy(error=>{
    if(error){
      console.log(error);
      res.send('Error login again');
    }else{
      res.redirect('/')
    }
  })
 });





  passport.serializeUser(function(user, done){
    done(null, user.id);
  })


  passport.deserializeUser(function(id, done) {
    User.find({ _id: id })
      .then(function(users) {
        if (users.length === 0) {
          // Handle case where user with provided id is not found
          return done(null, false);
        }
        // User found, pass the user to the done callback
        done(null, users[0]);
      })
      .catch(function(err) {
        done(err, null);
      });
  });
  


module.exports=router;