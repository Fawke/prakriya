import React from 'react';
import Request from 'superagent';
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText
} from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import CourseIcon from 'material-ui/svg-icons/action/book';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import AddIcon from 'material-ui/svg-icons/content/add-circle-outline';
import RemoveIcon from 'material-ui/svg-icons/content/remove-circle-outline';
import DateIcon from 'material-ui/svg-icons/action/date-range';
import GroupIcon from 'material-ui/svg-icons/social/group';
import LocationIcon from 'material-ui/svg-icons/communication/location-on';
import Dialog from 'material-ui/Dialog';
import Cadets from './Cadets.jsx';
import {Grid, Row, Col} from 'react-flexbox-grid';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import dialog from '../../styles/dialog.json';
import select from '../../styles/select.json';
import Moment from 'moment';

const styles = {
  text: {
    wordWrap: 'break-word'
  },
  view: {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: 'blue'
  },
  col: {
    marginBottom: 20,
    marginRight: -20,
    width: 150
  },
  grid: {
    width: '100%'
  }
}

export default class WaveCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cadetFetch: false,
      cadets: [],
      dialog: false,
      imageURL: [],
      showDeleteDialog: false,
      openDialog: false,
      wave: {},
      courses: [],
      selectedCourse: '',
      addCadet: false,
      newCadets: [],
      selectedCadets: [],
      cadetsToRemove: [],
      disableSave: true,
      noCadets: false,
      removecadets: false

    }
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleEditWave = this.handleEditWave.bind(this);
    this.getCadets = this.getCadets.bind(this);
    this.openDeleteDialog = this.openDeleteDialog.bind(this);
    this.closeDeleteDialog = this.closeDeleteDialog.bind(this);
    this.handleDeleteWave = this.handleDeleteWave.bind(this);
    this.handleUpdateWave = this.handleUpdateWave.bind(this);
    this.closeUpdateDialog = this.closeUpdateDialog.bind(this);
    this.getCourses = this.getCourses.bind(this);
    this.handleCourseChange = this.handleCourseChange.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.openAddDialog = this.openAddDialog.bind(this);
    this.handleCadetsChange = this.handleCadetsChange.bind(this);
    this.getNewCadets = this.getNewCadets.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.removecadetwave = this.removecadetwave.bind(this);
    this.handleRemoveCadetsChange = this.handleRemoveCadetsChange.bind(this);
    this.handleremovecadets = this.handleremovecadets.bind(this);
  }

  handleEditWave() {
    this.setState({openDialog: true, wave: this.props.wave})
    this.getCourses();
  }

  getCourses() {
    let th = this;
    Request.get('/dashboard/courses').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({courses: res.body, selectedCourse: th.state.wave.Course})
      }
    })
  }

  getNewCadets() {
    let th = this;
    Request.get('/dashboard/newcadets').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        let cadets = res.body;
        if (cadets.length == 0) {
          th.setState({noCadets: true, newCadets: []})
        } else {
          th.setState({newCadets: cadets, noCadets: false})
        }
      }
    })
  }

  formatDate(date) {
    let dateString = Moment(date).format("MMM Do YYYY");
    if (dateString == 'Invalid date')
      return '';
    return Moment(date).format("MMM Do YYYY");
  }

  handleUpdateWave() {
    let wave = {};
    if (this.state.addCadet) {
      wave = this.props.wave;
      this.updateCadets(this.state.selectedCadets);
      this.handleClose();
    }
    if (this.state.openDialog) {
      wave = this.state.wave;
      wave.Course = this.state.selectedCourse;
    }
    this.props.handleUpdate(wave, this.props.wave.CourseName);
    this.closeUpdateDialog();
  }

  updateCadets(cadets) {
    let th = this;
    let wave = this.props.wave.WaveID;
    let course = this.props.wave.CourseName;
    Request.post('/dashboard/updatewavecadets').set({'Authorization': localStorage.getItem('token')}).send({cadets: cadets, waveID: wave, course: course}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.props.getWaves();
      }
    })
  }

  handleDeleteWave() {
    this.props.handleDelete(this.props.wave);
    this.closeDeleteDialog();
  }

  openDeleteDialog() {
    this.setState({showDeleteDialog: true})
  }

  handleCadetsChange(event, key, val) {
    this.setState({selectedCadets: val, disableSave: false})
  }

  handleRemoveCadetsChange(event, key, val) {
    this.setState({cadetsToRemove: val, disableSave: false})
  }

  closeDeleteDialog() {
    this.setState({showDeleteDialog: false})
  }

  closeUpdateDialog() {
    // let cadet = [];
    // if(this.state.addCadet)
    // {
    // 	cadet = this.props.wave.Cadets
    // }
    // else
    // {
    // 	cadet = this.state.wave.Cadets
    // }
    this.setState({openDialog: false, addCadet: false})
  }

  handleOpen() {
    this.setState({cadetFetch: true})
  }

  getCadets(cadets) {
    let th = this;
    Request.post('/dashboard/cadetsofwave').set({'Authorization': localStorage.getItem('token')}).send({waveid: this.props.wave.WaveID, course:this.props.wave.CourseName}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({cadets: res.body, cadetFetch: false, dialog: true})
      }
    })
  }

  handleClose() {
    this.setState({dialog: false, noCadets: false, addCadet: false})
  }

  handleLocationChange(event) {
    let wave = this.state.wave;
    wave.Location = event.target.value
    this.setState({wave: wave})
  }
  handleStartDateChange(event, date) {
    let wave = this.state.wave;
    wave.StartDate = new Date(date);
    wave.EndDate = new Date(date.setDate(date.getDate() + 84));
    this.setState({wave: wave})
  }
  handleEndDateChange(event, date) {
    let wave = this.state.wave;
    wave.EndDate = date;
    this.setState({wave: wave})
  }
  handleCourseChange(event, key, val) {
    this.setState({selectedCourse: val})
  }

  openAddDialog() {
    this.setState({addCadet: true})
    this.getNewCadets();
  }
  removecadetwave() {
    this.setState({removecadets: true})

  }

  handleremovecadets() {
    let th = this;
    let wave = this.props.wave.WaveID;
    let course = this.props.wave.CourseName;
    Request.post('/dashboard/removeCadetFromWave').set({'Authorization': localStorage.getItem('token')}).send({cadets: this.state.cadetsToRemove, waveID: wave, course: course}).end(function(err, res) {
      console.log(res)
      if (err)
        console.log(err);
      else {
        th.handleClose();
        th.props.getWaves();
      }
    })
  }

  render() {
    let startdate = new Date(this.props.wave.StartDate);
    startdate = startdate.getFullYear() + '/' + (startdate.getMonth() + 1) + '/' + startdate.getDate();
    let enddate = new Date(this.props.wave.EndDate);
    enddate = enddate.getFullYear() + '/' + (enddate.getMonth() + 1) + '/' + enddate.getDate();
    let th = this
    let title = 'CADETS'
    if (th.props.wave.Cadets !== undefined) {
      title = ('CADETS - (' + th.props.wave.Cadets + ')')
    }
    const deleteDialogActions = [ < FlatButton label = "Cancel" primary = {
        true
      }
      onTouchTap = {
        this.closeDeleteDialog
      }
      style = {
        dialog.actionButton
      } />, < FlatButton label = "Delete" primary = {
        true
      }
      onClick = {
        this.handleDeleteWave
      }
      style = {
        dialog.actionButton
      } />
    ]

    const editWave = [ < FlatButton label = "Cancel" primary = {
        true
      }
      onTouchTap = {
        this.closeUpdateDialog
      }
      style = {
        dialog.actionButton
      } />, < FlatButton label = "Update" primary = {
        true
      }
      onClick = {
        this.handleUpdateWave
      }
      style = {
        dialog.actionButton
      } />
    ]
    let view = 'inline'
    if (this.state.addCadet) {
      view = 'none'
    }
    let bgColor = this.props.bgColor;
    let bgIcon = this.props.bgIcon;
    return (
      <div>
        <Card style={{
          width: '373px',
          marginRight: '20px',
          marginBottom: '20px',
          background: bgColor
        }}>
          <CardHeader title={< span style = {{fontSize:'20px', position: 'absolute',top: '32%'}} > <b>{this.props.wave.WaveNumber}</b> < /span>} avatar={< Avatar backgroundColor = {
            bgIcon
          } > {
            this.props.wave.WaveID.charAt(0).toUpperCase()
          } < /Avatar>}/>
          <CardText style={styles.text}>
            <IconButton tooltip="Location">
              <LocationIcon/>
            </IconButton>
            <span style={{
              position: 'absolute',
              top: '33%'
            }}>{this.props.wave.Location}</span><br/>
            <IconButton tooltip="Date">
              <DateIcon/>
            </IconButton>
            <span style={{
              position: 'absolute',
              top: '47%'
            }}>{this.formatDate(this.props.wave.StartDate)}
              - {this.formatDate(this.props.wave.EndDate)}</span><br/>
            <IconButton tooltip="Course">
              <CourseIcon/>
            </IconButton>
            <span style={{
              position: 'absolute',
              top: '62%'
            }}>{this.props.wave.Course}</span><br/>
            <IconButton tooltip="Members" onClick={this.handleOpen}>
              <GroupIcon/>
            </IconButton>
            {this.props.wave.Cadets != undefined && <b style={{
              position: 'absolute',
              top: '77%'
            }}>({this.props.wave.Cadets})</b>}
            <IconButton tooltip="Delete Wave" onClick={this.openDeleteDialog} style={{
              float: 'right'
            }}>
              <DeleteIcon/>
            </IconButton>
            <IconButton tooltip="Edit Wave" onClick={this.handleEditWave} style={{
              float: 'right'
            }}>
              <EditIcon/>
            </IconButton>
          </CardText>
        </Card>
        {this.state.cadetFetch && th.getCadets(this.props.wave.Cadets)}
        <Dialog style={styles.dialog} title={title} open={this.state.dialog} autoScrollBodyContent={true} onRequestClose={this.handleClose} actionsContainerStyle={dialog.actionsContainer} bodyStyle={dialog.body} titleStyle={dialog.title}>

          <Grid style={styles.grid}>
            <Row>
              {th.state.cadets.map(function(cadet, index) {
                return (
                  <Col xs={3} key={index} style={styles.col}>
                    <Cadets cadet={cadet}/>
                  </Col>
                )
              })
}
            </Row>
          </Grid>
          <IconButton tooltip="Add Cadet" style={{
            display: view,
            float: 'right'
          }} onClick={this.openAddDialog}>
            <AddIcon/>
          </IconButton>
          <IconButton tooltip="Remove Cadet" style={{
            display: view,
            float: 'right'
          }} onClick={this.removecadetwave}>
            <RemoveIcon/>
          </IconButton>
          {this.state.addCadet && (!this.state.noCadets) && <div>
            <SelectField multiple={true} hintText="Select Cadets" floatingLabelText='Add Cadets' value={this.state.selectedCadets} onChange={this.handleCadetsChange} menuItemStyle={{
              borderTop: '1px solid teal',
              borderBottom: '1px solid teal',
              backgroundColor: '#DDDBF1'
            }} listStyle={select.list} style={{
              width: '100%'
            }} selectedMenuItemStyle={select.selectedMenu}>
              {th.state.newCadets.map(function(cadet, i) {
                return (cadet.Selected != undefined && (cadet.Selected == 'Yes' || cadet.Selected == 'DS') && <MenuItem key={i} insetChildren={true} checked={th.state.selectedCadets && th.state.selectedCadets.includes(cadet.EmployeeID)} value={cadet.EmployeeID} primaryText={`${cadet.EmployeeName} (${cadet.EmployeeID})`}/>)
              })
}
            </SelectField>

            <RaisedButton label="Save Changes" disabled={this.state.disableSave} primary={true} onClick={this.handleUpdateWave}/> {this.state.noCadets && <h3>No Cadets available</h3>
}
          </div>
}
          {this.state.removecadets && <div>
            <SelectField multiple={true} hintText="Select Cadets" floatingLabelText=' Remove Cadets' value={this.state.cadetsToRemove} onChange={this.handleRemoveCadetsChange} menuItemStyle={{
              borderTop: '1px solid teal',
              borderBottom: '1px solid teal',
              backgroundColor: '#DDDBF1'
            }} listStyle={select.list} style={{
              width: '100%'
            }} selectedMenuItemStyle={select.selectedMenu}>
              {this.state.cadets.map(function(cadet, i) {
                return (cadet && <MenuItem key={i} insetChildren={true} checked={th.state.cadetsToRemove && th.state.cadetsToRemove.includes(cadet.EmployeeID)} value={cadet.EmployeeID} primaryText={`${cadet.EmployeeName} (${cadet.EmployeeID})`}/>)
              })
}
            </SelectField>
            <RaisedButton label="Save Changes" disabled={this.state.disableSave} primary={true} onClick={this.handleremovecadets}/> {this.state.cadets.length === 0 && <h3>No Cadets available</h3>}
          </div>
}

        </Dialog>
        <Dialog actions={deleteDialogActions} modal={false} open={this.state.showDeleteDialog} onRequestClose={this.closeDeleteDialog} actionsContainerStyle={dialog.actionsContainer} bodyStyle={dialog.confirmBox}>
          Are you sure you want to delete this Wave?
        </Dialog>
        <Dialog actions={editWave} modal={false} title='EDIT WAVE' open={this.state.openDialog} onRequestClose={this.closeDeleteDialog} titleStyle={dialog.title} bodyStyle={dialog.body} actionsContainerStyle={dialog.actionsContainer}>
          <div>
            <div style={dialog.box50}>
              <TextField floatingLabelText="Wave Name" value={this.state.wave.WaveNumber} fullWidth={true} disabled={true} underlineDisabledStyle={{
                display: 'none'
              }}/>
            </div>
            <div style={dialog.box50}>
              <TextField hintText="Provide the base location" floatingLabelText="Location" value={this.state.wave.Location} onChange={this.handleLocationChange} fullWidth={true}/>
            </div>
          </div>
          <div>
            <div style={dialog.box50}>
              <DatePicker hintText='Start Date' floatingLabelText='Start Date' value={new Date(startdate)} onChange={this.handleStartDateChange}/>
            </div>
            <div style={dialog.box50}>
              <DatePicker hintText='End Date' floatingLabelText='End Date' value={new Date(enddate)} onChange={this.handleEndDateChange}/>
            </div>
          </div>
          <div style={dialog.box100}>
            <SelectField hintText="Select Course" floatingLabelText='Course' value={this.state.selectedCourse} onChange={this.handleCourseChange} style={{
              width: '100%'
            }}>
              {this.state.courses.map(function(course, i) {
                return (<MenuItem key={i} insetChildren={true} checked={th.state.selectedCourse && th.state.selectedCourse.includes(course.ID)} value={course.ID} primaryText={course.ID}/>)
              })
}
            </SelectField>
          </div>
        </Dialog>
      </div>
    )
  }
}
