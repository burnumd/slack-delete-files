const got = require('got');

const API_URL = 'https://slack.com/api';

export const getFiles = (token, deleteDate) => got(`${API_URL}/files.list`, {
  body: {
    token,
    ts_to: deleteDate,
    count: 1000,
  },
  json: true,
});

export const filterFiles = (files, options) => {
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

export const deleteFiles = (token, files) => {
  console.log(`Deleting ${files.length} file(s)...`);

  files.forEach(file => got(`${API_URL}/files.delete`, {
    body: {
      token,
      file: file.id
    }
  }).then(() => console.log(`${file.name} was deleted.`)).catch(error => console.error('Error while deleting files.', error)));
};