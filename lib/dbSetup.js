/*
Copyright (c) 2014-2015 F-Secure
See LICENSE for details
*/
var db = require('../lib/db');
var inProduction = process.env.PORT || false;

/*
 Prepare DB with fake data for the tests.
 */
var dbSetup = function(callback) {
    // User data
    var userName = 'Test User';
    var userLocation = '{"time":' + Date.now() + ',"lat":"24.111","lon":"12.444","acc":"100"}';
    var userPlaces = '[\"Home\"]';
    var userFamily = 'family:Miguel';
    var userFriends = '[\"otherUser\"]';
    var userIcon = '';
    var userBattery = '26';

    // Family data
    var familyName = "Miguel's Family";
    var familyPlaces = '{"TestPlace":{"type": "factory", "name": "TestPlace", "lat":12.23,"lon":64.12,"radius":100}}';
    var familymembers = '["Miguel","testUser"]';

    // Detect if we are in Production
    if (inProduction) {
        console.log("dbSetup SHOULDN\'T BE USED IN PRODUCTION!!!");
        process.exit();
    }
    else {
        // Clean DB (carefull in production)
        db.flushall(function(error, result) {
            if (!error) {
                // Push data to Redis and wait for callback
                db.hmset('users:testUser', 'userId', 'testUser', 'name', userName, 'location', userLocation, 'places', userPlaces, 'friends', userFriends,
                    'family', userFamily, 'icon', userIcon, 'battery', userBattery,
                    function(error, result) {
                        db.hmset('families:' + userFamily, 'familyId', userFamily, 'name', familyName, 'allPlaces', familyPlaces, 'members', familymembers, 'invitedMembers', [],
                            function(error, result) {
                                //console.log('DB is ready.\n');
                                //if (callback) callback();
                                db.hmset('users:Miguel', 'userId', 'Miguel', 'name', 'Miguel R.', 'location', userLocation, 'places', userPlaces, 'friends', userFriends,
                                    'family', userFamily, 'icon', userIcon, 'battery', 25,
                                    function(error, result) {
                                        if (callback) callback();
                                    });
                            }
                        );
                    });
            } else {
                console.log(error);
            }
        });
    }
};

// Exports function dbSetup on module level, so require(dbSetup.js) will expose it directly
module.exports = dbSetup;
