const mongodb = require('mongodb');
var exports = {};

exports.saveOrUpdate = function(data, collectionName, callback) {
    
    getConnection(function(err, db) {
  
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

exports.find = function(query, collectionName, callback) {
    getConnection(function(err, db) {
        if(err) return callback(err);

        var collection = db.collection(collectionName);

        collection.find(query).toArray(function(err, docs) {

            if(err) return callback(err);

            db.close(function (err) {
                if(err) return callback(err);

                return callback(null, docs);
            });
        });
    });  
};

function getConnection(callback) {
    return mongodb.MongoClient.connect(process.env.MONGO_URL, callback);
}

module.exports = exports;