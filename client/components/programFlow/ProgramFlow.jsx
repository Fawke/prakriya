import React from 'react'
import Request from 'superagent'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import {Grid, Row, Col} from 'react-flexbox-grid'
import MenuItem from 'material-ui/MenuItem'
import DropDownMenu from 'material-ui/DropDownMenu'
import AutoComplete from 'material-ui/AutoComplete'
import DatePicker from 'material-ui/DatePicker'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import AddIcon from 'material-ui/svg-icons/content/add'
import {Card, CardText, CardHeader} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import {lightBlack} from 'material-ui/styles/colors';
import Schedule from './Schedule.jsx';
import app from '../../styles/app.json';
import Masonry from 'react-masonry-component';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';


const styles = {
  tableHeading: {
    paddingTop: 20,
    paddingBottom: 20,
    background: '#333',
    color: '#eee',
    textAlign: 'center'
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

export default class Wave extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      waves: [],
      waveString: '',
      waveObj: {},
      setState: true
    }

    this.getWaveIDs = this.getWaveIDs.bind(this)
    this.getWave = this.getWave.bind(this)
    this.waveUpdate = this.waveUpdate.bind(this)
    this.onWaveChange = this.onWaveChange.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
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
    })
  }

  getWave(waveId) {
    let th = this
    let wave = waveId.split('(')[0].trim();
    let course = waveId.split('(')[1].split(')')[0];
    Request.get(`/dashboard/waveobject/${wave}/${course}`).set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      th.setState({waveObj: res.body.waveObject, setState: false})
      console.log(th.state.waveObj, "waveobj")
    })
  }

  waveUpdate(waveObj) {
    console.log(this.state.waveString, "waveString")
    let th = this
    let wave = this.state.waveString.split('(')[0].trim();
    let course = this.state.waveString.split('(')[1].split(')')[0];
    Request.post('/dashboard/updatesession').set({'Authorization': localStorage.getItem('token')}).send({wave: waveObj, waveString: wave, course: course}).end(function(err, res) {
      console.log('Wave Updated', waveObj)
      console.log("wave string", th.state.waveString)
    })
  }
  handleDelete(waveObj)
  {
    let th = this;
    let wave = this.state.waveString.split('(')[0].trim();
    let course = this.state.waveString.split('(')[1].split(')')[0];
    Request.post('/dashboard/deleteSession').set({'Authorization': localStorage.getItem('token')}).send({wave: waveObj, waveString: wave, course: course}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.getWave(th.state.waveString);
      }
    })
  }
  onWaveChange(e) {
    this.setState({waveString: e.target.outerText, waveObj: {}})
    this.getWave(e.target.outerText)
  }

  render() {
    let th = this
    console.log(th.state.waves)
    console.log(this.state.waveObj)
    return (
      <div>
        <h1 style={app.heading}>Program Flow</h1>


              <SelectField onChange={th.onWaveChange} floatingLabelText="Select Wave" value={th.state.waveString}>
                {th.state.waves.map(function(val, key) {
                  return <MenuItem key={key} value={val + ' (' + th.state.Course[key] + ')'} primaryText={val + ' (' + th.state.Course[key] + ')'}/>
                })
        }
              </SelectField>
              <Masonry
      					className={'my-class'}
      					elementType={'ul'}
      					options={masonryOptions}
      					style={styles.masonry}
      				>
      				{th.state.setState === false  && (th.state.waveObj).length !== 0  && th.state.waveObj.result.map(function(session, i) {
            return (<Schedule wave={session} key={i} handleWaveUpdate={th.waveUpdate} handleDelete={th.handleDelete}
              bgColor={backgroundColors[i%4]}
              bgIcon={backgroundIcons[i%4]}
            />)
          })
          }
          </Masonry>
</div>

    )

  }
}
