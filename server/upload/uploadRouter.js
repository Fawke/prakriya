const router = require('express').Router();
const formidable = require('formidable');
const fs = require('fs');
const logger = require('./../../applogger');
const client = require('redis').createClient();
const uploadMongoController = require('./uploadMongoController');
const dashboardNeo4jController = require('../dashboard/dashboardNeo4jController');
let auth = require('../auth')();
let CONFIG = require('../../config');

// Adding the cadets for the mentor connect
router.post('/cadets', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
	let form = new formidable.IncomingForm();
	form.parse(req, function (err1, fields, files) {
		fs.readFile(files.file.path, 'utf8', (err2, data) => {
			try {
				let fileObj = {};
				fileObj.fileId = files.file.name.replace(/\s/g, '') + Date.now();
				fileObj.data = data;
				fileObj.fileName = files.file.name;
				fileObj.submittedOn = Date.now();
				fileObj.status = 'processing';
				fileObj.addedBy = req.user.name;
				logger.debug('FileObj created', fileObj);
				uploadMongoController.addFile(fileObj, function (file) {
					client.rpush('fileImport', file.fileId);
					res.status(200).json(file);
				}, function (err3) {
					logger.error(err3);
					res.status(500).json({error: 'Cannot add file in db...!'});
				});
			} catch(err4) {
				res.status(500).json({
				error: 'Internal error occurred, please report...!'
				});
			}
		});
	});
});

// Adding remarks in bulk
router.post('/remarks', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
	let form = new formidable.IncomingForm();
	form.parse(req, function (err1, fields, files) {
		fs.readFile(files.file.path, 'utf8', (err2, data) => {
			try {
				let lines = data.split('\n');
				let headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
				let cadetColln = [];
				lines.map(function (line, index) {
					if(index > 0 && line !== '') {
						let lineCol = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
						let cadetObj = {};
						headers.map(function (head, key) {
							if(key > 0) {
								if(lineCol[key] !== '') {
									cadetObj[head] = lineCol[key];
								}
							}
						});
						cadetColln.push(cadetObj);
					}
				});
				dashboardNeo4jController.updateCadets(cadetColln, function (status) {
		      res.status(200).json(status);
		    }, function (err) {
		      logger.error('Update Cadets Error: ', err);
		      res.status(500).json({error: 'Cannot update candidates in neo4j...!'});
		    });
			} catch(err4) {
				logger.error('Error', err4);
				res.status(500).json({
					error: 'Internal error occurred, please report...!'
				});
			}
		});
	});
});

// Merging two files
router.post('/merge', auth.accessedBy(['BULK_UPLOAD']), function (req, res) {
	let form = new formidable.IncomingForm();
	let file_type = req.query.file;
	form.parse(req, function (err1, fields, files) {

		fs.readFile(files.report.path, 'utf8', (err2, report_data) => {
			fs.readFile(files.src.path, 'utf8', (err2, src_data) => {
				try {

					let result = [];

					let report_lines = report_data.split('\n');
					let src_lines = src_data.split('\n');
					let report_headers = report_lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
					let src_headers = src_lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

					report_lines.map(function (line, index) {
						if(index > 0 && line !== '') {
							let lineCol = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
							let cadetObj = {};

							report_headers.map(function (head, key) {
								if(lineCol[key] !== '') {
									cadetObj[head] = lineCol[key];
								}
							});

							let eid_index = ''
							if(file_type == 'ZCOP') {
								eid_index = src_headers.indexOf('EMP_CODE');
							}
							else if(file_type == 'ERD') {
								eid_index = src_headers.indexOf('EMP_NO');
							}
							else if(file_type == 'Digi-Thon') {
								// Don't have the Digi-Thon file for the reference
							}

							src_lines.map(function (line2, index2) {
								if(index2 > 0 && line2 !== '') {
									let lineCol2 = line2.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
									let cadetObj2 = {};

									if(lineCol2[eid_index] == cadetObj['Employee ID']) {
										src_headers.map(function (head2, key2) {
											if(lineCol2[key2] !== '') {
												cadetObj2[head2] = lineCol2[key2];
											}
										})
										if(file_type == 'ZCOP') {
											cadetObj['Email ID'] = cadetObj2['EMPLOYEE_EMAIL_ID'];
											cadetObj['Billability'] = cadetObj2['BILLABILITY_STATUS'];
											cadetObj['Career Band'] = cadetObj2['CAREER_BAND'];
											if(cadetObj2.MODEL_TYPE == 'A' || cadetObj2.MODEL_TYPE == 'C') {
												cadetObj['Revised BU'] = cadetObj2.SAP_PRAC_DESC;
											}
											else if(cadetObj2.MODEL_TYPE == 'B' || cadetObj2.MODEL_TYPE == 'N' || cadetObj2.MODEL_TYPE == 'R') {
												cadetObj['Revised BU'] = cadetObj2.SAP_BU_DESC
											}
											cadetObj['Work Experience'] = cadetObj2['EXPERIENCE'];
											cadetObj['Home / Prac CC'] = cadetObj2['PRAC_CC'];
											cadetObj['Cost Center'] = cadetObj2['COSTCTR'];
											cadetObj['Primary Supervisor'] = cadetObj2['PRIMARY_SUPERVISOR'];
											cadetObj['Project Supervisor'] = cadetObj2['PROJECT_SUPERVISOR'];
											cadetObj['Intern  Reporting Location'] = cadetObj2['DERIVED_EMP_CITY'];
											cadetObj['DOJ'] = cadetObj2['DATE_OF_JOINING'];
											cadetObj['Model'] = cadetObj2['MODEL_TYPE'];
											cadetObj['Updated Suite ID'] = cadetObj2['DERIVED_SUITE_ID'];
											cadetObj['Updated Skill'] = cadetObj2['DERIVED_SUITE_NAME'];
											result.push(cadetObj);
										}
										else if(file_type == 'ERD') {
											cadetObj['Future / Current - Billability'] = cadetObj2['PROJECT'];
											cadetObj['Future BD'] = cadetObj2['ASSIGN_START'];
											cadetObj['Project End date'] = cadetObj2['ASSIGN_END'];
										}
										if(index == report_lines.length-2) {
											res.status(200).json(result);
										}
									}
								}
							})
						}
					});
				} catch(err) {
					logger.error('Error', err);
					res.status(500).json({
						error: 'Internal error occurred, please report...!'
					});
				}
			});
		});








	// 	fs.readFile(files.zcop.path, 'utf8', (err2, zcop_data) => {
	// 		fs.readFile(files.erd.path, 'utf8', (err2, erd_data) => {
	// 			try {
	// 				let result = [];

	// 				let zcop_lines = zcop_data.split('\n');
	// 				let erd_lines = erd_data.split('\n');
	// 				let zcop_headers = zcop_lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	// 				let erd_headers = erd_lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	// 				zcop_lines.map(function (line, index) {
	// 					if(index > 0 && line !== '') {
	// 						let lineCol = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	// 						let cadetObj = {};

	// 						zcop_headers.map(function (head, key) {
	// 							if(lineCol[key] !== '') {
	// 								cadetObj[head] = lineCol[key];
	// 							}
	// 						});

	// 						let emp_key, proj_key, start_key, end_key;

	// 						erd_headers.map(function(head2, key2) {
	// 							switch (head2) {
	// 								case 'EMP_NO':
	// 									emp_key = key2;
	// 									break;
	// 								case 'PROJECT':
	// 									proj_key = key2;
	// 									break;
	// 								case 'ASSIGN_START':
	// 									start_key = key2;
	// 									break;
	// 								case 'ASSIGN_END':
	// 									end_key = key2;
	// 									break;
	// 							}
	// 						})
	// 						erd_lines.map(function (line2, index2) {
	// 							if(index2 > 0 && line2 !== '') {
	// 								let lineCol2 = line2.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	// 								if(lineCol2[emp_key] == cadetObj['EMP_CODE']) {
	// 									cadetObj['PROJECT'] = lineCol2[proj_key];
	// 									cadetObj['ASSIGN_START'] = lineCol2[start_key];
	// 									cadetObj['ASSIGN_END'] = lineCol2[end_key];
	// 								}
	// 							}
	// 						})

	// 						let obj = {};

	// 						obj['Employee ID'] = cadetObj['EMP_CODE'];
	// 						obj['Employee Name'] = cadetObj['EMP_NAME'];
	// 						obj['Email ID'] = cadetObj['EMPLOYEE_EMAIL_ID'];
	// 						obj['Digi-thon Qualified'] = '';
	// 						obj['WT/WI'] = '';
	// 						obj['Billability'] = cadetObj['BILLABILITY_STATUS'];
	// 						obj['Career Band'] = cadetObj['CAREER_BAND'];
	// 						obj['Initial BU'] = ''
	// 						if(cadetObj.MODEL_TYPE == 'A' || cadetObj.MODEL_TYPE == 'C') {
	// 							obj['Revised BU'] = cadetObj.SAP_PRAC_DESC;
	// 						}
	// 						else if(cadetObj.MODEL_TYPE == 'B' || cadetObj.MODEL_TYPE == 'N' || cadetObj.MODEL_TYPE == 'R') {
	// 							obj['Revised BU'] = cadetObj.SAP_BU_DESC
	// 						}
	// 						obj['Work Experience'] = cadetObj['EXPERIENCE'];
	// 						obj['Digi-Thon Phase'] = '';
	// 						obj['Digi-thon Score'] = '';
	// 						obj['Training Status'] = '';
	// 						obj['Training Track'] = '';
	// 						obj['Wave'] = '';
	// 						obj['Start Date'] = '';
	// 						obj['End Date'] = '';
	// 						obj['Academy Training Skills'] = '';
	// 						obj['Skill - Set'] = '';
	// 						obj['Cadet Evaluation'] = '';
	// 						obj['Plan for Available Pool'] = '';
	// 						obj['Comments / Current / Future Plan'] = '';
	// 						obj['Project Status'] = '';
	// 						obj['Project - Billability'] = '';
	// 						obj['Remarks / Account Name'] = '';
	// 						obj['Project Name'] = '';
	// 						obj['sap'] = '';
	// 						obj['Future Billability'] = cadetObj['PROJECT'];
	// 						obj['Future BD'] = cadetObj['ASSIGN_START'];
	// 						obj['Project End date'] = cadetObj['ASSIGN_END'];
	// 						obj['Chk'] = '';
	// 						obj['Leadership Report'] = '';
	// 						obj['Resignation Reason'] = '';
	// 						obj['Pledge'] = '';
	// 						obj['Preferred Location 1'] = '';
	// 						obj['Preferred Location 2'] = '';
	// 						obj['Preferred Location 3'] = '';
	// 						obj['PRP Score'] = '';
	// 						obj['Home / Prac CC'] = cadetObj['PRAC_CC'];
	// 						obj['Cost Center'] = cadetObj['COSTCTR'];
	// 						obj['Primary Supervisor'] = cadetObj['PRIMARY_SUPERVISOR'];
	// 						obj['Project Supervisor'] = cadetObj['PROJECT_SUPERVISOR'];
	// 						obj['EM'] = '';
	// 						obj['Reported'] = '';
	// 						obj['Mentor Meet'] = '';
	// 						obj['Interns / FEP'] = '';
	// 						obj['FEP_ZCOP'] = '';
	// 						obj['FEP Tagging'] = '';
	// 						obj['FEP Reason'] = '';
	// 						obj['FEP Reason'] = '';
	// 						obj['FEP Reason'] = '';
	// 						obj['FEP Start Date'] = '';
	// 						obj['FEP End Date'] = '';
	// 						obj['Intern  Reporting Location'] = cadetObj['LOCATION'];
	// 						obj['college'] = '';
	// 						obj['CGPA'] = '';
	// 						obj["Jyothi's LBG Tracker"] = '';
	// 						obj['LBG Planning'] = '';
	// 						obj['TR #'] = '';
	// 						obj['TCD'] = '';
	// 						obj['TR# Angular / React / Cassandra / N2spring'] = '';
	// 						obj['TCD - A / R'] = '';
	// 						obj['BS, HTML, CSS'] = '';
	// 						obj['DOJ'] = cadetObj['DATE_OF_JOINING'];
	// 						obj['Intern / Star / Turbo / Non-Campus'] = '';
	// 						obj['Today'] = '';
	// 						obj['Ageing from DA Database'] = '';
	// 						obj['Ageing from ION'] = '';
	// 						obj['Actual Ageing (Days)'] = '';
	// 						obj['Ageing Bucket'] = '';
	// 						obj['PROP Lvl'] = '';
	// 						obj['VSL LVL'] = '';
	// 						obj['Digi-Thon Start Date'] = '';
	// 						obj['Digi-Thon End Date'] = '';
	// 						obj['Model'] = cadetObj['MODEL_TYPE'];
	// 						obj['Rookie Status'] = '';
	// 						obj['Current Suite ID'] = '';
	// 						obj['Current Skill'] = '';
	// 						obj['Updated Suite ID'] = cadetObj['DERIVED_SUITE_ID'];
	// 						obj['Updated Skill'] = cadetObj['DERIVED_SUITE_NAME'];
	// 						obj['CG Substream'] = '';
	// 						logger.debug('acquired skills', cadetObj['PROJECT_ACQUIRED_SKILL'])
	// 						// obj['Project_Acquired Skill'] = cadetObj['PROJECT_ACQUIRED_SKILL'];
	// 						obj['Quarter'] = '';
	// 						obj['Financial Year'] = '';
	// 						obj['laptop'] = '';
	// 						obj['Rental / Wipro'] = '';
	// 						obj['LAN'] = '';
	// 						obj['LSN'] = '';
	// 						obj['Project'] = '';
	// 						obj['Initial ERD'] = '';
	// 						obj['Current ERD'] = '';
	// 						obj['ERD Check'] = '';
	// 						obj['PCD'] = '';
	// 						result.push(obj);
	// 					}
	// 				});
	// 				res.status(200).json(result);
	// 			} catch(err4) {
	// 				logger.error('Error', err4);
	// 				res.status(500).json({
	// 					error: 'Internal error occurred, please report...!'
	// 				});
	// 			}
	// 		});
	// 	});
	});
});

module.exports = router;
