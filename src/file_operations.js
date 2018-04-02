const got = require('got');

const API_URL = 'https://slack.com/api';

const getFiles = async (token, deleteDate) => {
  let response = await got(encodeURI(`${API_URL}/files.list?token=${token}&ts_to=${deleteDate}&count=1000`));
  let responseBody = [];
  response = JSON.parse(response.body);
  if (response.ok) {
    responseBody = response.files;
  } else {
    throw new Error(`Failed to retrieve files.\nError: ${response.error}\nWarning: ${response.warning}\n`);
  }

  return responseBody;
};

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

  return filesToDelete.map(file => file.id);
};

const deleteFiles = async (token, files) => {
  console.log(`Deleting ${files.length} file(s)...`);

  const requests = [];
  files.forEach(file => requests.push(got(encodeURI(`${API_URL}/files.delete?token=${token}&file=${file}`))));

  Promise.all(requests)
    .then(() => console.log(`Deleted ${files.length} files`))
    .catch((error) => {
      throw new Error(`Error while deleting files.\nError: ${error}`); 
    });
};

module.exports = { deleteFiles, filterFiles, getFiles };
