const mongodb = require('mongodb');
const logger = require('heroku-logger')

var exports = {};

exports.saveOrUpdate = function(data, collectionName, callback) {
    logger.info('[mongoConnection] Save/update informations on collection=' + collectionName);
    getConnection(function(error, db) {
        if(error) return callback(error);
        const collection = db.collection(collectionName);
        collection.save(data, {_id: data._id}, function(error, result) {
            if(error) {
                logger.error('[mongoConnection] Error to save collection=' + collectionName, {'error': error});
                return callback(error);
            }
            closeConnection(db);
            logger.info('[mongoConnection] Save/update success');
            return callback(null);
        });
    });
};

exports.find = function(query, collectionName, callback) {
    logger.info('[mongoConnection] Retrieve informations on collection=' + collectionName + ', query=' + JSON.stringify(query));
    getConnection(function(error, db) {
        if(error) return callback(error);
        const collection = db.collection(collectionName);
        collection.find(query).toArray(function(error, docs) {
            if(error) {
                logger.error('[mongoConnection] Error to retrieve collection=' + collectionName, {'error': error});
                return callback(error);
            }
            closeConnection(db);
            logger.info('[mongoConnection] Retrieve success');
            return callback(null, docs);
        });
    });  
};

function getConnection(callback) {
    return mongodb.MongoClient.connect(process.env.MONGO_URL, function(error, db) {
        if(error) {
            logger.error('[mongoConnection] Error to get connection on mongodb', {'error': error});
        }
        callback(error, db);
    });
}

function closeConnection(db) {
    db.close(function (error) {
        if(error) {
            logger.warn('[mongoConnection] Error to close connection on mongodb ', {'error': error});
        }
    });
}

module.exports = exports;