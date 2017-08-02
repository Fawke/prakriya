const FileModel = require('../../models/files.js');
const logger = require('./../../applogger');

let addFile = function (fileObj, successCB, errorCB) {
	let saveFile = new FileModel(fileObj);
	saveFile.save(fileObj, function (err, result) {
		if(err) {
			errorCB(err);
		}
		successCB(result);
	});
};

let getFileById = function (fileId, successCB, errorCB) {
	FileModel.findOne({fileId: fileId}, function (err, fileObj) {
		if(err) {
			errorCB(err);
		}
		successCB(fileObj);
	});
};

let updateFileStatus = function (fileObj) {
	fileObj.completedOn = Date.now();
	fileObj.status = 'completed';
	FileModel.update({fileId: fileObj.fileId}, fileObj, function (err, status) {
		if(err) {
			logger.error(err);
		}
		logger.debug(status);
	});
};

module.exports = {
	addFile: addFile,
	getFileById: getFileById,
	updateFileStatus: updateFileStatus
};
