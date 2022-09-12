const fs = require('fs');
const glob = require('glob');
const yaml = require('js-yaml');
const contrast = require("get-contrast");
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const testFolder = './schemes/';
const ratio = 3;
const colorsToCheck = [
  'base03',
  'base08',
  'base09',
  'base0A',
  'base0A',
  'base0B',
  'base0C',
  'base0D',
  'base0E',
  'base0F'
]

const getYamlFiles = (src, callback) => glob(src + '/**/*.yaml', callback);

getYamlFiles(testFolder, (err, files) => {
  if (err) {
    console.log('Error', err);
    return
  }
  files.map(file => {
    try {
      const scheme = yaml.load(fs.readFileSync(file, 'utf8'));
      checkScheme(file, scheme);
    } catch (e) {
      console.log(e);
    }
  })
});

const checkColors = (scheme) => {
  const isLightTheme = contrast.ratio(`#${scheme.base00}`, `#fff`) < 5;
  const bgFromArgs = isLightTheme ? argv.lightBg : argv.darkBg
  const bgToCheck = bgFromArgs || scheme.base00
  const errors = [];
  colorsToCheck.forEach(colorKey => {
    const colorRatio = contrast.ratio(`#${bgToCheck}`, `#${scheme[colorKey]}`);
    if (colorRatio < ratio) {
      errors.push(`ratio: ${colorRatio.toFixed(2)} - color ${colorKey}(#${scheme[colorKey]}) vs background #${bgToCheck}`);
    }
  });
  return errors
};

const checkScheme = (filename, scheme) => {
  const errors = checkColors(scheme)
  if (errors.length) {
    process.stdout.write(`${filename}\n`)
    process.stdout.write(`${errors.join('\n')}`)
    process.stdout.write('\n\n');
  }
};
