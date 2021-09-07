module.exports = class Util {
   static getDefaultMethodByKeyword(mdl, keyword) {
      const defaultMethod = mdl.__powercordOriginal_default ?? mdl.default
      return typeof defaultMethod === 'function' ? defaultMethod.toString().includes(keyword) : null
   };
}