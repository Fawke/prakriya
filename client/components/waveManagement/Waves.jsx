import React from 'react';
import Request from 'superagent';
import WaveCard from './WaveCard.jsx';
import Masonry from 'react-masonry-component';
import {Tabs, Tab} from 'material-ui/Tabs';
import {Grid, Row, Col} from 'react-flexbox-grid';
import Pagination from 'material-ui-pagination';
import AddWave from './AddWave.jsx';
import app from '../../styles/app.json';
import Snackbar from 'material-ui/Snackbar';

const styles = {
	col: {
		marginBottom: 20
	},
	tabs: {
		border: '2px solid teal',
		width: '1250px'
	},
	tab: {
		color: '#DDDBF1',
		fontWeight: 'bold'
	},
	inkBar: {
		backgroundColor: '#DDDBF1',
		height: '5px',
		bottom: '5px'
	},
	tabItemContainer: {
		backgroundColor: 'teal'
	},
	masonry: {
		width: '1200px'
	}
}

const masonryOptions = {
    transitionDuration: 0
}

const backgroundColors = [
	'#F5DEBF',
	'#DDDBF1',
	'#CAF5B3',
	'#C6D8D3'
]

const backgroundIcons = [
	'#847662',
	'#666682',
	'#4e5f46',
	'#535f5b'
]

export default class Waves extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			tab: 'Ongoing',
			currentPage: 1,
			noCadets: false,
			cadets: [],
			courses: [],
			waves : [],
			displayWaves: [],
			filteredWaves: [],
			open: false,
			message: ''
		}
		this.getCourses = this.getCourses.bind(this);
		this.getCadets = this.getCadets.bind(this);
		this.getWaves = this.getWaves.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.addWave = this.addWave.bind(this);
		this.onTabChange = this.onTabChange.bind(this);
		this.setPage = this.setPage.bind(this);
		this.handleRequestClose = this.handleRequestClose.bind(this);
	}

	componentWillMount() {
		this.getCourses();
		this.getCadets();
		this.getWaves();
	}

	getCadets() {
		let th = this;
		Request
			.get('/dashboard/newcadets')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	if(res.body.length == 0) {
		    		th.setState({
			    		cadets: [],
			    		noCadets: true
			    	})
		    	} else {
		    		th.setState({
			    		cadets: res.body,
			    		noCadets: false
			    	})
		    	}
		    }
		  })
	}

	getWaves() {
		let th = this;
		Request
			.get('/dashboard/waves')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
					let filteredWaves = [];
					res.body.map(function(wave, key) {
						let today = Date.now();
							if(new Date(wave.StartDate) <= today && new Date(wave.EndDate) >= today)
								filteredWaves.push(wave)
					});
		    	th.setState({
		    		waves: res.body,
						filteredWaves: filteredWaves,
						displayWaves: filteredWaves.slice(0, 3)
		    	})
					th.onTabChange('Ongoing');
		    }
			})
	}

	getCourses() {
		let th = this;
		Request
			.get('/dashboard/courses')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	th.setState({
		    		courses: res.body
		    	})
		    }
		  })
	}

	handleUpdate(wave, oldCourse) {
		let th = this;
		Request
			.post('/dashboard/updatewave')
			.set({'Authorization': localStorage.getItem('token')})
			.send({wave: wave, oldCourse: oldCourse})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	th.getWaves();
					th.setState({
			      open: true,
						message: 'Wave Updated Successfully'
			    });
		    	}
			})
	}

	handleDelete(wave) {
		let th = this;
		Request
			.post('/dashboard/deletewave')
			.set({'Authorization': localStorage.getItem('token')})
			.send({wave:wave})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
					th.setState({
			      open: true,
						message: 'Wave Deleted Successfully'
			    });
		    		th.getWaves();
		    	}
			})
	}

	addWave(wave) {
		let th = this;
		let flag = false;
		this.state.waves.filter(function (existingWave) {
			if((wave.WaveID === existingWave.WaveID) && ( wave.Course.split('_')[0] === existingWave.CourseName)) {
				flag = true;
			}
		})
		if(!flag)
		{
		Request
			.post('/dashboard/addwave')
			.set({'Authorization': localStorage.getItem('token')})
			.send(wave)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
		    	th.setState({
		    		open: true,
		    		message: "Wave added successfully with Wave ID: " + wave.WaveID
		    	})
		    	th.getCadets();
		    	th.getWaves();
		    }
			});
		} else {
			th.setState({
				open: true,
				message: "Wave already exist"
			})
		}
	}

	onTabChange(tab) {
		let th = this;
		let filteredWaves = [];
		if(tab === 'Ongoing') {
			this.state.waves.map(function(wave, key) {
				let today = Date.now();
				if(new Date(wave.StartDate) <= today && new Date(wave.EndDate) >= today)
					filteredWaves.push(wave)
			});
			this.setState({
				filteredWaves: filteredWaves,
				displayWaves: filteredWaves.slice(0, 3),
				pageNumber: 1
			});
		} else if(tab === 'Upcoming') {
			this.state.waves.map(function(wave, key) {
				if(new Date(wave.StartDate) > Date.now() || wave.StartDate === null)
					filteredWaves.push(wave)
			});
			this.setState({
				filteredWaves: filteredWaves,
				displayWaves: filteredWaves.slice(0, 3),
				pageNumber: 1
			});
		} else if(tab === 'Completed') {
			this.state.waves.map(function(wave, key) {
				if(new Date(wave.EndDate) < Date.now()  && wave.StartDate !== null)
					filteredWaves.push(wave)
			});
			this.setState({
				filteredWaves: filteredWaves,
				displayWaves: filteredWaves.slice(0, 3),
				pageNumber: 1
			});
		}
		this.setState({
			tab: tab
		});
	}

	setPage(pageNumber) {
		let th = this;
		let start = (pageNumber - 1) * 3;
		let end = start + 3;
		let sliced = th.state.filteredWaves.slice(start, end);
		th.setState({
			displayWaves: sliced,
			currentPage: pageNumber
		});
	}

		handleRequestClose = () => {
	    this.setState({
	      open: false,
				message: ''
	    });
	  };

	render() {
		let th = this;
		let displayPage = (
				this.state.displayWaves.length > 0 ?
				<Masonry
					className={'my-class'}
					elementType={'ul'}
					options={masonryOptions}
					style={styles.masonry}
				>
				{
					th.state.displayWaves.map(function (wave, key) {
						return (
							<WaveCard
								key={key}
								wave={wave}
								handleUpdate={th.handleUpdate}
								handleDelete={th.handleDelete}
								bgColor={backgroundColors[key%4]}
								bgIcon={backgroundIcons[key%4]}
								getWaves={th.getWaves}
							/>
						)
					})
				}
			</Masonry> :
			<h4 style={{textAlign: 'center', marginTop: '50px', color: 'teal'}}>NO WAVES TO DISPLAY</h4>
		);
		return (
			<div>
				<h2 style={app.heading}>Wave Management</h2>
				<Grid><Row style={{height: '410px'}}><Tabs
					onChange={th.onTabChange}
					value={th.state.tab}
					style={styles.tabs}
					tabItemContainerStyle={styles.tabItemContainer}
					inkBarStyle={styles.inkBar}>
					<Tab label='Ongoing Waves' style={styles.tab} value='Ongoing'>
						{displayPage}
					</Tab>
					<Tab label='Upcoming Waves' style={styles.tab} value='Upcoming'>
						{displayPage}
					</Tab>
					<Tab label='Completed Waves' style={styles.tab}  value='Completed'>
						{displayPage}
					</Tab>
				</Tabs></Row></Grid>
				{
					this.state.filteredWaves.length > 3 ?
					<div style={app.pager}>
						<Pagination
								total={
									this.state.filteredWaves.length%3>0?
									parseInt(this.state.filteredWaves.length/3 + 1):
									parseInt(this.state.filteredWaves.length/3)
								}
								current={this.state.currentPage}
								display={3}
								onChange={this.setPage}
						/>
					</div> : ''
				}
				{
					this.props.user.role == "sradmin" &&
					this.state.courses.length > 0 &&
					(this.state.cadets.length > 0 ||
					this.state.noCadets) &&
					<AddWave
						cadets={this.state.cadets}
						courses={this.state.courses}
						handleWaveAdd={this.addWave}
					/>
				}

				<Snackbar
					open={this.state.open}
					message={this.state.message}
					autoHideDuration={4000}
					onRequestClose={this.handleRequestClose}
			 />
			</div>
		)
	}
}
