const mongodb = require('mongodb');
const logger = require('heroku-logger')

var exports = {};

exports.saveOrUpdate = function(data, collectionName, callback) {
    logger.info('[mongoConnection] Save/update informations on collection=' + collectionName);
    getConnection(function(err, db) {
        if(err) return callback(err);
        const collection = db.collection(collectionName);
        collection.save(data, {_id: data._id}, function(err, result) {
            if(err) {
                logger.log('[mongoConnection] Error to save collection=' + collectionName);
                return callback(err);
            }
            closeConnection(db);
            logger.info('[mongoConnection] Save/update success');
            return callback(null);
        });
    });
};

exports.find = function(query, collectionName, callback) {
    logger.info('[mongoConnection] Retrieve informations on collection=' + collectionName + ', query=' + JSON.stringify(query));
    getConnection(function(err, db) {
        if(err) return callback(err);
        const collection = db.collection(collectionName);
        collection.find(query).toArray(function(err, docs) {
            if(err) {
                logger.error('[mongoConnection] Error to retrieve collection=' + collectionName, err);
                return callback(err);
            }
            closeConnection(db);
            logger.info('[mongoConnection] Retrieve success');
            return callback(null, docs);
        });
    });  
};

function getConnection(callback) {
    return mongodb.MongoClient.connect(process.env.MONGO_URL, function(err, db) {
        if(err) {
            logger.error('[mongoConnection] Error to get connection on mongodb', err);
        }
        callback(err, db);
    });
}

function closeConnection(db) {
    db.close(function (err) {
        if(err) {
            logger.warn('[mongoConnection] Error to close connection on mongodb ', err);
        }
    });
}

module.exports = exports;