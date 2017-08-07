import React from 'react';
import jsPDF from 'jspdf';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import Request from 'superagent';
import CONFIG from '../../config/index';

let zip;
let imageURL = '';

export default class DownloadProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			candidates: {}
		}
		this.downloadProfile = this.downloadProfile.bind(this);
		this.downloadCandidateProfile = this.downloadCandidateProfile.bind(this);
		this.getProfilePic = this.getProfilePic.bind(this);
	}

	componentWillMount() {
		this.setState({
			candidates: this.props.candidate
		})
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			candidates: nextProps.candidate
		})
	}

	downloadCandidateProfile() {
		let th = this;
		if(this.props.zip) {
			zip = new JSZip();
			this.state.candidates.map(function (cadet, index) {
				th.getProfilePic(cadet.EmailID, cadet, index);
			})
		}
		else {
			let candidate = this.props.candidate;
			imageURL = this.props.imageURL;
			this.downloadProfile(candidate, 0);
		}
	}

	getProfilePic(emailID, cadet, index) {
		let th = this;
		let username = emailID.split("@wipro.com")[0];
		Request
			.get(`/dashboard/getimage`)
			.set({'Authorization': localStorage.getItem('token')})
			.query({filename: username})
			.end(function(err, res) {
				if(err) {
		    	console.log('Image not found for ', eid);
					imageURL = '../../assets/images/avt-default.jpg';
					th.downloadProfile(cadet, index);
				}
		    else {
		    	if(res.text) {
		    		imageURL = res.text;
						th.downloadProfile(cadet, index);
		    	}
		    }
			})
	}

	downloadProfile(candidate, index) {

		let doc = new jsPDF()
		let x = 95;
		let y = 20;


		doc.setFillColor(85, 85, 85);
		doc.setDrawColor(100, 100, 0);
		doc.setLineWidth(1);
		doc.rect(20, 20, 170, 15, 'F');

		doc.setFontSize(18);
		doc.setTextColor(255, 255, 255);
		doc.text(x+15, y+=10, candidate.EmployeeName, 'center')

		y+=10;

		var img = new Image();
		img.src = imageURL;
	  doc.addImage(img, 'jpeg', 20, y, 60, 70);

		doc.setFontSize(12);
		doc.setTextColor(0, 0, 0);
		doc.text(x, y+=10, 'Employee ID: ' + candidate.EmployeeID+'')
		doc.text(x, y+=10, 'Email: ' + candidate.EmailID)
		if(this.props.role === 'wiproadmin') {
			doc.text(x, y+=10, 'Band: ' + candidate.CareerBand)
		}
		doc.text(x, y+=10, 'Wave: ' + candidate.Wave)
		doc.text(x, y+=10, 'Experience: ' + candidate.WorkExperience)
		doc.text(x, y+=10, 'Digithon Score: ' + candidate.DigiThonScore+'')
		if((this.props.candidate.ProjectName !== '' && this.props.candidate.ProjectName !== undefined))
		{
		doc.text(x, y+=10, 'Project Details: ')
		doc.text(x, y+=10, 'Name: ' + candidate.ProjectName+'')
		doc.text(x, y+=10, 'Description: ')
		let desc = doc.splitTextToSize(candidate.ProjectDescription + '', 100);
		doc.text(x, y+=5, desc);
		let height = doc.getTextDimensions(candidate.ProjectDescription + '').h;
		y = y + height - 10;
		doc.text(x, y+=10, 'Skills:');
		let skillString = '';
		candidate.ProjectSkills.map(function(skill, key) {
			if(key !== candidate.ProjectSkills.length-1 && key !== candidate.ProjectSkills.length-2) {
				skillString = skillString + skill + ', ';
			}	else if(key === candidate.ProjectSkills.length-2) {
							skillString = skillString + skill + ' and ';
			}
			else {
				skillString = skillString + skill;
			}
		})
		let skills = doc.splitTextToSize(skillString, 100);
		doc.text(x, y+=5, skills);
		height = doc.getTextDimensions(candidate.ProjectSkills+'').h;
		y = y + height
		}
		if(this.props.zip) {
			zip.file(candidate.EmployeeID + '.pdf', doc.output('blob'));
			if(index === this.state.candidates.length-1) {
				zip.generateAsync({ type: "blob" })
				 .then(function (content) {
					 FileSaver.saveAs(content, "cadetProfiles.zip");
				 });
			}
		}
		else {
			doc.save(candidate.EmployeeID + '.pdf')
		}
	}

	render() {
			return(
				<DownloadIcon style={this.props.style} color={this.props.color}
					onClick={this.downloadCandidateProfile}/>
			)
		}
}
