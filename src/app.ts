/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' })

if(process.env.NODE_ENVR === 'production') {
  require('newrelic');
}

/**
 * Module dependencies.
 */
import * as chalk from 'chalk';
import * as timeout from 'connect-timeout'; // Express v4
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as http from 'http';
import * as httpLogs from 'morgan';
import * as xss from 'xss-clean';

import { sequelize } from './config/database';
import { routes } from './routes/routes';
import { errorHandler } from './utils';

/**
 * Authenticate database connection
 */
sequelize.authenticate()
  // tslint:disable-next-line: no-console
  .then((): void => console.log('%s Database connected successfully!', chalk.green('✓')))
  // tslint:disable-next-line: no-any
  .catch((error: any): void => {
    console.error('Database authenticaion error...');
    console.log(error, 'something went wrong');
    process.exit();
  });

/**
 * Create Express server.
 */
const app: express.Express = express();

/**
 * Timeout confg
 */
app.use(timeout('12000000'));
app.use(haltOnTimedout);

function haltOnTimedout(req: express.Request, _res: express.Response, next: express.NextFunction): void {
  if (!req.timedout) { next(); }
}

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || 8081);
app.set('env', process.env.NODE_ENVR || 'development');
app.use(httpLogs('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(xss());
/**
 * CORS enable
 */
app.use(cors());

function logResponseTime(req, res, next) {
  res.locals.receptionTime = process.hrtime()
  next();
}

app.use(logResponseTime);

/**
 * Routes.
 */
app.use('/api', routes);

/**
 * Error Handler.
 */
app.use(errorHandler);

export const server: http.Server = http.createServer(app);
/**
 * Start Express server.
 */

server.listen(app.get('port'), (): void => {
  // tslint:disable-next-line: no-console
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  // tslint:disable-next-line: no-console
  console.log('  Press CTRL-C to stop\n');
});
