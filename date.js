// module.exports = getDate;  //for only one function

//exports  module to "app.js require"
exports.getDate = function() { //use for multiple function
  let today = new Date();

  //javascript dateformat
  let options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };

  //javascript dateformat
  return today.toLocaleDateString("en-US", options);
}

//exports  module to "app.js require"
exports.getDay = function() {
  let today = new Date();

  //javascript dateformat
  let options = {
    weekday: 'long',
  };

  //javascript dateformat
  return today.toLocaleDateString("en-US", options);
}
