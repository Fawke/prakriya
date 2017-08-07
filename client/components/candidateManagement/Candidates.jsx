import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import Pagination from 'material-ui-pagination';
import Request from 'superagent';
import {Grid, Row, Col} from 'react-flexbox-grid';
import CandidateCard from './CandidateCard.jsx';
import CandidateHome from './CandidateHome.jsx';
import AddCandidate from './AddCandidate.jsx';
import FilterItem from './FilterItem.jsx';
import Chip from 'material-ui/Chip';
import Snackbar from 'material-ui/Snackbar';
import app from '../../styles/app.json';
import DownloadProfile from './DownloadProfile.jsx';
import {lightBlack} from 'material-ui/styles/colors';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import FloatingActionButton from 'material-ui/FloatingActionButton';

const styles = {
	filterBody: {
		border: '1px solid #555',
		background: '#fff'
	},
	header: {
		// backgroundColor: '#eeeeee',
		// border: '2px solid silver',
		width: '100%',
		marginLeft: '0px',
		marginRight: '0px',
		marginTop: '5px',
		marginBottom: '0px',
		padding: '3px'
	},
	name: {
		textAlign: 'center',
		color: 'teal'
	},
	filters: {
		// border: '2px solid silver',
		width: ' 100%',
		padding: '3px'
	}
}
export default class Candidates extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			currentPage: 1,
			snackbarOpen: false,
			snackbarMessage: '',
			candidates: [],
			skills: [],
			waves: [],
			Billability: [],
			MentorReview: ['Top Gun', 'Good', 'Above Average', 'Average'],
			filtersCount: 0,
			filteredCandidates: [],
			displayCandidates: [],
			showCandidate: false,
			displayCandidate: {},
			imageURL: [],
			appliedFilters: {
				EmployeeID: '',
				EmployeeName: '',
				EmailID: '',
				DigiThonScore: '',
				Skills: [],
				Wave: '',
				Billability: [],
				MentorReview: ''
			}
		}

		this.getCandidates = this.getCandidates.bind(this);
		this.getSkills = this.getSkills.bind(this);
		this.getWaves = this.getWaves.bind(this);
		this.getBillability = this.getBillability.bind(this);
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
		this.resetFilters = this.resetFilters.bind(this);
		this.setPage = this.setPage.bind(this);
		this.getRole = this.getRole.bind(this);
	}

	componentWillMount() {
		this.getRole();
		this.getCandidates();
		this.getSkills();
		this.getWaves();
		this.getBillability();
	}

  getRole() {
    let th = this
    Request.get('/dashboard/userrole').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({role: res.body})
      }
    })
  }

	getBillability() {
		let th = this
    Request.get('/dashboard/billability').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({Billability: res.body})
        console.log('Billability', res.body);
      }
    })
	}

	addFilter(key, value) {
		let appliedFilters = this.state.appliedFilters;

		if(key == 'Skills') {
			appliedFilters[key].push(value);
		}
		else if(key == 'Billability') {
			appliedFilters[key].push(value);
		}
		else {
			appliedFilters[key] = value;
		}
		this.setState({
			filtersCount: this.state.filtersCount+1,
			appliedFilters: appliedFilters
		});
		this.getFilteredCandidates()
	}

	removeFilter(key) {
		let th = this;
		let appliedFilters = this.state.appliedFilters;
		if(key == 'Skills' || key == 'Billability') {
			appliedFilters[key] = [];
		}
		else {
			appliedFilters[key] = '';
		}
		this.setState({
			filtersCount: th.state.filtersCount - 1,
			appliedFilters: appliedFilters
		});
		this.getFilteredCandidates();
	}

	getCandidates() {
		let th = this;
		Request
			.get('/dashboard/allcadets')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
					let cadets = res.body;
		    	th.setState({
		    		candidates: cadets,
						filteredCandidates: cadets
		    	});
					th.setPage(th.state.currentPage);
		    }
		  })
	}

	getSkills() {
		let th = this;
		Request
			.get('/dashboard/skills')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
		    	let skills = res.body.map(function (skill) {
		    		return skill.Name;
		    	})
					th.setState({
						skills: skills
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
		    	let waves = res.body.map(function (wave) {
		    		return wave.WaveID + '(' + wave.CourseName + ')';
		    	})
					th.setState({
						waves: waves
					})
		    }
		  })
	}

	candidateView(candidate) {
		console.log(candidate)
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
		    	console.log('Added candidate successfully');
		    }
			})
	}

	getAccordianValues(key) {
		let valueArr = [];
		this.state.candidates.map(function(candidate, index) {
			if(candidate[key]) {
				valueArr.push(candidate[key].toString());
			}
			else {
				valueArr.push(candidate[key]);
			}
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
			.send({'filterQuery': this.state.appliedFilters})
			.end(function(err, res) {
				if(err)
		    	console.log(err);
		    else {
					th.setState({
						filteredCandidates: res.body
					});
					// th.setPage(th.state.currentPage)
					th.setPage(1)
		    }
			})
	}

	resetFilters() {
		let th = this;
		console.log('here');
		this.setState({
			filtersCount: 0,
			appliedFilters: {
				EmployeeID: '',
				EmployeeName: '',
				EmailID: '',
				DigiThonScore: '',
				Skills: [],
				Wave: '',
				Billability: []
			},
			filteredCandidates: th.state.candidates,
			displayCandidates: th.state.candidates.slice(0, 3)
		});
	}

	setPage(pageNumber) {
		let th = this;
		let start = (pageNumber - 1) * 3;
		let end = start + 3;
		let sliced = th.state.filteredCandidates.slice(start, end);
		th.setState({
			displayCandidates: sliced,
			currentPage: pageNumber
		});
	}

	render() {
		let th = this;
		return(
			<div>
				{
					th.state.filteredCandidates != undefined &&
					<FloatingActionButton mini={true} style={app.fab2} onTouchTap={this.handleOpen} title="Download All Profiles">
						<DownloadProfile
							color={lightBlack}
							candidate={th.state.filteredCandidates}
							imageURL={null}
							role={this.state.role}
							zip = {true}
						/>
			    </FloatingActionButton>
				}
				<AddCandidate addCandidate={this.addCandidate}/>
				{
					!this.state.showCandidate ?
					<div>
						<h1 style={app.heading}>Candidate Management</h1>
						<Grid>
							<Row>
								<Col md={3} style={styles.filterBody}>
									<div style={styles.header}>
										<h3 style={styles.name}>... FILTERS ...</h3>
										<div>
											<div style={{
												width: '60%',
												display: 'inline-block',
												boxSizing: 'border-box',
												padding: '2px'
											}}>
												Candidates Found: {this.state.filteredCandidates.length}
											</div>
											<div
												style={{
													cursor: 'pointer',
													width: '40%',
													display: 'inline-block',
													padding: '2px',
													boxSizing: 'border-box',
													textAlign: 'center',
													borderRadius: '5px',
													color: 'blue',
													textDecoration: 'underline'
												}}
												onTouchTap={th.resetFilters}
											>
												Reset Filters
											</div>
										</div>
									</div>
									{
										<div style={styles.filters}>
										{
											Object.keys(this.state.appliedFilters).map(function (filter, index) {
												let val = '';
												if(filter == 'Skills' || filter == 'Billability') {
													th.state.appliedFilters[filter].map(function(item) {
														val += item + ', ';
													})
													val = val.substring(0, val.length-2)
												}

												else {
													val = th.state.appliedFilters[filter];
												}
												if(val != '') {
													return (
														<Chip
															key={index}
															style={{border: '2px solid grey'}}
															onRequestDelete={()=>th.removeFilter(filter)}
														>
															<span style={{color: 'teal'}}>{filter}: {val}</span>
														</Chip>
													)
												}
											})
										}
										</div>
									}
									<hr />
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
										title={'EmailID'}
										type={'AutoComplete'}
										onGetAccordianValues={()=>th.getAccordianValues('EmailID')}
										onAddFilter={(filterValue)=>th.addFilter('EmailID', filterValue)}
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
										type={'AutoComplete'}
										onGetAccordianValues={()=>th.state.skills}
										onAddFilter={(filterValue)=>th.addFilter('Skills', filterValue)}
										onOpenSnackbar={th.openSnackbar}
									/>
									<FilterItem
										title={'Wave'}
										type={'AutoComplete'}
										onGetAccordianValues={()=>th.state.waves}
										onAddFilter={(filterValue)=>th.addFilter('Wave', filterValue)}
										onOpenSnackbar={th.openSnackbar}
									/>
									{th.state.role == 'wiproadmin' &&
									<FilterItem
										title={'Mentor Review'}
										type={'AutoComplete'}
										onGetAccordianValues={()=>th.state.MentorReview}
										onAddFilter={(filterValue)=>th.addFilter('MentorReview', filterValue)}
										onOpenSnackbar={th.openSnackbar}
									/>}
									{th.state.role == 'wiproadmin' &&
									<FilterItem
										title={'Billability Status'}
										type={'AutoComplete'}
										onGetAccordianValues={()=>th.state.Billability}
										onAddFilter={(filterValue)=>th.addFilter('Billability', filterValue)}
										onOpenSnackbar={th.openSnackbar}
									/>
									}
								</Col>
								<Col md={9}>
									{
										this.state.displayCandidates.map(function(candidate, key) {
											return (
														<CandidateCard
															candidate={candidate}
															handleCardClick={th.candidateView}
															handleDelete={th.deleteCandidate}
															key={key}
															k={key + th.state.currentPage}
															role={th.state.role}
														/>
												)
										})
									}
								</Col>
							</Row>
						</Grid>
						{
							this.state.filteredCandidates.length > 3 ?
							<div style={app.pager}>
								<Pagination
					          total={
											this.state.filteredCandidates.length%3>0?
											parseInt(this.state.filteredCandidates.length/3 + 1):
											parseInt(this.state.filteredCandidates.length/3)
										}
					          current={this.state.currentPage}
					          display={3}
					          onChange={this.setPage}
								/>
							</div> : ''
						}
					</div>
					:
					<div>
						<CandidateHome
							candidate={this.state.displayCandidate}
							handleBack={this.handleBack}
							handleDelete={this.deleteCandidate}
							handleUpdate={this.updateCandidate}
							role={this.state.role}
						/>
					</div>
				}
			</div>
		)
	}
}
