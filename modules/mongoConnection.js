const mongodb = require('mongodb');
const logger = require('heroku-logger')

const logName = '[MongoConnection] ';

var exports = {};

exports.saveOrUpdate = function(logPrefix, data, collectionName, callback) {
    logger.info(logPrefix + logName + ' Save/update informations on collection=' + collectionName);
    getConnection(logPrefix, function(error, db) {
        if(error) return callback(error);
        const collection = db.collection(collectionName);
        collection.save(data, {_id: data._id}, function(error, result) {
            if(error) {
                logger.error(logPrefix + logName + ' Error to save collection=' + collectionName, {'error': error});
                return callback(error);
            }
            closeConnection(db);
            logger.info(logPrefix + logName + ' Save/update success');
            return callback(null);
        });
    });
};

exports.find = function(logPrefix, query, collectionName, callback) {
    logger.info(logPrefix + logName + ' Retrieve informations on collection=' + collectionName + ', query=' + JSON.stringify(query));
    getConnection(logPrefix, function(error, db) {
        if(error) return callback(error);
        const collection = db.collection(collectionName);
        collection.find(query).toArray(function(error, docs) {
            if(error) {
                logger.error(logPrefix + logName + ' Error to retrieve collection=' + collectionName, {'error': error});
                return callback(error);
            }
            closeConnection(db);
            logger.info(logPrefix + logName + ' Retrieve success');
            return callback(null, docs);
        });
    });  
};

function getConnection(logPrefix, callback) {
    return mongodb.MongoClient.connect(process.env.MONGO_URL, function(error, db) {
        if(error) {
            logger.error(logPrefix + logName + ' Error to get connection on mongodb', {'error': error});
        }
        callback(error, db);
    });
}

function closeConnection(db) {
    db.close(function (error) {
        if(error) {
            logger.warn(logName + ' Error to close connection on mongodb ', {'error': error});
        }
    });
}

module.exports = exports;