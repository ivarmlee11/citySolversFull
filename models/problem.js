'use strict';
module.exports = function(sequelize, DataTypes) {
  var problem = sequelize.define('problem', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
    locationName: DataTypes.STRING,
    picture: DataTypes.STRING,
    typeId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return problem;
};