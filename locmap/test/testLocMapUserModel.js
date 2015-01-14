/*
Copyright (c) 2014-2015 F-Secure
See LICENSE for details
*/
var LocMapUserModel = require('../lib/locMapUserModel');
var helpers = require('../../test_helpers/test_helpers');
var lmHelpers = require('../test_helpers/locMapHelpers');
var locMapRESTAPI = require('../lib/locMapRESTAPI');
var LocMapRestApi = new locMapRESTAPI();
var pendingNotifications = require('../lib/pendingNotifications');
var PendingNotifications = new pendingNotifications();

var AppleNotification = require('../../lib/appleNotificationService');
var GoogleCloudMessagingService = require('../../locmap/lib/locMapGoogleCloudMessagingService');
var apn = new AppleNotification();

var pushedNotifications = [];// data from mocked pushNotification in format: [{token: token, text: text}, {token2: token2, text2: text2}]
var pushedNotificationsGcm = [];

// mock it to verify that we send notifications
AppleNotification.prototype.pushNotification = function(deviceToken, notificationText, _payload) {
    var notif = {
        token: deviceToken,
        text: notificationText
    };
    if (_payload) {
        notif.payload = _payload;
    }
    pushedNotifications.push(notif);
};
GoogleCloudMessagingService.prototype.pushNotification = function(deviceToken, notificationText, _payload) {
    var notif = {
        token: deviceToken,
        text: notificationText
    };
    if (_payload) {
        notif.payload = _payload;
    }
    pushedNotificationsGcm.push(notif);
};


module.exports = {
    setUp: function(callback) {
        pushedNotifications = [];
        pushedNotificationsGcm = [];
        var dbSetup = require('../../lib/dbSetup');
        dbSetup(function() {
            callback();
        });
    },

    notificationUpdatesUserRecentlyUpdatedVisible: function(test) {
        test.expect(7);
        lmHelpers.createLocMapUserApi(test, LocMapRestApi, 'user@example.com.invalid', 'dev1', function(reply, auth) {
            LocMapRestApi.setUserApnToken(reply.id, 'APN', function(apnResult) {
                test.equal(apnResult, 200);
                var user = new LocMapUserModel(reply.id);
                user.getData(function(userData) {
                    test.ok(typeof userData !== 'number');
                    var now = Date.now();
                    user.sendNotLocalizedPushNotification('text', 'payload', false, true, function(res) {
                        test.equal(res, 'OK');
                        user.getData(function(newUserData) {
                            test.ok(typeof newUserData !== 'number');
                            test.equal(user.data.lastInvisibleNotification, 0);
                            test.ok(user.data.lastVisibleNotification >= now, 'User last visible notification time was not marked.');
                            test.done();
                        });
                    });
                });
            });
        });
    },

    notificationUpdatesUserRecentlyUpdatedInvisible: function(test) {
        test.expect(7);
        lmHelpers.createLocMapUserApi(test, LocMapRestApi, 'user@example.com.invalid', 'dev1', function(reply, auth) {
            LocMapRestApi.setUserApnToken(reply.id, 'APN', function(apnResult) {
                test.equal(apnResult, 200);
                var user = new LocMapUserModel(reply.id);
                user.getData(function(userData) {
                    test.ok(typeof userData !== 'number');
                    var now = Date.now();
                    user.sendNotLocalizedPushNotification('text', 'payload', true, true, function(res) {
                        test.equal(res, 'OK');
                        user.getData(function(newUserData) {
                            test.ok(typeof newUserData !== 'number');
                            test.equal(user.data.lastVisibleNotification, 0);
                            test.ok(user.data.lastInvisibleNotification >= now, 'User last invisible notification time was not marked.');
                            test.done();
                        });
                    });
                });
            });
        });
    },

    notificationUpdatesLocalizedUserRecentlyUpdatedVisible: function(test) {
        test.expect(7);
        lmHelpers.createLocMapUserApi(test, LocMapRestApi, 'user@example.com.invalid', 'dev1', function(reply, auth) {
            LocMapRestApi.setUserApnToken(reply.id, 'APN', function(apnResult) {
                test.equal(apnResult, 200);
                var user = new LocMapUserModel(reply.id);
                user.getData(function(userData) {
                    test.ok(typeof userData !== 'number');
                    var now = Date.now();
                    user.sendLocalizedPushNotification('test.DoNotTranslate', function(res) {
                        test.equal(res, 'OK');
                        user.getData(function(newUserData) {
                            test.ok(typeof newUserData !== 'number');
                            test.equal(user.data.lastInvisibleNotification, 0);
                            test.ok(user.data.lastVisibleNotification >= now, 'User last visible notification time was not marked.');
                            test.done();
                        });
                    });
                });
            });
        });
    },

    invisibleNotificationWritesPendingNotification: function(test) {
        test.expect(6);
        lmHelpers.createLocMapUserApi(test, LocMapRestApi, 'user@example.com.invalid', 'dev1', function(reply, auth) {
            LocMapRestApi.setUserApnToken(reply.id, 'APN', function(apnResult) {
                test.equal(apnResult, 200);
                var user = new LocMapUserModel(reply.id);
                user.getData(function(userData) {
                    test.ok(typeof userData !== 'number');
                    var now = Date.now();
                    user.sendNotLocalizedPushNotification('text', 'payload', true, true, function(res) {
                        test.equal(res, 'OK');
                        // Negative timeout makes sure we get even the new items.
                        PendingNotifications.getTimedOutNotifications(-1, function(notifications) {
                            test.equal(notifications.length, 1);
                            test.equal(notifications[0]['userId'], reply.id);
                            test.done();
                        });
                    });
                });
            });
        });
    },

    invisibleNotificationWithoutPendingDoesNotWritePendingNotification: function(test) {
        test.expect(5);
        lmHelpers.createLocMapUserApi(test, LocMapRestApi, 'user@example.com.invalid', 'dev1', function(reply, auth) {
            LocMapRestApi.setUserApnToken(reply.id, 'APN', function(apnResult) {
                test.equal(apnResult, 200);
                var user = new LocMapUserModel(reply.id);
                user.getData(function(userData) {
                    test.ok(typeof userData !== 'number');
                    var now = Date.now();
                    user.sendNotLocalizedPushNotification('text', 'payload', true, false, function(res) {
                        test.equal(res, 'OK');
                        // Negative timeout makes sure we get even the new items.
                        PendingNotifications.getTimedOutNotifications(-1, function(notifications) {
                            test.equal(notifications.length, 0);
                            test.done();
                        });
                    });
                });
            });
        });
    },

    localizedNotificationDoesNotWritePendingNotification: function(test) {
        test.expect(5);
        lmHelpers.createLocMapUserApi(test, LocMapRestApi, 'user@example.com.invalid', 'dev1', function(reply, auth) {
            LocMapRestApi.setUserApnToken(reply.id, 'APN', function(apnResult) {
                test.equal(apnResult, 200);
                var user = new LocMapUserModel(reply.id);
                user.getData(function(userData) {
                    test.ok(typeof userData !== 'number');
                    var now = Date.now();
                    user.sendLocalizedPushNotification('test.DoNotTranslate', function(res) {
                        test.equal(res, 'OK');
                        // Negative timeout makes sure we get even the new items.
                        PendingNotifications.getTimedOutNotifications(-1, function(notifications) {
                            test.equal(notifications.length, 0);
                            test.done();
                        });
                    });
                });
            });
        });
    }

};
