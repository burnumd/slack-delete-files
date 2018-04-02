const inquirer = require('inquirer');

const { deleteFiles, filterFiles, getFiles } = require('./file_operations');

const run = async (token, options) => {
  const deleteOlderThan = Math.floor(new Date().getTime() / 1000) - (options.daysOld * 86400);
  await deleteFiles(token, filterFiles(await getFiles(token, deleteOlderThan), options));
};

inquirer.prompt([
  {
    message: 'Please, enter your Slack token.',
    name: 'token',
    type: 'password',
  }, {
    message: 'How many days old should files be before being deleted (0 means all files will b' +
        'e deleted)?',
    name: 'daysOld',
    type: 'input',
    validate: value => Number.isInteger(parseInt(value, 10)),
    default: 30,
  }, {
    message: 'Keep pinned files?',
    name: 'keepPinned',
    type: 'confirm',
    default: false,
  },
])
  .then(answers => run(answers.token, {
    daysOld: answers.daysOld,
    keepPinned: answers.keepPinned,
  }))
  .catch(error => console.error('Error while asking for token.', error));
