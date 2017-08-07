import React from 'react';
import StarRating from 'react-stars';
import Request from 'superagent';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';
import {Grid, Row, Col} from 'react-flexbox-grid';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import CONFIG from '../../config/index';

let FEEDBACK = CONFIG.FEEDBACK;

const StarsComponent = React.createClass({
  render: function() {
    let extraStars = [];
    for(let i=this.props.count; i>1; i--)
    extraStars.push(<span style={{color: '#00BCD4', fontSize: '28px'}} key={i}>{'\u263B'}</span>)

    return (
      <TableRowColumn style={{textAlign: 'center', color: 'white', backgroundColor: '#202D3E'}}>
        <span style={{color: '#00BCD4', fontSize: '28px'}}>{'\u263B'}</span>
        {extraStars}
      </TableRowColumn>
    )
  }
});

const styles = {
  heading: {
    textAlign: 'center'
  },
  name: {
    color: '#fff',
    background: '#555',
    textAlign: 'center'
  },
  submit: {
    textAlign: 'center',
    marginBottom: 20
  },
  table: {
    border: '3px solid black',
    marginLeft: '200px',
    width: '820px'
  }
}

export default class Feedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cadet: {},
      relevance: [],
      training: [],
      confidence: [],
      mentors: [],
      facilities: [],
      overall: [],
      mostLiked: '',
      leastLiked: '',
      open: false,
      buttonDisabled: false,
      verify: false,
      oldFeedback: false
    }
    this.getCadet = this.getCadet.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMostLikedChange = this.handleMostLikedChange.bind(this);
    this.handleLeastLikedChange = this.handleLeastLikedChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.saveFeedback = this.saveFeedback.bind(this);
    this.getFeedback = this.getFeedback.bind(this);
    this.getFeedbackFields = this.getFeedbackFields.bind(this);
  }

  componentWillMount() {
    this.getCadet();
    this.setState({
      relevance: [0, 0, 0, 0, 0],
      training: [0, 0, 0, 0],
      mentors: [0, 0, 0, 0, 0],
      facilities: [0, 0, 0, 0],
      overall: [0, 0, 0]
    });
  }

  getCadet() {
    let th = this;
    Request.get('/dashboard/getwaveofcadet').set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        th.setState({cadet: res.body.data});
        th.getFeedbackFields(res.body.data.Wave);
        th.getFeedback(res.body.data.EmployeeID);
        console.log('getCadet: ', res.body.data);
      }
    })
  }

  getFeedbackFields(wave) {
		let th = this;
    let waveID = wave.WaveID;
    let course = wave.CourseName;
		console.log('should get feedback fields for ', waveID);
		Request
			.get('/dashboard/courseforwave')
			.set({'Authorization': localStorage.getItem('token')})
			.query({waveID: waveID, course: course})
			.end(function(err, res){
				if(err)
					console.log('Error in fetching feedback fields: ', err)
				else {
					// configuring the course specific feedback data
          FEEDBACK.CATEGORIES[2].options = res.body.FeedbackFields;
          let confidence = [];
          res.body.FeedbackFields.map(function() {
            confidence.push(0)
          });
          th.setState({
            confidence: confidence
          });
				}
			});
	}

  getFeedback(empID) {
    let th = this;
    Request.get(`/dashboard/getfeedback?empID=${empID}`).set({'Authorization': localStorage.getItem('token')}).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        console.log('Feedback saved successfully', res.body.length);
        if(res.body.length > 0)
        {
        th.setState({
          buttonDisabled: true,
          invalidData: true,
          relevance: res.body[0].relevance,
          training: res.body[0].training,
          confidence: res.body[0].confidence,
          mentors: res.body[0].mentors,
          facilities: res.body[0].facilities,
          overall: res.body[0].overall,
          mostLiked: res.body[0].mostLiked,
          leastLiked: res.body[0].leastLiked,
          oldFeedback: true
        })
      }
      }
    })
  }

  saveFeedback(feedbackObj) {
    let th = this;
    Request.post('/dashboard/savefeedback').set({'Authorization': localStorage.getItem('token')}).send(feedbackObj).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        console.log('Feedback saved successfully', res.body);
        th.setState({open: true})
      }
    })
  }

  getInitialState() {
    return {invalidData: true}
  }

  componentWillUpdate(nextProps, nextState) {
    nextState.invalidData = !(nextState.mostLiked.trim() != '' && nextState.leastLiked.trim() != '');
  }

  handleChange(val, type, key) {
    let temp = this.state[type];
    temp[key] = val;
    console.log('type: ', [type])
    this.setState({[type]: temp})
    console.log('state: ', this.state)
  }

  handleMostLikedChange(event) {
    this.setState({mostLiked: event.target.value})
  }
  handleLeastLikedChange(event) {
    this.setState({leastLiked: event.target.value})
  }

  handleSubmit() {
    let th = this;
    if(th.state.relevance.indexOf(0) != -1 || th.state.training.indexOf(0) != -1 || th.state.confidence.indexOf(0) != -1 || th.state.mentors.indexOf(0) != -1 || th.state.facilities.indexOf(0) != -1 || th.state.overall.indexOf(0) != -1) {
      this.setState({
        verify: true
      });
    }
    else {
    let feedbackObj = {};
    feedbackObj.cadetID = this.state.cadet.EmployeeID;
    feedbackObj.cadetName = this.state.cadet.EmployeeName;
    feedbackObj.waveID = this.state.cadet.Wave.WaveID + ' (' + this.state.cadet.Wave.CourseName + ')';
    feedbackObj.relevance = this.state.relevance;
    feedbackObj.training = this.state.training;
    feedbackObj.confidence = this.state.confidence;
    feedbackObj.mentors = this.state.mentors;
    feedbackObj.facilities = this.state.facilities;
    feedbackObj.overall = this.state.overall;
    feedbackObj.mostLiked = this.state.mostLiked;
    feedbackObj.leastLiked = this.state.leastLiked;
    this.saveFeedback(feedbackObj);
    this.setState({
      buttonDisabled: true
    });
    }
  }

  render() {
    let th = this;
    return (
      <div>
        <h3 style={styles.heading}>
          Feedback Form
        </h3>
        <Grid>
          <Row>
            <Col md={8} mdOffset={2} style={styles.name}>
              <h3>{this.state.cadet.EmployeeName}</h3>
              {
                th.state.oldFeedback && <p style={{color: '#00BCD4'}}> You have already filled your feedback...</p>
              }
            </Col>
          </Row>
          <br/>
          <Table selectable={false} multiSelectable={false} style={styles.table} fixedHeader={false}>
            <TableHeader
            displaySelectAll={false} adjustForCheckbox={false}
            enableSelectAll={false} style={{textAlign: 'center'}}>
              <TableRow style={{textAlign: 'center', backgroundColor: '#202D3E'}}>
                <TableHeaderColumn style={{width: '110px', textAlign: 'center'}}>
                STRONGLY DISAGREE</TableHeaderColumn>
                <TableHeaderColumn style={{width: '80px', textAlign: 'center'}}>
                DISAGREE</TableHeaderColumn>
                <TableHeaderColumn style={{width: '110px', textAlign: 'center'}}>
                SOMEWHAT</TableHeaderColumn>
                <TableHeaderColumn style={{width: '120px', textAlign: 'center'}}>
                AGREE</TableHeaderColumn>
                <TableHeaderColumn style={{textAlign: 'center'}}>
                STRONGLY AGREE</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              <TableRow>
                <StarsComponent count={1}/>
                <StarsComponent count={2}/>
                <StarsComponent count={3}/>
                <StarsComponent count={4}/>
                <StarsComponent count={5}/>
              </TableRow>
            </TableBody>
          </Table>

          {
            FEEDBACK.CATEGORIES.map(function(item, key) {
            return (
              <div key={key}>
                <Row><Col md={8} mdOffset={2}><h4>{item.alias}</h4></Col></Row>
                {
                  item.options.map(function(option, index) {
                    return (
                      <Row key={index}>
                        <Col md ={6} mdOffset={2} style={{marginTop: 10}}>
                          {index + 1}. {option}
                        </Col>
                        <Col md={2}>
                          <StarRating
                            color1={'#DDDDDD'}
                            color2={'#00BCD4'}
                            half={false} size={30} char={'\u263B'}
                            value={th.state[item.type][index]}
                            onChange={(newVal) => th.handleChange(newVal, item.type, index)}
                          />
                          {
                            th.state.verify && th.state[item.type][index] == 0
                            && <span style={{color: '#DD0000'}}>Please provide a rating</span>
                          }
                        </Col>
                      </Row>
                    )
                  })
                }
              </div>
            )})
          }
          <Row><Col md={8} mdOffset={2}><h4>YOUR COMMENTS</h4></Col></Row>
          <Row><Col md={8} mdOffset={2}>
              <TextField
                floatingLabelText={'Things you liked most about the program -- chars left: ' + (350 - th.state.mostLiked.length)}
                multiLine={true}
                rows={3}
                rowsMax={3}
                fullWidth={true}
                value={this.state.mostLiked}
                onChange={this.handleMostLikedChange}
                disabled={th.state.oldFeedback}
                maxLength="350" />
          </Col></Row>

          <Row><Col md={8} mdOffset={2}>
              <TextField
                floatingLabelText={'Things you liked least about the program -- chars left: ' + (350 - th.state.leastLiked.length)}
                multiLine={true}
                rows={3}
                rowsMax={3}
                fullWidth={true}
                value={this.state.leastLiked}
                onChange={this.handleLeastLikedChange}
                disabled={th.state.oldFeedback}
                maxLength="350" />
          </Col></Row>

          <Row><Col md={8} mdOffset={2} style={styles.submit}>
              <RaisedButton style={{width: '100%'}} label="Submit Feedback" primary={true} onClick={this.handleSubmit} disabled={this.state.buttonDisabled || this.state.invalidData}/>
              <Snackbar open={this.state.open} message="Feedback submitted" autoHideDuration={2000}/>
          </Col></Row>
        </Grid>
      </div>
    )
  }
}
