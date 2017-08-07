const crypto = require('crypto');
const UserModel = require('../../models/users.js');
const RoleModel = require('../../models/roles.js');
const AccessControlModel = require('../../models/accesscontrols.js');
let CONFIG = require('../../config');
const logger = require('./../../applogger');

let getUsers = function (successCB, errorCB) {
	UserModel.find({role: {$nin: ['admin', 'candidate']}}, function (err, result) {
		if (err) {
			errorCB(err);
		}
		successCB(result);
	});
};

let addUser = function (userObj, successCB, errorCB) {

	const cipher = crypto.createCipher(CONFIG.CRYPTO.ALGORITHM, CONFIG.CRYPTO.PASSWORD);
  let encrypted = cipher.update(userObj.password, 'utf8', 'hex');
  encrypted = cipher.final('hex');

  userObj.password = encrypted;
	userObj.actions = ['login'];
	let saveUser = new UserModel(userObj);
	saveUser.save(userObj, function (err, result) {
		if(err) {
			console.log(err);
			errorCB(err);
		}
		successCB(result);
	});
};

let deleteUser = function (userObj, successCB, errorCB) {
	UserModel
		.find(userObj)
		.remove(function (err, status) {
			if(err) {
				errorCB(err);
			}
			successCB(status);
		});
};

let updateUser = function (userObj, successCB, errorCB) {
	logger.debug('User obj from server', userObj);
	logger.debug(userObj.username);
	UserModel.update({username: userObj.username}, userObj, function (err, status) {
		if(err) {
			errorCB(err);
		}
		successCB(status);
	});
};

let lockUser = function (userObj, successCB, errorCB) {
	logger.debug('User obj from server', userObj);
	logger.debug(userObj.username);
	UserModel.update(
		{username: userObj.username},
		{$pull: {actions: 'login'}},
		function (err, status) {
			if(err) {
			errorCB(err);
		}
			successCB(status);
		}
	);
};

let unlockUser = function (userObj, successCB, errorCB) {
	logger.debug('User obj from server', userObj);
	logger.debug(userObj.username);
	UserModel.update(
		{username: userObj.username},
		{$push: {actions: 'login'}},
		function (err, status) {
			if(err) {
			errorCB(err);
		}
			successCB(status);
		}
	);
};

let getRoles = function (successCB, errorCB) {
	RoleModel.find({name: {$ne: 'admin'}}, function (err, result) {
		if (err) {
			errorCB(err);
		}
		successCB(result);
	});
};

let addRole = function (roleObj, successCB, errorCB) {
	let saveRole = new RoleModel(roleObj);
	saveRole.save(roleObj, function (err, result) {
		if(err) {
			errorCB(err);
		}
		successCB(result);
	});
};

let updateRole = function (roleObj, successCB, errorCB) {
	logger.debug('Role obj in Mongo', roleObj);
	logger.debug(roleObj.name);
	roleObj.lastModified = new Date();
	RoleModel.update({name: roleObj.name}, roleObj, function (err, status) {
		if(err) {
			errorCB(err);
		}
		successCB(status);
	});
};

let deleteRole = function (roleObj, successCB, errorCB) {
	RoleModel
		.find(roleObj)
		.remove(function (err, status) {
			if(err) {
			errorCB(err);
		}
			successCB(status);
		});
};

let getAccessControls = function (successCB, errorCB) {
	AccessControlModel.find({}, function (err, result) {
		if (err) {
			errorCB(err);
		}
		successCB(result);
	});
};

module.exports = {
	getUsers: getUsers,
	getRoles: getRoles,
	getAccessControls: getAccessControls,
	addUser: addUser,
	addRole: addRole,
	updateRole: updateRole,
	deleteRole: deleteRole,
	deleteUser: deleteUser,
	updateUser: updateUser,
	lockUser: lockUser,
	unlockUser: unlockUser
};
