import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import Request from 'superagent';
import {Grid, Row, Col} from 'react-flexbox-grid';
import CandidateCard from './CandidateCard.jsx';
import CandidateHome from './CandidateHome.jsx';
import AddCandidate from './AddCandidate.jsx';

const styles = {
	heading: {
		textAlign: 'center'
	}
}

const items = [
	<MenuItem key={1} value={1} primaryText="All" />,
  <MenuItem key={2} value={2} primaryText="Wave 1" />,
  <MenuItem key={3} value={3} primaryText="Wave 2" />,
  <MenuItem key={4} value={4} primaryText="Wave 3" />,
  <MenuItem key={5} value={5} primaryText="Wave 4" />,
  <MenuItem key={6} value={6} primaryText="Wave 5" />,
  <MenuItem key={7} value={7} primaryText="Wave 6" />,
  <MenuItem key={8} value={8} primaryText="Wave 7" />,
  <MenuItem key={9} value={9} primaryText="Wave 8" />,
  <MenuItem key={10} value={10} primaryText="Wave 9" />,
  <MenuItem key={11} value={11} primaryText="Wave 10" />,
  <MenuItem key={12} value={12} primaryText="Wave 11" />,
  <MenuItem key={13} value={13} primaryText="Wave 12" />
];

export default class Candidates extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			showCandidate: false,
			displayCandidate: {},

			cadets: [],
			filterCadetName: '',
			filterCadetWave: ''

			WaveIds:[],
			WaveId:'',
			candidatesName:[]

		}
		this.onWaveIdChange = this.onWaveIdChange.bind(this);
		this.getWaveId = this.getWaveId.bind(this);
		this.candidateView = this.candidateView.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.deleteCandidate = this.deleteCandidate.bind(this);
		this.updateCandidate = this.updateCandidate.bind(this);
		this.handleWaveChange = this.handleWaveChange.bind(this);
		this.addCandidate = this.addCandidate.bind(this);
<<<<<<< HEAD
		this.handleFilterName = this.handleFilterName.bind(this);
		this.handleFilterWave = this.handleFilterWave.bind(this);
		this.handleClearFilter = this.handleClearFilter.bind(this);
	}
	componentDidMount() {
		this.getCandidates();
	}
	handleFilterName(val) {
	console.log("value",val)
		this.setState({
			filterCadetName: val,
			filterCadetWave: ''
		})
	}
	handleFilterWave(val) {
	console.log("value",val)
		this.setState({
			filterCadetWave: val,
			filterCadetName: ''
		})
	}
	handleClearFilter() {
		this.setState({
			filterCadetWave: '',
			filterCadetName: ''
		})
	}
	getCandidates() {
		let th = this;
		Request
			.get('/dashboard/cadets')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
				let cadets = res.body.filter(function(cadet) {
					if(!(cadet.Wave == undefined))
						return cadet;
				})
		    	console.log('Response came from the server', res.body)
		    	th.setState({
		    		candidates: cadets
		    	})
		    }
		  })
	}

=======
		this.getWaveSpecificCandidates=this.getWaveSpecificCandidates.bind(this);
	}
	componentWillMount() {
		if(localStorage.getItem('token')) {
			this.getWaveId()
		}

	}


>>>>>>> d9d307441f6aca50a62ad810606e0906be50e728
	candidateView(candidate) {
		this.setState({
			showCandidate: true,
			displayCandidate: candidate
		})
	}
	handleBack() {
		this.setState({
			showCandidate: false
		})
	}
	deleteCandidate(candidate) {
		let th = this
		Request
			.delete('/dashboard/deletecadet')
			.set({'Authorization': localStorage.getItem('token')})
			.send(candidate)
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	th.getWaveSpecificCandidates();
		    }
		  })
	}
	updateCandidate(candidate) {
		let th = this
		Request
			.post('/dashboard/updatecadet')
			.set({'Authorization': localStorage.getItem('token')})
			.send(candidate)
			.end(function(err, res){
		    if(err)
		    	console.log(err);
		    else {
		    	th.getWaveSpecificCandidates();
		    }
			});
	}
	handleWaveChange(event, key, value) {
		this.setState({
			wave: value
		})
	}


	addCandidate(candidate) {
		let th = this;
		Request
			.post('/dashboard/addcandidate')
			.set({'Authorization': localStorage.getItem('token')})
			.send(candidate)
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	th.getWaveSpecificCandidates();
		    	console.log('Success');
		    }
			})
	}
	getWaveId() {
		let th = this
		Request
			.get('/dashboard/waveids')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res){
			th.setState({
				WaveIds: res.body.waveids
			})
			})
		}
		getWaveSpecificCandidates(waveId){

		let th = this;
		console.log("yuva",waveId)

		Request
			.get('/dashboard/wavespecificcandidates?waveID='+waveId)
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res){
         console.log(res.body,"wspcc")
			th.setState({
					candidatesName:res.body.data
			})


			})
		}
		onWaveIdChange(e) {
			this.setState({
				WaveId: e.target.textContent,

			})
this.getWaveSpecificCandidates(e.target.textContent);

		}
	render() {
		let th = this;
<<<<<<< HEAD

		let cadetsName = [];
		let cadetsWave=[];
		let cadetsDistinctWave=[];
		this.state.candidates.map(function (cadet, i) {
			cadetsName.push(cadet.EmployeeName);
		})
		this.state.candidates.map(function (cadet, i) {
			cadetsWave.push(cadet.Wave);
			})
		cadetsDistinctWave=cadetsWave.filter(function (cadet, i, cadetsWave) {
    return cadetsWave.indexOf(cadet) == i;
});


=======
		console.log(th.state.candidatesName,"am jjoe")
>>>>>>> d9d307441f6aca50a62ad810606e0906be50e728
		// let filter = Filter:
		// 			<SelectField
	 //          floatingLabelText="Select Wave"
	 //          value={this.state.wave}
	 //          onChange={this.handleWaveChange}
	 //        >
	 //          {items}
	 //        </SelectField>
		return(
			<div>
			<AddCandidate addCandidate={this.addCandidate}/>
			{
				!this.state.showCandidate ?
				<div>
					<h1 style={styles.heading}>Candidate Management</h1>
<<<<<<< HEAD
					<AutoComplete
						hintText="Search Candidate"
						filter={AutoComplete.fuzzyFilter}
						searchText={this.state.filterCadetName}
						dataSource={cadetsName}
						onNewRequest={this.handleFilterName}
/>
<AutoComplete
	hintText="SortBy Wave"
	filter={AutoComplete.fuzzyFilter}
	 searchText={this.state.filterCadetWave}
	dataSource={cadetsDistinctWave}
	onNewRequest={this.handleFilterWave}
/>

<FlatButton
label="Clear Filter"
primary={true}
onClick={this.handleClearFilter}
/>

					<Grid>
						<Row>
							{

								this.state.candidates.map(function(candidate, key) {
								console.log(th.state.filterCadetWave+" got it"+th.state.filterCadetName)
								if((th.state.filterCadetWave === candidate.Wave)||(th.state.filterCadetName === candidate.EmployeeName)) {

								return (
										candidate.Wave != undefined &&
										<Col md={3} key={key}>
											<CandidateCard
												candidate={candidate}
												handleCardClick={th.candidateView}
												handleDelete={th.deleteCandidate}
											/></Col>
										)
										}

									else if((th.state.filterCadetName === '') && (th.state.filterCadetWave === '')) {

										return(
=======
					<SelectField
						onChange={th.onWaveIdChange}
						floatingLabelText="Select WaveID"
						value={th.state.WaveId}
					>
						{
							th.state.WaveIds.map(function(val, key) {
								return <MenuItem key={key} value={val} primaryText={val} />
							})
						}
					</SelectField>
					<Grid>
						<Row>
							{
								th.state.candidatesName.map(function(candidate, key) {
									return (
>>>>>>> d9d307441f6aca50a62ad810606e0906be50e728
										candidate.Wave != undefined &&
										<Col md={3} key={key}>
											<CandidateCard
												candidate={candidate}
												handleCardClick={th.candidateView}
												handleDelete={th.deleteCandidate}
											/>
										</Col>
									)
									}
										})
							}
						</Row>
					</Grid>
				</div>
				:
				<div>
					<CandidateHome
						candidate={this.state.displayCandidate}
						handleBack={this.handleBack}
						handleDelete={this.deleteCandidate}
						handleUpdate={this.updateCandidate}
					/>
				</div>
			}
			</div>
		)
	}
}
