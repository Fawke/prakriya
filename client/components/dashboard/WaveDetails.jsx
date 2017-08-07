import React from 'react';
import LinearProgress from 'material-ui/LinearProgress';
import Request from 'superagent';
import Moment from 'moment';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import WaveProgress from './waveProgress.jsx'

const styles = {
	container: {
		padding: 20,
		borderRadius: 5,
		backgroundColor: '#C6D8D3'
	},
	progressBar: {
		marginTop: 10,
		marginBottom: 5
	},
	heading: {
		textAlign: 'center'
	},
	wave: {
		marginBottom: 30
	}
}

export default class WaveDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			waves: [],
			activeWaves: [],
			showDetails: false,
			waveDetail: ''
		},
		this.getWaves = this.getWaves.bind(this);
		this.showProgress = this.showProgress.bind(this);
		this.formatDate = this.formatDate.bind(this);
		this.WaveDetails = this.WaveDetails.bind(this);
	}
	componentWillMount() {
		this.getWaves();
	}
	getWaves() {
		let th = this;
		Request
			.get('/dashboard/waves')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res){
				if(err)
					console.log(err)
				else {
					let activeWaves = []
					res.body.map(function(wave, key) {
						let sdate = new Date(wave.StartDate);
						let edate = new Date(wave.EndDate);
						if(sdate < Date.now() && edate > Date.now())
							activeWaves.push(wave);
					})
					th.setState({
						activeWaves: activeWaves
					})
				}
			})
	}
	showProgress(waveObj) {
		let sdate = new Date(waveObj.StartDate);
		let edate = new Date(waveObj.EndDate);
		let total = edate - sdate;
		let prog = Date.now() - sdate;
		return Math.round(prog*100/total);
	}
	formatDate(date) {
		return Moment(date).format("MMM Do YYYY");
	}

	WaveDetails(val) {
		let th = this;
		let value = val;
		if(th.state.showDetails) {
			value = ''
		}
		this.setState({
			showDetails: !th.state.showDetails,
			waveDetail: value
		})
	}

	render() {
		let th = this;
		return(
			<Paper style={styles.container}>
				{
					this.state.activeWaves.length > 0 ?
					<h3>On going waves</h3> :
					<h3>No on going waves to show.</h3>
				}
				{
					this.state.activeWaves.map(function(wave, key) {
						let progressPercentile = th.showProgress(wave);
						return (
							<div style={styles.wave} key={key}>
								<div style={styles.heading}>{wave.WaveID} ({wave.CourseName}) @ {wave.Location} -- {progressPercentile}%
									<IconButton tooltip="More details" onClick={th.WaveDetails.bind(this, wave.WaveID + ' (' + wave.CourseName + ')')} style={{float:'right'}}>
										{
											th.state.waveDetail === '' &&
											<KeyboardArrowDown/>
										}
										{
											th.state.waveDetail !== '' &&
											th.state.waveDetail === wave.WaveID + ' (' + wave.CourseName + ')' &&
											<KeyboardArrowUp/>
										}
									</IconButton>
								</div>
								<LinearProgress
									mode="determinate"
									value={progressPercentile}
									key={key}
									style={styles.progressBar}
								/>
								{th.formatDate(wave.StartDate)}
								<span style={{float: 'right'}}>
									{th.formatDate(wave.EndDate)}
								</span>
								{
									th.state.waveDetail !== '' &&
									th.state.waveDetail === wave.WaveID + ' (' + wave.CourseName + ')' &&
									<WaveProgress
										open = {th.state.showDetails}
										waveDetails = {th.WaveDetails}
										wave = {wave}
									/>
								}
							</div>
						)
					})
				}
			</Paper>
		)
	}
}
