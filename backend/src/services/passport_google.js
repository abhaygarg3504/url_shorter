import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findUserByEmail, createUser } from "../dao/user_dao.js";
import { findUserById } from "../dao/user_dao.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL.replace(/\/$/, "")}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await findUserByEmail(email);

        if (!user) {
          const name = profile.displayName;
          const avatar = profile.photos?.[0]?.value;
          user = await createUser(name, email, "google-oauth", avatar);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await findUserById(id);
  done(null, user);
});
