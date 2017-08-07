import React from 'react';
import Request from 'superagent';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import Moment from 'moment';

export default class Attendance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waveObject: {},
      WaveIds: [],
      WaveId: '',
      cadetsOfWave: [],
      cadetsEmail: [],
      Cadet: {},
      CadetName: '',
      Course: []
    }
    this.waveDetails = this.waveDetails.bind(this);
    this.onWaveIdChange = this.onWaveIdChange.bind(this);
    this.getWaveId = this.getWaveId.bind(this);
    this.getWaveSpecificCandidates = this.getWaveSpecificCandidates.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.format = this.format.bind(this);
    this.formatMonth = this.formatMonth.bind(this);
    this.onCadetChange = this.onCadetChange.bind(this);
    this.getWaveCandidates = this.getWaveCandidates.bind(this);
  }

  componentWillMount() {
    this.getWaveId();
  }

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

  onWaveIdChange(e) {
    this.setState({WaveId: e.target.textContent,Cadet: {}});
    this.waveDetails(e.target.textContent);
    this.getWaveSpecificCandidates(e.target.textContent);
  }

  onCadetChange(e, prop, value) {
    let th = this
    let cadetName = value
    let index = 0
    value = value.split('(');
    value = value[1].split(')');
    let cadet = th.state.cadetsOfWave.filter(function(cadet , key) {
      if(cadet.email == value[0].trim())
      {
        index = key
      }
      return cadet.email == value[0].trim()
    })
    console.log(cadet);
    this.setState({
      Cadet: cadet,
      CadetName: cadetName
    })
  }

  waveDetails(waveID) {
    let th = this;
    let wave = waveID.split('(')[0].trim();
    let course = waveID.split('(')[1].split(')')[0];
    Request.get(`/dashboard/wave?waveid=${wave}&course=${course}`).set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      th.setState({waveObject: res.body})
    })
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
    th.setState({
      cadetsEmail: cadetsEmail
    })
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


  formatMonth(date) {
    return Moment(date).format("MMM");
  }

  formatDate(date) {
    return Moment(date).format("DD")
  }

  format(date) {
    return Moment(date).format("MMM Do YYYY");
  }

  render() {
    let th = this;
    let week = [];
    let dayName = [];
    let name = [];
    if (th.state.waveObject != null) {
      let now = Moment(th.state.waveObject.EndDate);
      let daysOfYear = [];
      let day = new Date(th.state.waveObject.StartDate).getDay();
      dayName = [ <TableHeaderColumn><b style={{fontSize:'20px'}}  disabled='true'>Sunday</b></TableHeaderColumn>,
              <TableHeaderColumn><b style={{fontSize:'20px'}}>Monday</b></TableHeaderColumn>,
              <TableHeaderColumn><b style={{fontSize:'20px'}}>Tuesday</b></TableHeaderColumn>,
              <TableHeaderColumn><b style={{fontSize:'20px'}}>Wednesday</b></TableHeaderColumn>, <TableHeaderColumn><b style={{fontSize:'20px'}}>Thursday</b></TableHeaderColumn>,
              <TableHeaderColumn><b style={{fontSize:'20px'}}>Friday</b></TableHeaderColumn>, <TableHeaderColumn><b style={{fontSize:'20px'}}>Saturday</b></TableHeaderColumn>]
              name = []
      for( let i = day; name.length < dayName.length;) {
        if(i === 6)
        {
          name.push(dayName[i]);
          i=0;
        }
        else {
          name.push(dayName[i]);
          i++;
        }
      }
      for (let d = Moment(th.state.waveObject.StartDate); d <= now; d.add('days',1)) {
        let color = 'white';
        if(th.state.Cadet[0] != undefined) {
        th.state.Cadet[0].DaysPresent.map(function(date){
            if(th.format(date) === th.format(d)) {
              color = '#ccff99'
            }
        })
        this.state.Cadet[0].DaysAbsent.map(function(details) {
          if ((new Date(details.fromDate) <= new Date(d)) && (new Date(details.toDate) >= new Date(d))) {
            color = '#f4b2ad';
          }
        })
        }
        if(new Date(d).getDay() === 0 || new Date(d).getDay() === 6 )
        {
          color = '#F5F5F5'
        }
        if(daysOfYear.length === 0)
        {
            daysOfYear.push(<TableRowColumn style={{backgroundColor:color,fontSize:'17px'}}><sup>{th.formatMonth(d)}</sup>{th.formatDate(d)}</TableRowColumn>);
        }
        else if(th.formatDate(d) == "01")
        {
            daysOfYear.push(<TableRowColumn style={{backgroundColor:color,fontSize:'17px'}}><sup>{th.formatMonth(d)}</sup>{th.formatDate(d)}</TableRowColumn>);
        }
        else {
            daysOfYear.push(<TableRowColumn style={{backgroundColor:color,fontSize:'17px'}}>{th.formatDate(d)}</TableRowColumn>);
        }
      }
      for (let j = 0; j < ((daysOfYear.length / 7) + 1); j++) {
        week.push(
          <TableRow>
            {daysOfYear.filter(function(date, index) {
              return (index < (7 * (j + 1)) && index >= (7 * j));
            })
}
          </TableRow>
        )
      }
    }
    console.log(th.state.waveObject);
    return (
      <div>
        <SelectField onChange={th.onWaveIdChange} floatingLabelText="Select WaveID" value={th.state.WaveId}>
          {th.state.WaveIds.map(function(val, key) {
            return <MenuItem key={key} value={val + ' (' + th.state.Course[key] + ')'} primaryText={val + ' (' + th.state.Course[key] + ')'}/>
          })
}
        </SelectField>
        &nbsp;&nbsp;
        <SelectField onChange={th.onCadetChange} floatingLabelText="Select Cadet" value={th.state.CadetName}>
          {th.state.cadetsOfWave.map(function(val, key) {
            console.log(th.state.CadetName)
            return <MenuItem key={key} value={val.email.split('.')[0] + " ( "+ val.email + " ) "} primaryText={val.email.split('.')[0] + " ( "+ val.email + " ) "}/>
          })
}
        </SelectField>
        <Table fixedHeader={true} height='300px'>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false} style={{backgroundColor:'#EFEBE9'}}>
            <TableRow>
              {name}
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false} showRowHover={true}>
            {week}
          </TableBody>
        </Table>
      </div>
    )
  }
}
