import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "./mongoose/models/User"

const USING_PASSPORT = !!process.env.GOOGLE_OAUTH_CLIENT_ID

if (USING_PASSPORT && !passport._strategy("google")) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        callbackURL: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id })
          if (!user) {
            user = new User({
              googleId: profile.id,
              email: profile.emails[0].value,
            })
            await user.save()
          }
          done(null, user)
        } catch (err) {
          done(err, null)
        }
      },
    ),
  )
}

export default passport
