const fs = require('fs')

// Gather everything from current dir and export it
fs.readdirSync(__dirname).filter(file => file !== 'index.json').map(file => {
   module.exports[file.replace('.json', '')] = require(`${__dirname}/${file}`)
})