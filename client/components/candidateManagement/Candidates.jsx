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
import FilterItem from './FilterItem.jsx';
import Chip from 'material-ui/Chip';
import Snackbar from 'material-ui/Snackbar';

const styles = {
	heading: {
		textAlign: 'center'
	}
}

export default class Candidates extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			snackbarOpen: false,
			snackbarMessage: '',
			candidates: [],
			filteredCandidates: [],
			showCandidate: false,
			displayCandidate: {},
			appliedFilters: [
				{EmployeeID: {$in: []}},
				{EmployeeName: {$in: []}},
				{DigiThonQualified: ''},
				{DigiThonPhase: ''},
				{Wave: ''},
				{DigiThonScore: {$gte: 9999}}
			]
		}

		this.getCandidates = this.getCandidates.bind(this);
		this.candidateView = this.candidateView.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.deleteCandidate = this.deleteCandidate.bind(this);
		this.updateCandidate = this.updateCandidate.bind(this);
		this.addCandidate = this.addCandidate.bind(this);
		this.getAccordianValues = this.getAccordianValues.bind(this);
		this.addFilter = this.addFilter.bind(this);
		this.removeFilter = this.removeFilter.bind(this);
		this.hideSnackbar = this.hideSnackbar.bind(this);
		this.getFilteredCandidates = this.getFilteredCandidates.bind(this);
		this.openSnackbar = this.openSnackbar.bind(this);
	}

	componentWillMount() {
		this.getCandidates();
	}

	addFilter(key, value) {
		let appliedFilters = this.state.appliedFilters;
		switch(key) {
			case 'EmployeeID':
				if(!this.duplicateFilterFound(appliedFilters[0].EmployeeID.$in, value))
					appliedFilters[0].EmployeeID.$in.push(value);
				break;
			case 'EmployeeName':
				if(!this.duplicateFilterFound(appliedFilters[1].EmployeeName.$in, value))
					appliedFilters[1].EmployeeName.$in.push(value);
				break;
			case 'DigiThonQualified':
				appliedFilters[2].DigiThonQualified = value;
				break;
			case 'DigiThonPhase':
				appliedFilters[3].DigiThonPhase = value;
				break;
			case 'Wave':
				appliedFilters[4].Wave = value;
				break;
			case 'DigiThonScore':
				appliedFilters[5].DigiThonScore.$gte = value;
			default:
				break;
		}

		this.setState({
			appliedFilters: appliedFilters
		});

		console.log('Add - AppliedFilters: ', appliedFilters)
		this.getFilteredCandidates()
	}

	removeFilter(index, key, value) {
		let appliedFilters = this.state.appliedFilters
		console.log('RemoveFilter: ', appliedFilters)
		if(appliedFilters[index][key].$in == undefined) {
			if(appliedFilters[index][key].$gte == undefined) appliedFilters[index][key] = '';
			else appliedFilters[index][key].$gte = 9999;
		} else {
			let $in = appliedFilters[index][key].$in.filter(function(element) {
				return element != value;
			});
			appliedFilters[index][key].$in = $in
		}
		this.setState({
			appliedFilters: appliedFilters
		});
		console.log('Delete - AppliedFilters: ', appliedFilters)
		this.getFilteredCandidates();
	}

	duplicateFilterFound(arr, value) {
			return arr.some(function(element) {
				return element == value;
			});
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
						// if(!(cadet.Wave == undefined))
							return cadet;
					})
		    	th.setState({
		    		candidates: cadets
		    	})
		    }
		  })
	}

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
		    	th.getCandidates();
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
		    	th.getCandidates();
		    }
			});
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
		    	console.log('Success');
		    }
			})
	}

	getAccordianValues(key) {
		let valueArr = [];
		this.state.candidates.map(function(candidate, index) {
			if(candidate[key]) valueArr.push(candidate[key].toString());
			else valueArr.push(candidate[key]);
		});
		return valueArr.filter(this.distinctDefined);
	}

	distinctDefined(value, index, self) {
		return self.indexOf(value) === index && value != undefined;
	}

	openSnackbar(message) {
		this.setState({
			snackbarMessage: message,
			snackbarOpen: true
		});
	}

	hideSnackbar() {
		this.setState({
			snackbarMessage: '',
			snackbarOpen: false
		});
	}

	// fetching filtered candidates from db
	getFilteredCandidates() {
		let th = this;
		Request
			.post('/dashboard/filteredcandidates')
			.set({'Authorization': localStorage.getItem('token')})
			.send({'filterQuery': th.state.appliedFilters})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
					th.setState({
						filteredCandidates: res.body
					});
		    	console.log('Filter Success');
					console.log(res);
		    }
			})
	}

	render() {
		let th = this;
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
		return(
			<div>
			<AddCandidate addCandidate={this.addCandidate}/>
			{
				!this.state.showCandidate ?
				<div>
					<h1 style={styles.heading}>Candidate Management</h1>
					<Grid>
						<Row>
							<Col md={3}>
								<h3 style={{
									textAlign: 'center',
									backgroundColor: '#eeeeee',
									border: '2px solid silver',
									width: '100%',
									marginLeft: '0px',
									marginRight: '0px',
									marginTop: '5px',
									marginBottom: '0px',
									padding: '3px',
									color: 'teal'
								}}>... FILTERS ...</h3>
								{
									<div style={{border: '2px solid silver', width: ' 100%', padding: '3px'}}>
									{
										th.state.appliedFilters.map(function(filter, index) {
											let key = Object.keys(filter)[0];
											if(filter[key].$in == undefined) {
												let value = Object.values(filter)[0].$gte == undefined ?
													Object.values(filter)[0] :
													Object.values(filter)[0].$gte;
												if(value != '' && value != 9999) {
													return (
														<Chip
															key={key}
															style={{border: '2px solid grey'}}
															onRequestDelete={()=>th.removeFilter(index, key, value)}
														>
															<span style={{color: 'teal'}}>{key}: {value}</span>
														</Chip>
													)
												}
											} else {
													return filter[key].$in.map(function(value, innerIndex) {
														return (
															<Chip
																key={key + innerIndex}
																style={{border: '2px solid grey'}}
																onRequestDelete={()=>th.removeFilter(index, key, value)}
															>
																<span style={{color: 'teal'}}>{value}</span>
															</Chip>
														)
													})
												}
										})
									}
									</div>
								}
								<FilterItem
									title={'EmployeeID'}
									type={'AutoComplete'}
									onGetAccordianValues={()=>th.getAccordianValues('EmployeeID')}
									onAddFilter={(filterValue)=>th.addFilter('EmployeeID', filterValue)}
									onOpenSnackbar={th.openSnackbar}
								/>
								<FilterItem
									title={'EmployeeName'}
									type={'AutoComplete'}
									onGetAccordianValues={()=>th.getAccordianValues('EmployeeName')}
									onAddFilter={(filterValue)=>th.addFilter('EmployeeName', filterValue)}
									onOpenSnackbar={th.openSnackbar}
								/>
								<FilterItem
									title={'DigithonQualified'}
									type={'RadioButton'}
									onGetAccordianValues={()=>['Yes', 'No']}
									onAddFilter={(filterValue)=>th.addFilter('DigiThonQualified', filterValue)}
								/>
								<FilterItem
									title={'DigithonPhase'}
									type={'AutoComplete'}
									onGetAccordianValues={()=>th.getAccordianValues('DigiThonPhase')}
									onAddFilter={(filterValue)=>th.addFilter('DigiThonPhase', filterValue)}
									onOpenSnackbar={th.openSnackbar}
								/>
								<FilterItem
									title={'DigithonScore'}
									type={'Slider'}
									onGetAccordianValues={()=>[0, 200]}
									onAddFilter={(filterValue)=>th.addFilter('DigiThonScore', filterValue)}
								/>
								<FilterItem
									title={'Skills'}
									type={'CheckBox'}
									onGetAccordianValues={()=>th.getAccordianValues('Skills')}
									onAddFilter={(filterValue)=>th.addFilter('Skills', filterValue)}
									onOpenSnackbar={th.openSnackbar}
								/>
								<FilterItem
									title={'Wave'}
									type={'AutoComplete'}
									onGetAccordianValues={()=>th.getAccordianValues('Wave')}
									onAddFilter={(filterValue)=>th.addFilter('Wave', filterValue)}
									onOpenSnackbar={th.openSnackbar}
								/>
							</Col>
							<Col md={9}>
								{
									this.state.filteredCandidates.length == 0 ?
									this.state.candidates.map(function(candidate, key) {
										return (
													<CandidateCard
														candidate={candidate}
														handleCardClick={th.candidateView}
														handleDelete={th.deleteCandidate}
														k={key}
													/>
											)
									}) :
									this.state.filteredCandidates.map(function(candidate, key) {
										return (
													<CandidateCard
														candidate={candidate}
														handleCardClick={th.candidateView}
														handleDelete={th.deleteCandidate}
														k={key}
													/>
											)
									})
								}
							</Col>
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
			<Snackbar
				open={this.state.snackbarOpen}
				message={this.state.snackbarMessage}
				autoHideDuration={4000}
				onRequestClose={this.hideSnackbar}
			/>
			</div>
		)
	}
}
