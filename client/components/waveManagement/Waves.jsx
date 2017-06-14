import React from 'react'
import Request from 'superagent'
import WaveCard from './WaveCard.jsx'
import Masonry from 'react-masonry-component'
import {Tabs, Tab} from 'material-ui/Tabs'
import {Grid, Row, Col} from 'react-flexbox-grid';
import AddWave from './AddWave.jsx';
import app from '../../styles/app.json';

const styles = {
	col: {
		marginBottom: 20
	},
	tabs: {
		border: '2px solid teal'
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
			cadets: [],
			waves : [],
			activeWaves: []
		}
		this.getCadets = this.getCadets.bind(this)
		this.getWaves = this.getWaves.bind(this)
		this.getActiveWaves = this.getActiveWaves.bind(this)
		this.handleDelete = this.handleDelete.bind(this)
		this.handleUpdate = this.handleUpdate.bind(this)
		this.addWave = this.addWave.bind(this);
	}

	componentWillMount() {
		this.getCadets()
		this.getWaves()
		this.getActiveWaves()
	}

	getCadets() {
		let th = this;
		Request
			.get('/dashboard/cadets')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	let cadets = res.body.filter(function(cadet) {
		    		if(cadet.Wave == undefined || cadet.Wave == '')
		    			return cadet;
		    	})
		    	th.setState({
		    		cadets: cadets
		    	})
		    }
		  })
	}

	getActiveWaves() {
		let th = this
		Request
			.get('/dashboard/activewaves')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
					console.log(err);
				else {
					console.log('Successfully fetched all active waves', res.body)
					th.setState({
						activeWaves: res.body
					})
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
		    	console.log('Successfully fetched all waves', res.body)
		    	function compare(a,b) {
					  if (a.StartDate < b.StartDate)
					    return -1;
					  if (a.StartDate > b.StartDate)
					    return 1;
					  return 0;
					}
					res.body.sort(compare);
		    	th.setState({
		    		waves: res.body
		    	})
		    }
			})
	}

	handleUpdate(wave) {
		let th = this;
		Request
			.post('/dashboard/updatewave')
			.set({'Authorization': localStorage.getItem('token')})
			.send({wave: wave})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('Successfully updated a project', res.body)
		    	th.getWaves();
		    	}
			})
		console.log('handle update');
	}

	handleDelete(wave)
	{
		let th = this;
		Request
			.post('/dashboard/deletewave')
			.set({'Authorization': localStorage.getItem('token')})
			.send({wave:wave})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	console.log('Successfully deleted a wave', res.body)
		    		th.getWaves();
		    	}
			})
		console.log('handle delete');
	}

	addWave(wave) {
		let th = this;
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
		    		message: "Wave added successfully with Wave ID: " + res.body.WaveID
		    	})
		    	th.getCadets();
		    	th.getWaves();
		    	th.getActiveWaves();
		    }
			});
	}


	render() {
		let th = this;
		return (
			<div>
				<h2 style={app.heading}>Wave Management</h2>
				<Grid><Row><Tabs
					style={styles.tabs}
					tabItemContainerStyle={styles.tabItemContainer}
					inkBarStyle={styles.inkBar}>
					<Tab label='Ongoing Waves' style={styles.tab}>
						<Masonry
							className={'my-class'}
							elementType={'ul'}
							options={masonryOptions}
							style={styles.masonry}
						>
								{
									this.state.waves.length > 0 ?
									th.state.waves.map(function (wave, key) {
										if(th.state.activeWaves.indexOf(wave.WaveID) >= 0) {
											return (
												<WaveCard
													key={key}
													wave={wave}
													handleUpdate={th.handleUpdate}
													handleDelete={th.handleDelete}
													bgColor={backgroundColors[key%4]}
													bgIcon={backgroundIcons[key%4]}
												/>
											)
										}
									}):
									<span>No waves to display</span>
								}
						</Masonry>
					</Tab>
					<Tab label='Upcoming Waves' style={styles.tab}>
						<Masonry
							className={'my-class'}
							elementType={'ul'}
							options={masonryOptions}
							style={styles.masonry}
						>
								{
									this.state.waves.length > 0 ?
									this.state.waves.map(function (wave, key) {
										if(new Date(wave.StartDate) > Date.now()) {
											return (
												<WaveCard
													key={key}
													wave={wave}
													handleUpdate={th.handleUpdate}
													handleDelete={th.handleDelete}
													bgColor={backgroundColors[key%4]}
													bgIcon={backgroundIcons[key%4]}
												/>
											)
										}
									}):
									<span>No waves to display</span>
								}
						</Masonry>
					</Tab>
					<Tab label='All Waves' style={styles.tab}>
						<Masonry
							className={'my-class'}
							elementType={'ul'}
							options={masonryOptions}
							style={styles.masonry}
						>
								{
									this.state.waves.length > 0 ?
									this.state.waves.map(function (wave, key) {
										return (
											<WaveCard
												key={key}
												wave={wave}
												handleUpdate={th.handleUpdate}
												handleDelete={th.handleDelete}
												bgColor={backgroundColors[key%4]}
												bgIcon={backgroundIcons[key%4]}
											/>
										)
									}):
									<span>No waves to display</span>
								}
						</Masonry>
					</Tab>
				</Tabs></Row></Grid>
				{
					this.props.user.role == "sradmin" &&
					this.state.cadets.length > 0 &&
					<AddWave  cadets={this.state.cadets} handleWaveAdd={this.addWave}/>
				}
			</div>
		)
	}
}
