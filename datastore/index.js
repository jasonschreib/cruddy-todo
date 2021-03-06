const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      return console.log('Error: Could not get next ID');
    }
    var filepath = path.join(this.dataDir, `${id}.txt`);

    // After gen unique ID, create file path with new ID
    fs.writeFile(filepath, text, err => {
      if (err) {
        return console.log('An error has occurred when creating a file.');
      }
      callback(null, { 
        'id': id,
        'text': text });
    });

  });

};

exports.readAll = (callback) => {
  var readDirectory = new Promise((resolve, reject) => {
    fs.readdir(this.dataDir, function(err, files) {
      if (err) {
        reject('Unable to read file directory');
      }
      resolve(files);
    });
  });
  
  // Promisifiy???? fs.readdir()
  // resolves -> return an array
  return readDirectory
    .then((files) => {
      // set new array of promises by mapping through directory
      let filePromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          // readfile/readone, should return an obj {id, text} per read
          fs.readFile(path.join(this.dataDir, file), 'utf8', (err, data) => {
            if (err) { reject(`File ${file} was not read.`); }
            let newId = file.slice(0, -4);
            resolve({'id': newId, 'text': data});
          });
        });
      });
      return filePromises;
    })
    .then((arrayOfPromises) => { 
      return Promise.all(arrayOfPromises).then((fulfilled) => callback(null, fulfilled));
    });
};

exports.readOne = (id, callback) => {
  let currentFile = path.join(this.dataDir, `${id}.txt`);
  fs.readFile(currentFile, 'utf8', (err, fileData) => {
    if (err) {
      callback(err, `No item with id: ${id}`);
      return;
    }
    let fileObj = {'id': id, 'text': fileData};
    callback(null, fileObj);
    return fileObj.text;
  });
};

exports.update = (id, text, callback) => {
  //create filepath
  let currentFile = path.join(this.dataDir, `${id}.txt`);
  //read file to check if the file exists
  fs.readFile(currentFile, 'utf8', (err, fileData) => {
    //within callback:
    if (err) {
      callback(err, `No file with id: ${id}`);
      return;
    }
    //overwrite the file with the updates
    fs.writeFile(currentFile, text, (err) => {
      if (err) {
        callback(err, 'Couldn\'t write file');
        return;
      }
      callback(null, { 
        'id': id,
        'text': text });
    });
  });
};

exports.delete = (id, callback) => {
  //create file path for the file with id
  let currentFile = path.join(this.dataDir, `${id}.txt`);
  //unlink the file
  fs.unlink(currentFile, (err) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, id);
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
