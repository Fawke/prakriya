import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import SkillsIcon from 'material-ui/svg-icons/action/stars';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import app from '../../styles/app.json';
import dialog from '../../styles/dialog.json';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import AddIcon from 'material-ui/svg-icons/content/add-circle-outline';
import IconButton from 'material-ui/IconButton';
import Request from 'superagent';
import Snackbar from 'material-ui/Snackbar';

const styles = {
  paper: {
    margin: '5px',
    padding: '5px',
    width: 'auto',
    height: '120px',
    borderRadius: '2px'
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: '4px',
    background: '#eee'
  }
}

export default class SkillSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      skill: '',
      showDialog: false,
      disableAdd: true,
      snackbarOpen: false,
			snackbarMessage: ''
    };

    this.addNewSkill = this.addNewSkill.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onSkillChange = this.onSkillChange.bind(this);
    this.onSkillAddition = this.onSkillAddition.bind(this);
    this.hideSnackbar = this.hideSnackbar.bind(this);
    this.openSnackbar = this.openSnackbar.bind(this);
  }

  addNewSkill(skill) {
    this.props.addNewSkill(skill);
    this.setState({skill: '', disableSave: true});
  }

  onSkillChange(e) {
    this.setState({skill: e.target.value, skillsErrorText: ''});
  }

  onSkillAddition() {
    let th = this;
    if (this.state.skill.trim().length != 0) {
      let skill = this.state.skill;
      let skills = this.props.skills;
      let duplicateFound = skills.some(function(s) {
        return s.toLowerCase() == skill.toLowerCase()
      });
      if(duplicateFound) {
        th.openSnackbar('Duplicate Skill! Try adding a new skill.');
      } else {
        th.addNewSkill(skill);
      }
    }
  }

  onOpen() {
    this.setState({showDialog: true});
  }

  onClose() {
    this.setState({showDialog: false})
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

  render() {
    let th = this;
    let title = 'SKILLSET';
      return (
        <div>
          <FloatingActionButton mini={true} style={app.fab2} onTouchTap={this.onOpen}>
            <SkillsIcon/>
          </FloatingActionButton>
          <Dialog
            bodyStyle={dialog.body}
            title={title}
            titleStyle={dialog.title}
            open={this.state.showDialog}
            autoScrollBodyContent={true}
            onRequestClose={this.onClose}>
            <div>
              <div style={dialog.box100}>
                <TextField hintText="Skill Name" floatingLabelText="Skill Name" value={this.state.skill} onChange={this.onSkillChange}/>
                <IconButton tooltip="Add Skill" onClick={this.onSkillAddition}>
                  <AddIcon/>
                </IconButton>
                <Paper style={styles.paper} zDepth={1}>
                  <div style={styles.wrapper}>
                    {
                      this.props.skills.map(function(skill, index) {
                        return (
                          <Chip style={styles.chip} key={index}>
                            <span>{skill}</span>
                          </Chip>
                        )
                      })
                   }
                  </div>
                </Paper>
              </div>
            </div>
          </Dialog>
          <Snackbar
  					open={this.state.snackbarOpen}
  					message={this.state.snackbarMessage}
  					autoHideDuration={4000}
  					onRequestClose={th.hideSnackbar}
  			 />
        </div>
      )
    }
  }
