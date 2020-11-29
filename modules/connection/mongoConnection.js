const mongodb = require('mongodb');
const logger = require('heroku-logger')

const logName = '[MongoConnection] ';

exports.saveOrUpdate = function(logPrefix, data, collectionName, callback) {
    logger.info(logPrefix + logName + ' Save/update informations on collection=' + collectionName);
    getConnection(logPrefix, function(error, db, client) {
        if(error) return callback(error);
        const collection = db.collection(collectionName);
        collection.save(data, {_id: data._id}, function(error, result) {
            if(error) {
                logger.error(logPrefix + logName + ' Error to save collection=' + collectionName, {'error': error});
                return callback(error);
            }
            closeConnection(client);
            logger.info(logPrefix + logName + ' Save/update success');
            return callback(null, result);
        });
    });
};

exports.find = function(logPrefix, query, collectionName, callback) {
    logger.info(logPrefix + logName + ' Retrieve informations on collection=' + collectionName + ', query=' + JSON.stringify(query));
    getConnection(logPrefix, function(error, db, client) {
        if(error) return callback(error);
        const collection = db.collection(collectionName);
        collection.find(query).toArray(function(error, docs) {
            if(error) {
                console.log(error);
                logger.error(logPrefix + logName + ' Error to retrieve collection=' + collectionName, {'error': error});
                return callback(error);
            }
            closeConnection(client);
            logger.info(logPrefix + logName + ' Retrieve success');
            return callback(null, docs);
        });
    });
};

exports.findGroup = function(logPrefix, key, query, initial, collectionName, callback) {
    logger.info(logPrefix + logName + ' Retrieve informations on collection=' + collectionName + ', query=' + JSON.stringify(query));
    getConnection(logPrefix, function(error, db, client) {
        if(error) return callback(error);
        const collection = db.collection(collectionName);

        // collection.group(
        //     key, 
        //     query, 
        //     initial, 
        //     "function (obj, prev) { prev.count++;}", 
        //     function(err, results) {
        //         console.log('results', results);
        //         if(err) {
        //             console.log('erro aqui', err);
        //             logger.error(logPrefix + logName + ' Error to retrieve collection=' + collectionName, {'error': error});
        //             return callback(error);
        //         }
        //         //closeConnection(client);
        //         logger.info(logPrefix + logName + ' Retrieve success');
        //         //return callback(null, results);
        //     });

        collection.find(query).toArray(function(err, docs) {
           
            if(err) {
                console.log('erro aqui', err);
                logger.error(logPrefix + logName + ' Error to retrieve collection=' + collectionName, {'error': error});
                return callback(error);
            }
            const results = [];
            docs.forEach(item => {
                //console.log(item['type'])
                const found = results.find(i => i.type === item['type']);
                if (found) {
                    found.count = found.count + 1;
                } else {
                    results.push({
                        type: item['type'],
                        count: 1,
                    });
                }
            });

            console.log('results', results);

            closeConnection(client);
            logger.info(logPrefix + logName + ' Retrieve success');
            callback(null, results);
        });
    });
};

exports.delete = function(logPrefix, query, collectionName, callback) {
    logger.info(logPrefix + logName + ' Delete on collection=' + collectionName + ', query=' + JSON.stringify(query));
    getConnection(logPrefix, function(error, db, client) {
        if(error) return callback(error);
        const collection = db.collection(collectionName);
        collection.deleteOne(query, function(error, result) {
            if(error) {
                logger.error(logPrefix + logName + ' Error to delete on collection=' + collectionName, {'error': error});
                return callback(error);
            }
            closeConnection(client);
            logger.info(logPrefix + logName + ' Delete success');
            return callback(null, result);
        });
    });
};

function getConnection(logPrefix, callback) {
    if (!process.env.MONGO_URL) {
        return callback('Not MONGO_URL configured', null);
    }
    return mongodb.MongoClient.connect(process.env.MONGO_URL, function(error, client) {
        if(error) {
            logger.error(logPrefix + logName + ' Error to get connection on mongodb', {'error': error});
        }
        const db = client.db('test');
        callback(error, db, client);
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