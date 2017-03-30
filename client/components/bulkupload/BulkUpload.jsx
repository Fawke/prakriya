import React from 'react';
import Request from 'superagent';
import FileList from './FileList.jsx';
import FileDrop from './FileDrop.jsx';

export default class BulkUpload extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			showList: false,
			files: []
		}
		this.getFiles = this.getFiles.bind(this);
		this.handleUpload = this.handleUpload.bind(this);
	}
	componentDidMount() {
		this.getFiles();
	}
	getFiles() {
		let th = this;
		Request
			.get('/dashboard/files')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('Response came from the server', res.body)
		    	if(res.body.length > 0) {
		    		let files = res.body.sort(function(a,b) {
		    			if (a.submittedOn > b.submittedOn)
						    return -1;
						  if (a.submittedOn < b.submittedOn)
						    return 1;
						  return 0;
		    		})
		    		th.setState({
			    		files: files,
			    		showList: true
		    		})
		    	}
		    }
		  })
	}
	handleUpload(file) {
		let th = this;
		Request
			.post('/upload/cadets')
			.set({'Authorization': localStorage.getItem('token')})
			.attach('file', file)
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('File uploaded:', res.body.fileName)
		    }
			})
	}

	render() {
		let th = this;
		return(
			<div>
		    <FileDrop uploadCadets={this.handleUpload}/>
		    {
		    	this.state.showList &&
		    	<FileList files={this.state.files}/>
		    }
			</div>
		)
	}
}