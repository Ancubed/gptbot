const path = require('path');
const fs = require('fs');

function fulltrim (text) {
    return text.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
};

const getRandomInt = () => {
    return Math.floor(Math.random() * 100);
}

function generateFilePath() {
    const fileName = `${Date.now()}-${getRandomInt()}.wav`;
    return path.join(__dirname, 'tmp', fileName);
}

function clearTmp() {
    const directory = path.join(__dirname, 'tmp');
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) throw err;
            console.log('success removed all files');
          });
        }
      });
}

module.exports = { fulltrim, getRandomInt, generateFilePath, clearTmp }