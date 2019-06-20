const fs = require('fs');
const path = require('path');

const descriptorsPath = path.join(__dirname, '../labeledDescriptors.json');

module.exports.loadDescriptors = async () => {
  const content = JSON.parse(fs.readFileSync(descriptorsPath));

  // https://github.com/justadudewhohacks/face-api.js/issues/231#issuecomment-469003972
  for (let x = 0; x < content._labeledDescriptors.length; x++) {
    for (let y = 0; y < content._labeledDescriptors[x]._descriptors.length; y++) {
      const results = Object.values(content._labeledDescriptors[x]._descriptors[y]);
      content._labeledDescriptors[x]._descriptors[y] = new Float32Array(results);
    }
  }

  return content;
};

module.exports.saveDescriptors = async (descriptors) => {
  fs.writeFileSync(descriptorsPath, JSON.stringify(descriptors, null, 2));
};
