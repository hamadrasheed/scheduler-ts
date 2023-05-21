const shell = require('shelljs');
const { exec } = require('child_process');

shell.cp('-R', 'src/config/codes.json', 'build/');
shell.cp('-R', 'package.json', 'build/');
shell.cp('-R', 'schedular.config.js', 'build/');
shell.cp('-R', 'newrelic.js', 'build/');

exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
    console.log('stdout.trim()',stdout.trim());
    if (typeof stdout === 'string' && (stdout.trim() !== 'prod')) {
        shell.cp('-R', 'autodeploy/after_install.sh', 'build/');
        shell.cp('-R', 'autodeploy/application_start.sh', 'build/');
        shell.cp('-R', 'autodeploy/appspec.yml', 'build/');
        shell.cp('-R', 'autodeploy/before_install.sh', 'build/');
        shell.cp('-R', 'autodeploy/bitbucket-pipelines.yml', 'build/');
        shell.cp('-R', 'autodeploy/validate.sh', 'build/');
        shell.cp('-R', 'autodeploy/update_env.sh', 'build/');
    }

});
