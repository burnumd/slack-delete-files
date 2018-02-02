#!/usr/bin/env node

const got = require('got');
const inquirer = require('inquirer');

const API_URL = 'https://slack.com/api';

const filterFiles = (files, options) => {
  if (!files) {
    console.warn(`There are no files to be deleted. Either there were no files older than ${options.daysOld} or there is something wrong with your token.`);
    return [];
  }

  const removePinned = fileList => fileList.filter(file => !file.pinned_to);
  const filesToDelete = options.keepPinned
    ? removePinned(files)
    : files;

  if (!filesToDelete.length) {
    console.warn('There are no files to be deleted.');
  }

  return filesToDelete;
};

const deleteFiles = (token, files) => {
  console.log(`Deleting ${files.length} file(s)...`);

  files.forEach(file => got(`${API_URL}/files.delete`, {
    body: {
      token,
      file: file.id,
    },
  }).then(() => console.log(`${file.name} was deleted.`)).catch(error => console.error('Error while deleting files.', error)));
};

const run = (token, options) => {
  const deleteOlderThan = Math.floor(new Date().getTime() / 1000) - (options.daysOld * 86400);

  got(`${API_URL}/files.list`, {
    body: {
      token,
      ts_to: deleteOlderThan,
      count: 1000,
    },
    json: true,
  })
    .then(response => filterFiles(response.body.files, options))
    .then(files => deleteFiles(token, files))
    .catch(console.error);
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
