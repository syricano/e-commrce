import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const sub = profile.id;

      // Prefer linking by provider+subject. Fallback: existing email.
      let user = await User.findOne({ where: { oauthProvider: 'google', oauthSubject: sub } });
      if (!user && email) {
        user = await User.findOne({ where: { email } });
      }
      if (!user) {
        user = await User.create({
          email: email || `google_${sub}@example.invalid`,
          firstName: profile.name?.givenName || 'Google',
          lastName: profile.name?.familyName || 'User',
          role: 'customer',
          status: 'active',
          oauthProvider: 'google',
          oauthSubject: sub
        });
      } else if (!user.oauthProvider || !user.oauthSubject) {
        await user.update({ oauthProvider: 'google', oauthSubject: sub });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

export default passport;
