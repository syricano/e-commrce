import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Serialize user
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const given  = profile.name?.givenName || 'Google';
        const family = profile.name?.familyName || 'User';
        const subject = profile.id;

        // 1) Prefer exact OAuth binding
        let user = await User.findOne({
          where: { oauthProvider: 'google', oauthSubject: subject },
        });

        // 2) Otherwise, match existing account by email and bind it
        if (!user && email) {
          user = await User.findOne({ where: { email } });
          if (user) {
            await user.update({ oauthProvider: 'google', oauthSubject: subject });
          }
        }

        // 3) Otherwise create a new account (NO 'password' field)
        if (!user) {
          user = await User.create({
            email,
            firstName: given,
            lastName: family,
            phone: '0000000000',
            role: 'customer',
            status: 'active',
            oauthProvider: 'google',
            oauthSubject: subject,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
