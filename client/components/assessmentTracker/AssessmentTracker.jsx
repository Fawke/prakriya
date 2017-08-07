import React from 'react';
import Request from 'superagent';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {Grid, Row, Col} from 'react-flexbox-grid';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import app from '../../styles/app.json';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

export default class AssessmentTracker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      waves: [],
      wave: '',
      waveCadets: {},
      cadetsOfWave: [],
      assessment: '',
      select: false,
      Assignments: [],
      Course: [],
      implementation: [
        'Understands and implements very well', 'Understands and implements ok', 'Understands but finds it difficult to implement', 'Do not understand and is not able to implement'
      ],
      completion: [
        'Completed with no help', 'Completed with minimal help', 'Completed with lots of help and review', 'Was not able to solve the problem'
      ],
      learning: [
        'High', 'Medium', 'Low'
      ],
      cadetsResult: [],
      update: []
    }

    this.getWaveIDs = this.getWaveIDs.bind(this)
    this.onWaveChange = this.onWaveChange.bind(this)
    this.getWave = this.getWave.bind(this);
    this.getAssessmentTrack = this.getAssessmentTrack.bind(this);
    this.onAssessmentChange = this.onAssessmentChange.bind(this)
    this.onImplementChange = this.onImplementChange.bind(this);
    this.onCompleteChange = this.onCompleteChange.bind(this);
    this.onLearnChange = this.onLearnChange.bind(this);
    this.save = this.save.bind(this);
    this.getCadetsOfWave = this.getCadetsOfWave.bind(this);
  }

  componentWillMount() {
    if (localStorage.getItem('token')) {
      this.getWaveIDs()
    }
  }

  getWaveIDs() {
    let th = this
    Request.get('/dashboard/waveids').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      let wave = [];
      let course = [];
      res.body.waveids.map(function (waveDetails) {
        wave.push(waveDetails.waveID);
        course.push(waveDetails.course);
      })
      th.setState({
        waves: wave,
        Course: course
      })
      console.log(wave);
      console.log(course);
    })
  }

  onWaveChange(e) {
    let th = this
    th.setState({wave: e.target.outerText, assessment: ''})
    this.getWave(e.target.outerText);
    this.getAssessmentTrack(e.target.outerText);
  }

  onAssessmentChange(e) {
    let th = this
    this.getCadetsOfWave(th.state.wave, e.target.outerText);
    th.setState({assessment: e.target.outerText})
  }

  onImplementChange(value, index) {
    let th = this
    let cadetsResult = th.state.cadetsResult;
    cadetsResult[index].implement = value
    th.setState({cadetsResult: cadetsResult})
    th.save();
  }

  onCompleteChange(value, index) {
    let th = this
    let cadetsResult = th.state.cadetsResult;
    cadetsResult[index].complete = value
    th.setState({cadetsResult: cadetsResult})
    th.save();
  }

  onLearnChange(value, index) {
    let th = this
    let cadetsResult = th.state.cadetsResult;
    cadetsResult[index].learn = value
    th.setState({cadetsResult: cadetsResult})
    th.save();
  }

  save() {
    let th = this;
    console.log(th.state.cadetsResult);
    let assessmentArray = [];
    th.state.cadetsResult.map(function(cadet) {
      let assessment = {
        EmpID: cadet.EmployeeID,
        assignment: cadet.AssignmentName,
        remarks: {
          implement: cadet.implement,
          complete: cadet.complete,
          learn: cadet.learn
        }
      }
      assessmentArray.push(assessment);
    })
    console.log(assessmentArray);
    Request.post('/dashboard/assessmentdetails').set({'Authorization': localStorage.getItem('token')}).send({assessment: assessmentArray, update: th.state.update}).end(function(err, res) {
        if (err) {
          console.log(err);
        } else {
          let update = th.state.update;
          update.fill(true);
          th.setState({
            update: update
          })
        }
      })
  }

  getWave(waveID) {
    let th = this
    let wave = waveID.split('(')[0].trim();
    let course = waveID.split('(')[1].split(')')[0];
    Request.get(`/dashboard/wave?waveid=${wave}&course=${course}`).set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      th.setState({waveCadets: res.body})
      console.log(res.body);
    })
  }

  getAssessmentTrack(waveID) {
    let th = this
    console.log(waveID);
    let wave = waveID.split('(')[0].trim();
    let course = waveID.split('(')[1].split(')')[0];
    Request.get(`/dashboard/assessment?waveid=${wave}&course=${course}`).set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      th.setState({Assignments: res.body.data, select: true})
    })
  }

  getCadetsOfWave(waveID, assessment) {
    let th = this;
    let candidateName = [];
    let candidateID = [];
    let wave = waveID.split('(')[0].trim();
    let course = waveID.split('(')[1].split(')')[0];
    Request.get(`/dashboard/assessmentandcandidates/${wave}/${assessment}/${course}`).set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      let cadetsResult = [];
      let update = [];
      res.body.data.map(function(candidate) {
        if (candidate.assignment === null) {
          cadetsResult.push({EmployeeID: candidate.cadet.EmployeeID, AssignmentName: assessment, implement: 'Understands and implements very well', complete: 'Completed with no help', learn: 'High'})
          update.push(false);
        } else {
          cadetsResult.push({EmployeeID: candidate.cadet.EmployeeID, AssignmentName: assessment, implement: candidate.assignment.implement, complete: candidate.assignment.complete, learn: candidate.assignment.learn});
          update.push(true);
        }
      })
      th.setState({cadetsOfWave: res.body.data, cadetsResult: cadetsResult, update: update})
    })
  }

  render() {
    let th = this
    return (
      <div>
        <h1 style={app.heading}>Assessment Tracker</h1>
        <Grid>
          <Row>
            <Col md={6}>
              <Paper style={{
                boxSizing: 'border-box',
                padding: '5px'
              }}>
                <SelectField onChange={th.onWaveChange} floatingLabelText="Select Wave" value={th.state.wave}>
                  {th.state.waves.map(function(val, key) {
                    return <MenuItem key={key} value={val + ' (' + th.state.Course[key] + ')'} primaryText={val + ' (' + th.state.Course[key] + ')'}/>
                  })
}
                </SelectField>
                <SelectField onChange={th.onAssessmentChange} floatingLabelText="Select Assessment" value={th.state.assessment}>
                  {th.state.select && th.state.Assignments.map(function(val, key) {
                    return <MenuItem key={key} value={val.Name} primaryText={val.Name}/>
                  })
}
                </SelectField>
              </Paper>
            </Col>
          </Row>
        </Grid>
        <br/>
        <Table width='100%'>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableHeaderColumn style={{
              width: '70px'
            }}>Cadet ID</TableHeaderColumn>
            <TableHeaderColumn style={{
              width: '150px'
            }}>Cadet Name</TableHeaderColumn>
            <TableHeaderColumn style={{
              width: '350px'
            }}>Implementation</TableHeaderColumn>
            <TableHeaderColumn style={{
              width: '350px'
            }}>Completion</TableHeaderColumn>
            <TableHeaderColumn>Learning</TableHeaderColumn>
          </TableHeader>
          <TableBody displayRowCheckbox={false} showRowHover={false}>
            {th.state.assessment && th.state.cadetsOfWave.map(function(cadet, index) {
              return (
                <TableRow>
                  <TableRowColumn style={{
                    width: '70px'
                  }}>{cadet.cadet.EmployeeID}</TableRowColumn>
                  <TableRowColumn style={{
                    width: '150px'
                  }}>{cadet.cadet.EmployeeName}</TableRowColumn>
                  <TableRowColumn style={{
                    width: '350px'
                  }}>
                    <SelectField onChange={(event, key, val) => th.onImplementChange(val, index)} floatingLabelText="Select Implementation" value={th.state.cadetsResult[index].implement} fullWidth='true'>
                      {th.state.implementation.map(function(implement, key) {
                        return <MenuItem key={key} value={implement} primaryText={implement}/>
                      })
}
                    </SelectField>
                  </TableRowColumn>
                  <TableRowColumn style={{
                    width: '350px'
                  }}>
                    <SelectField onChange={(event, key, val) => th.onCompleteChange(val, index)} floatingLabelText="Select Completion" value={th.state.cadetsResult[index].complete} fullWidth='true'>
                      {th.state.completion.map(function(complete, key) {
                        return <MenuItem key={key} value={complete} primaryText={complete}/>
                      })
}
                    </SelectField>
                  </TableRowColumn>
                  <TableRowColumn>
                    <SelectField onChange={(event, key, val) => th.onLearnChange(val, index)} floatingLabelText="Select Learning" value={th.state.cadetsResult[index].learn}>
                      {th.state.learning.map(function(learn, key) {
                        return <MenuItem key={key} value={learn} primaryText={learn}/>
                      })
}
                    </SelectField>
                  </TableRowColumn>
                </TableRow>
              )
            })
}
          </TableBody>
        </Table>
      </div>
    )
  }
}
