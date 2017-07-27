const mongodb = require('mongodb');
var exports = {};

exports.saveOrUpdate = function(data, collectionName, callback) {
    
    mongodb.MongoClient.connect(process.env.MONGO_URL, function(err, db) {
  
        if(err) return callback(err);

        var collection = db.collection(collectionName);

        collection.save(data, {_id: data._id}, function(err, result) {
            
            if(err) return callback(err);

            db.close(function (err) {
                if(err) return callback(err);

                return callback(null);
            });

        });
    });

};

module.exports = exports;