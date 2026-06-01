const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();

const authService = require('../services/auth_service');
const authRepository = require('../repository/auth_repos');

function cookieExtractor(cookieName) {
  return (req) => req?.cookies?.[cookieName] || null;
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor('accessToken'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await authRepository.findById(payload.userId);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  'jwt-refresh',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor('refreshToken')]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await authRepository.findById(payload.userId);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: 'login', passwordField: 'password' },
    async (login, password, done) => {
      try {
        const user = await authService.login({ login, password });
        return done(null, user);
      } catch (err) {
        return done(null, false, { message: err.message || 'Неверный логин или пароль' });
      }
    }
  )
);

module.exports = passport;

