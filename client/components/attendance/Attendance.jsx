import React from 'react';
import Request from 'superagent';
import {DateRange} from 'react-date-range';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import {Step, Stepper, StepLabel, StepContent} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import RejectIcon from 'material-ui/svg-icons/navigation/close';
import ApproveIcon from 'material-ui/svg-icons/navigation/check';
import {red500, green500} from 'material-ui/styles/colors';
import DatePicker from 'material-ui/DatePicker';
import Moment from 'moment';
import Dialog from 'material-ui/Dialog';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import {Tabs, Tab} from 'material-ui/Tabs';
import Calendar from './Calendar.jsx';

const styles = {
  content: {
    marginLeft: '30%'
  },
  row: {
    wordWrap: 'break-word'
  },
  deleteDialog: {
    backgroundColor: '#DDDBF1',
    border: '10px solid teal'
  },
  actionsContainer: {
    backgroundColor: 'teal',
    borderTop: '0px',
    marginTop: '0px'
  }
}

export default class Attendance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leaveType: 'Personal Leave',
      fromDate: '',
      toDate: '',
      stepIndex: 0,
      finished: false,
      reason: '',
      submit: true,
      days: 0,
      cadet: {},
      role: 'candidate',
      cadets: [],
      type: 'no',
      slideIndex: 0,
      result: 'rejected',
      WaveIds: [],
      cadetsOfWave: [],
      cadetsEmail: [],
      WaveID: '',
      Date: '',
      startDate: '',
      endDate: '',
      CadetEmail: '',
      future: false,
      admin: [],
      email: '',
      Course: []
    }
    this.handleSelect = this.handleSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleReasonChange = this.handleReasonChange.bind(this);
    this.renderStepActions = this.renderStepActions.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.getCadet = this.getCadet.bind(this);
    this.updateabsentees = this.updateabsentees.bind(this);
    this.getRole = this.getRole.bind(this);
    this.getAbsentees = this.getAbsentees.bind(this);
    this.updateAttendance = this.updateAttendance.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.cancelLeave = this.cancelLeave.bind(this);
    this.getWaveId = this.getWaveId.bind(this);
    this.onWaveIdChange = this.onWaveIdChange.bind(this);
    this.getWaveSpecificCandidates = this.getWaveSpecificCandidates.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.updatePresent = this.updatePresent.bind(this);
    this.handlePresent = this.handlePresent.bind(this);
    this.getUser = this.getUser.bind(this);
    this.getWaveCandidates = this.getWaveCandidates.bind(this);
    this.closeDeleteDialog = this.closeDeleteDialog.bind(this);
    this.getAdmin = this.getAdmin.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.pushNotification = this.pushNotification.bind(this);
  }

  componentWillMount() {
    this.getRole();
  }

  getRole() {
    let th = this
    Request.get('/dashboard/userrole').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({role: res.body})
        if (th.state.role === 'candidate') {
          th.getCadet();
          th.getUser();
          th.getAdmin();
        } else {
          th.getAbsentees();
        }
      }
    })
  }

  updatePresent(email, date, type) {
    console.log(date);
    if(type === 'present') {
    let th = this
    Request.post('/dashboard/present').set({'Authorization': localStorage.getItem('token')}).send({email: email, id: date, Date: th.state.Date}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        let cadet = th.state.cadetsOfWave.filter(function(cadet) {
          return cadet.email === email;
        });
        cadet[0].DaysPresent.push(th.state.Date);
        cadet[0].DaysAbsent = cadet[0].DaysAbsent.filter(function(cadets, key) {
          return date != cadets._id
        })
        th.setState({cadet: cadet[0]})
      }
    })
  }
  else if(type === 'absent') {
    let th = this
    let details = {
      fromDate: th.state.Date,
      toDate: th.state.Date,
      approved: 'yes',
      leaveType: 'absent',
      reason: 'absent'
    }
    Request.post('/dashboard/absent').set({'Authorization': localStorage.getItem('token')}).send({email: email, details: details, Date: date}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.getWaveSpecificCandidates(th.state.WaveId);
      }
    })
  }
}

  onWaveIdChange(e) {
    this.setState({WaveId: e.target.textContent})
    this.getWaveSpecificCandidates(e.target.textContent);
  }

  getWaveSpecificCandidates(waveId) {
    let th = this;
    let candidateName = [];
    let candidateID = [];
    let wave = waveId.split('(')[0].trim();
    let course = waveId.split('(')[1].split(')')[0];
    Request.get('/dashboard/wavespecificcandidates?waveID=' + wave + '&course=' + course).set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      let cadetsEmail = res.body.data.map(function(cadet) {
        return cadet.EmailID;
      })
      th.setState({cadetsEmail: cadetsEmail})
      console.log(cadetsEmail);
      th.getWaveCandidates(cadetsEmail)
    })
  }

  getWaveCandidates(emailArray) {
    let th = this;
    Request.post('/dashboard/getwavecandidates')
    .set({'Authorization': localStorage.getItem('token')})
    .send({email:emailArray})
    .end(function(err, res) {
      if (err)
        console.log(err);
      else {
        console.log(res.body.data)
        th.setState({
          cadetsOfWave: res.body.data
        })
      }
    })
  }

  getAbsentees() {
    let th = this
    Request.get('/dashboard/getabsentees').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({cadets: res.body})
      }
    })
  }

  getCadet() {
    let th = this;
    Request.get('/dashboard/getwaveofcadet').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        console.log(res.body);
        th.setState({
            CadetEmail: res.body.data.EmailID,
            startDate: res.body.data.Wave.StartDate,
            endDate: res.body.data.Wave.EndDate
          })
      }
    })
  }

  getUser() {
    let th = this;
    Request.get('/dashboard/cadet').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        console.log(res.body);
        th.setState({
            cadet: res.body
          })
          console.log('done')
      }
    })
  }

    getAdmin() {
  		let th = this;
  		Request
  			.get('/admin/users')
  			.set({'Authorization': localStorage.getItem('token')})
  			.end(function(err, res) {
  				if(err)
  		    	console.log(err);
  		    else {
  		    	let users = res.body.filter(function(user) {
  		    		return user.role == 'sradmin'
  		    	})
  		    	th.setState({
  		    		admin: users,
              email: users[0].email
  		    	})
  		    }
  		  })
  	}

    handleEmailChange(event, key, val) {
  		this.setState({
  			email: val
  		})
  	}

  updateabsentees() {
    let th = this;
    Request.post('/dashboard/updateabsentees').set({'Authorization': localStorage.getItem('token')}).send({
      details: {
        fromDate: th.state.fromDate,
        toDate: th.state.toDate,
        approved: 'no',
        leaveType: th.state.leaveType,
        reason: th.state.reason
      },
      absentee: th.state.cadet.email
    }).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.getCadet();
        th.getUser();
        let timestamp = new Date()
        let email = th.state.email;
        let message = `${th.state.cadet.name} applied leave|${timestamp}`;
        th.pushNotification(email, message);
        let socket = io()
        socket.emit('approval sent', {notification: message, to: email})
      }
    })
  }

  pushNotification(to, message) {
    console.log('push notification called: ', to , ' -- ', message)
    let th = this
    Request
      .post('/dashboard/addnotification')
      .set({'Authorization': localStorage.getItem('token')})
      .send({to: to, message: message})
      .end(function(err, res){
        console.log('Notification pushed to server', res)
      })
  }

  handleSelect(range) {

    if(range.startDate._d < new Date() && this.formatDate(range.startDate)!=this.formatDate(new Date()))
    {
      let day = range.endDate._d - new Date();
      day = day / 1000;
      day = Math.floor(day / 86400) + 1;
      this.setState({future: true, days: day})
      return range.startDate._d = new Date()
    }
    else if(range.endDate._d > new Date(this.state.endDate) || range.startDate._d > new Date(this.state.endDate)) {
      if(range.endDate._d > new Date(this.state.endDate)) {
        let day = new Date(this.state.endDate) - range.startDate._d;
        day = day / 1000;
        day = Math.floor(day / 86400) + 1;
        this.setState({future: true, days: day})
        return range.endDate._d = new Date(this.state.endDate)
      }
      else {
        let day = range.endDate._d - new Date();
        day = day / 1000;
        day = Math.floor(day / 86400) + 1;
        this.setState({future: true, days: day})
        return range.startDate._d = new Date()
      }
    }
    else {
      let day = range.endDate._d - range.startDate._d;
      day = day / 1000;
      day = Math.floor(day / 86400) + 1;
      this.setState({fromDate: range.startDate._d, toDate: range.endDate._d, days: day})
    }
  }

  handleChange(event, index, value) {
    this.setState({leaveType: value});
  }

  handleChangeTab(value) {
    if (value == 1) {
      this.setState({slideIndex: value, type: 'rejected', result: 'closed'});
    } else if (value == 0) {
      this.setState({slideIndex: value, type: 'no', result: 'rejected'})
    } else {
      this.setState({slideIndex: value})
      if (this.state.role !== 'candidate')
        this.getWaveId();
      }
    };

  getWaveId() {
    let th = this
    Request.get('/dashboard/waveids').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      let wave = [];
      let course = [];
      res.body.waveids.map(function (waveDetails) {
        wave.push(waveDetails.waveID);
        course.push(waveDetails.course);
      })
      th.setState({
        WaveIds: wave,
        Course: course
      })
    })
  }

  handleReasonChange(event) {
    this.setState({reason: event.target.value, submit: false})
  }

  handleNext() {
    const {stepIndex} = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2
    });
    if (stepIndex >= 2) {
      this.updateabsentees();
    }
  };

  updateAttendance(id, approval, cadet, detailID) {
    let th = this;
    Request.post('/dashboard/updateapproval').set({'Authorization': localStorage.getItem('token')}).send({id: id, approval: approval}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        let cadets = th.state.cadets;
        cadets[cadet].DaysAbsent[detailID].approved = approval;
        th.setState({cadets: cadets})
        let message = '';
        if(approval == 'yes') {
          message = 'Leave has been approved'
        }
        else if(approval == 'rejected') {
          message = 'Leave has been rejected'
        }
        th.pushNotification(cadets[cadet].email, message)
      }
    })
  }

  handlePrev() {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({
        stepIndex: stepIndex - 1
      });
    }
  };

  formatDate(date) {
    return Moment(date).format("MMM Do YYYY");
  }

  renderStepActions(step) {
    const {stepIndex} = this.state;
    return (
      <div style={{
        margin: '12px 0'
      }}>
        <RaisedButton label={stepIndex === 2
          ? 'Submit'
          : 'Next'} disableTouchRipple={true} disableFocusRipple={true} primary={true} disabled={this.state.submit} onTouchTap={this.handleNext} style={{
          marginRight: 12
        }}/> {step > 0 && (<FlatButton label="Back" disabled={stepIndex === 0} disableTouchRipple={true} disableFocusRipple={true} onTouchTap={this.handlePrev}/>)}
      </div>
    );
  }

  cancelLeave(index, date) {
    let th = this
    console.log(date);
    Request.post('/dashboard/cancelleave').set({'Authorization': localStorage.getItem('token')}).send({id: date}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        let cadet = th.state.cadet;
        cadet.DaysAbsent = th.state.cadet.DaysAbsent.filter(function(cadets, key) {
          return index != key
        })
        th.setState({cadet: cadet})
      }
    })
  }

  handlePresent(EmpID) {
    let th = this
    Request.post('/dashboard/updatepresent').set({'Authorization': localStorage.getItem('token')}).send({EmployeeID: EmpID}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        let cadet = th.state.cadet;
        cadet.DaysPresent.push(new Date());
        th.setState({cadet: cadet})
      }
    })
  }

  handleDateChange(event, date) {
    let startDate = new Date(date);
    this.setState({Date: date})
  }

  closeDeleteDialog() {
    this.setState({
      future: false
    })
  }

  render() {
    let th = this;
    if (this.state.role === 'candidate') {
      const deleteDialogActions = [
        < FlatButton label = "Cancel" onTouchTap = {
          this.closeDeleteDialog
        }
        style = {
          styles.actionButton
        } />, < FlatButton label = "Okay" onTouchTap = {
          this.closeDeleteDialog
        }
        onClick = {
          this.closeDeleteDialog
        }
        style = {
          styles.actionButton
        } />
      ]
      const {finished, stepIndex} = this.state;
      if (th.state.cadet != null) {
        let attendance = '';
        let mark = true;
        let today = this.formatDate(new Date());
        if((new Date() > new Date(th.state.startDate)) && (new Date() < new Date(th.state.endDate)))
        {
        let todayAttendance = false;
        this.state.cadet.DaysPresent.map(function(date) {
          if (today === th.formatDate(date))
            todayAttendance = true;
          }
        )
        this.state.cadet.DaysAbsent.map(function(details) {
          if ((new Date(details.fromDate) <= new Date()) && (new Date(details.toDate) >= new Date()))
            attendance = (
              <h2>You are on leave.Please contact admin for further approval</h2>
            )
        })
        if (attendance === '') {
          if (todayAttendance) {
            attendance = (
              <h2>You have marked today's attendance... For updation contact StackRoute Admin</h2>
            )
          } else {
            attendance = (
              <div>
                <h2>Do you wish to mark today's attendance
                </h2>
                <FlatButton label="Yes" onTouchTap={this.handlePresent.bind(this, this.state.cadet.EmployeeID)} primary={true}/></div>
            )
          }
        }
        }
        else {
          mark = false;
          attendance = (<h2 style={{marginLeft:'100px', color: 'green'}}><br/>Attendance can be marked only during the training.</h2>)
        }
        return (
          <div>
            <h1 style={styles.content}>ATTENDANCE</h1>
            {!mark && attendance}
            {mark && <Tabs onChange={this.handleChangeTab} value={this.state.slideIndex}>
              <Tab label="Apply Leave" value={0}>
                <Stepper activeStep={stepIndex} orientation="vertical" style={styles.content}>
                  <Step>
                    <StepLabel>Leave Details and Reason</StepLabel>
                    <StepContent>
                      <SelectField floatingLabelText="Leave Type" value={this.state.leaveType} onChange={this.handleChange}>
                        <MenuItem value={'Personal Leave'} primaryText="Personal Leave"/>
                        <MenuItem value={'Sick Leave'} primaryText="Sick Leave"/>
                      </SelectField>
                      <br/>
                      <h5>Reason:</h5>
                      <TextField hintText="Reason for leave" multiLine={true} value={this.state.reason} onChange={this.handleReasonChange}/> {this.renderStepActions(0)}
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel>Select DateRange</StepLabel>
                    <StepContent>
                      <p style={{color:'red'}}><b>Leave can be applied only for future dates(within the training period).</b></p>
                      <DateRange onInit={this.handleSelect} onChange={this.handleSelect}/>
                      <h3>Number of Days:{this.state.days}</h3>
                      {this.renderStepActions(1)}
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel>Approval</StepLabel>
                    <StepContent>
                      <SelectField
                       value={this.state.email}
                       onChange={this.handleEmailChange}
                       floatingLabelText="Notify to..."
                       fullWidth={true}
                     >
                       {
                         th.state.admin.map((user, i) => {
                           return (
                             <MenuItem key={i} value={user.email} primaryText={user.email} />
                           )
                         })
                       }
                     </SelectField>
                      <h4>Sure to submit for Approval?</h4>
                      {this.renderStepActions(2)}
                    </StepContent>
                  </Step>
                </Stepper>
                {finished && (
                  <p style={{
                    margin: '20px 0',
                    textAlign: 'center'
                  }}>
                    Leave submitted wait for Approval
                  </p>
                )}</Tab>
              <Tab label="Cancel Leave" value={1}>
                <Table fixedHeader={true}>
                  <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                      <TableHeaderColumn>From Date</TableHeaderColumn>
                      <TableHeaderColumn>To Date</TableHeaderColumn>
                      <TableHeaderColumn>Reason</TableHeaderColumn>
                      <TableHeaderColumn>Cancel</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody displayRowCheckbox={false} showRowHover={true}>
                    {th.state.cadet.DaysAbsent.map(function(dates, index) {
                      if(new Date(dates.fromDate) > new Date() || (th.formatDate(dates.fromDate) === th.formatDate(new Date()) && dates.reason !== 'absent'))
                      return (
                          <TableRow>
                            <TableRowColumn>{th.formatDate(dates.fromDate)}</TableRowColumn>
                            <TableRowColumn>{th.formatDate(dates.toDate)}</TableRowColumn>
                            <TableRowColumn>{dates.reason}</TableRowColumn>
                            <TableRowColumn>
                              <IconButton tooltip="Cancel" onClick={th.cancelLeave.bind(this, index, dates)}>
                                <RejectIcon color={red500}/>
                              </IconButton>
                            </TableRowColumn>
                          </TableRow>
                        )
                    })
}
                  </TableBody>
                </Table>
              </Tab>
            </Tabs>
          }
          <Dialog bodyStyle={styles.deleteDialog} actionsContainerStyle={styles.actionsContainer} actions={deleteDialogActions} modal={false} open={th.state.future} onRequestClose={this.closeDeleteDialog}>
            Leave can be applied only for future dates.
            Within the Training Period.
          </Dialog>
          </div>
        )
      } else {
        return (
          <h3>Loading...</h3>
        )
      }
    } else {
      let leaveno = 1;
      let rowno = 0;
      let row = 0;
      let cadetsLength = th.state.cadets.length;
      let table = (
        <Table fixedHeader={true}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Leave No</TableHeaderColumn>
              <TableHeaderColumn>Cadet Name</TableHeaderColumn>
              <TableHeaderColumn>Leave Type</TableHeaderColumn>
              <TableHeaderColumn>From Date</TableHeaderColumn>
              <TableHeaderColumn>To Date</TableHeaderColumn>
              <TableHeaderColumn>Reason</TableHeaderColumn>
              <TableHeaderColumn>Approve</TableHeaderColumn>
              <TableHeaderColumn>Reject</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false} showRowHover={true}>
            {this.state.cadets.map(function(cadets, index) {
              return (cadets.DaysAbsent.map(function(details, key) {
                if (details.approved === th.state.type) {
                  return (
                    <TableRow>
                      <TableRowColumn>{leaveno++}</TableRowColumn>
                      <TableRowColumn>{cadets.email.split('.')[0]}</TableRowColumn>
                      <TableRowColumn>{details.leaveType}</TableRowColumn>
                      <TableRowColumn>{th.formatDate(details.fromDate)}</TableRowColumn>
                      <TableRowColumn>{th.formatDate(details.toDate)}</TableRowColumn>
                      <TableRowColumn style={styles.row}>
                        <p title={details.reason}>{details.reason}</p>
                      </TableRowColumn>
                      <TableRowColumn>
                        <IconButton tooltip="Approve" onClick={th.updateAttendance.bind(th, details._id, 'yes', index, key)}>
                          <ApproveIcon color={green500}/>
                        </IconButton>
                      </TableRowColumn>
                      <TableRowColumn>
                        <IconButton tooltip="Reject" onClick={th.updateAttendance.bind(th, details._id, th.state.result, index, key)}>
                          <RejectIcon color={red500}/>
                        </IconButton>
                      </TableRowColumn>
                    </TableRow>
                  )
                } else {
                  rowno++;
                  return false;
                }

              }))
            })}
          </TableBody>
        </Table>
      )
      return (
        <div>
            <Tabs onChange={this.handleChangeTab} value={this.state.slideIndex}>
            <Tab label="Approve Leaves" value={0}>
              {table}</Tab>
            <Tab label="Rejected Leaves" value={1}>
              {table}</Tab>
            <Tab label="Update Attendance" value={2}>
              <DatePicker hintText="Date to be updated" floatingLabelText='Date' errorText={this.state.StartDateErrorText} value={this.state.Date} onChange={this.handleDateChange}/>
              <SelectField onChange={th.onWaveIdChange} floatingLabelText="Select WaveID" value={th.state.WaveId}>
                {th.state.WaveIds.map(function (val, key) {
                  return <MenuItem key={key} value={val + ' (' + th.state.Course[key] + ')'} primaryText={val + ' (' + th.state.Course[key] + ')'}/>
                })
}
              </SelectField>
              <Table fixedHeader={true}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn>EmployeeName</TableHeaderColumn>
                    <TableHeaderColumn>Present</TableHeaderColumn>
                    <TableHeaderColumn>Absent</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} showRowHover={true}>
                  {th.state.cadetsOfWave.map(function(cadet, index) {
                    let absent = "#f20404";
                    let present = "grey";
                    let date = '';
                    let value = "present"
                    cadet.DaysAbsent.map(function(details) {
                      if ((th.formatDate(new Date(details.fromDate)) <= th.formatDate(new Date(th.state.Date))) && ((new Date(details.toDate) >= new Date(th.state.Date)) || (th.formatDate(new Date(details.fromDate)) === (th.formatDate(new Date(details.toDate)))))) {
                        present = "grey"
                        absent = "#f20404"
                        date = details
                        value = "present"
                      }
                    })
                    cadet.DaysPresent.filter(function(detail) {
                      if (th.formatDate(detail) === th.formatDate(th.state.Date)) {
                      absent = "grey"
                        present = "#55ea0b"
                        date = detail
                        value = "absent"
                      }
                    })
                    return (
                      <TableRow>
                        <TableRowColumn>
                          {cadet.email.split('.')[0]}
                        </TableRowColumn>
                        <TableRowColumn>
                          <IconButton tooltip="Present" onClick={th.updatePresent.bind(this, cadet.email, date, value)}>
                            <ApproveIcon color={present} viewBox='0 0 20 20'/>
                          </IconButton>
                        </TableRowColumn>
                        <TableRowColumn>
                          <IconButton tooltip="Reject" onClick={th.updatePresent.bind(this, cadet.email, date, value)}>
                            <RejectIcon color={absent}  viewBox='0 0 20 20'/>
                          </IconButton>
                        </TableRowColumn>
                      </TableRow>
                    )
                  })
}
                </TableBody>
              </Table>
            </Tab>
            <Tab label="View Attendance" value={3}>
              <Calendar/>
            </Tab>
          </Tabs>
        </div>
      )
    }
  }
}
