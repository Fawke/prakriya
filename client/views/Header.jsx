import React from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import Drawer from 'material-ui/Drawer';
import {Card, CardHeader, CardMedia, CardTitle} from 'material-ui/Card';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Badge from 'material-ui/Badge';
import Dialog from 'material-ui/Dialog';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import LogoutIcon from 'material-ui/svg-icons/action/exit-to-app';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import ChangePasswordIcon from 'material-ui/svg-icons/action/lock';
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle';
import ChangePassword from '../components/changePassword/index.jsx';
import UpdateProfilePic from '../components/updateProfilePic/index.jsx';
import {List, ListItem} from 'material-ui/List';
import {Link} from 'react-router';
import Request from 'superagent';
import ProfilePicIcon from 'material-ui/svg-icons/image/portrait';

const styles = {
  title: {
    cursor: 'pointer',
  },
  header: {
		zIndex: 2,
		fontFamily: 'sans-serif',
		backgroundColor: 'rgb(0, 188, 212)',
		color: '#fff',
		position: 'fixed',
		left: 0,
		top: 0,
    height: '40px',
    width: '100%',
	},
  userMenu: {
    backgroundColor: '#C6D8D3',
    width: '100%',
    fontWeight: 'bold'
  },
  badge: {
    width: '20px',
    height: '20px',
    backgroundColor: '#990000',
    color: '#ffffff',
    top: '5px',
    right: '5px'
  },
  brief: {
		marginTop: '70px',
		fontSize: '16px'
	},
	body: {
		textAlign: 'center',
		fontFamily: 'sans-serif'
	},
	customContent: {
	  width: '400px',
	  maxWidth: 'none'
	}
};

export default class Header extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
      openChangePasswordDialog: false,
      openProfilePicDialog: false,
			openDrawer: false,
			actionMenu: '',
			actions: [],
			routes: [],
      user: {
        name: '',
        username: ''
      },
      notifications: [],
      imageURL: "../assets/images/avt-default.jpg"
		}

		this.logout = this.logout.bind(this);
    this.toggleDialog = this.toggleDialog.bind(this)
		this.getActions = this.getActions.bind(this);
    this.getProfilePic = this.getProfilePic.bind(this);
		this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
		this.handleDrawerClose = this.handleDrawerClose.bind(this);
		this.openDashboard = this.openDashboard.bind(this);
    this.getNotifications = this.getNotifications.bind(this);
    this.dropNotification = this.dropNotification.bind(this);
    this.updateProfilePic = this.updateProfilePic.bind(this);
	}

  componentWillMount() {
		if(localStorage.getItem('token')) {
			this.getActions()
      this.getProfilePic(this.props.user.username)
      this.getNotifications(this.props.user.username)
		}
    let th = this
    let socket = io()
    socket.on('show notification', function(data) {
      if(data.to === th.props.useremail) {
        let notifications = th.state.notifications
        notifications.push(data.notification)
        th.setState({
          notifications: notifications
        })
      }
    })
	}

  getProfilePic(username) {
  	let th = this;
  	Request
  		.get(`/dashboard/getimage`)
  		.set({'Authorization': localStorage.getItem('token')})
      .query({filename: username})
  		.end(function(err, res) {
  			if(err)
  	    	console.log(err);
  	    else {
  	    	if(res.text) {
  		    	th.setState({
  		    		imageURL: res.text
  		    	})
  	    	}
  	    }
  		})
  }

  updateProfilePic(newImageURL) {
    this.setState({
      imageURL: newImageURL
    })
  }

  getNotifications(username) {
    let th = this
    Request
      .get(`/dashboard/notifications?username=${username}`)
      .set({'Authorization': localStorage.getItem('token')})
      .end(function(err, res){
        console.log('Notifications recieved from server: ', res.body.notifications)
        th.setState({
          notifications: res.body.notifications
        })
      })
  }

  dropNotification(index) {
    let th = this
    console.log('dropNotification: ', index)
    let notifications = th.state.notifications
    Request
      .post('/dashboard/deletenotification')
      .set({'Authorization': localStorage.getItem('token')})
      .send({to: th.props.user.email, message: notifications[index]})
      .end(function(err, res){
        console.log('Notification pushed to server', res)
      })
    notifications.splice(index, 1)
    th.setState({
      notifications: notifications
    })
  }

	getActions() {
		let th = this
		Request
			.get('/dashboard/user')
			.set({'Authorization': localStorage.getItem('token')})
			.end(function(err, res){

				let actions = res.body.actions.sort();
				let routes = actions.map(function(item) {
					return item.replace(/\s/g,'').toLowerCase()
				});
				th.setState({
					actions: actions,
					routes: routes,
          user: {
            name: res.body.name,
            username: res.body.username
          }
				})
			});
	}

	logout() {
    let th = this
    Request
      .post('/dashboard/lastlogin')
      .set({'Authorization': localStorage.getItem('token')})
      .send({'lastLogin': localStorage.getItem('lastLogin')})
      .end(function(err, res){
        if(err) {
          console.log('Error in lastLogin', err)
          throw err;
        }
        else {
          localStorage.removeItem('token')
          localStorage.removeItem('lastLogin')
          th.context.router.push('/')
        }
      });
	}

	handleDrawerToggle() {
		this.setState({
			openDrawer: !this.state.openDrawer
		})
	}

	handleDrawerClose() {
		this.setState({
			openDrawer: false
		})
	}

	openDashboard() {
		this.context.router.push('/app')
	}

  toggleDialog(dialogType) {
    let th = this;
    if(dialogType == 'ChangePassword') {
      th.setState({
        openChangePasswordDialog: !this.state.openChangePasswordDialog
      });
    } else if(dialogType == 'ProfilePic') {
      th.setState({
        openProfilePicDialog: !this.state.openProfilePicDialog
      });
    }
  }

	render() {
		let th = this
		return(
			<div style={styles.header}>
				<Drawer
		      docked={false}
		      width={250}
		      open={this.state.openDrawer}
		      onRequestChange={(openDrawer) => this.setState({openDrawer})}
          containerStyle={{backgroundColor: '#292A2C'}}
          >
          <Card>
             <CardMedia
              overlay={
                <CardHeader
                  subtitle={this.state.user.username}
                  title={this.state.user.name}
					        avatar={this.state.imageURL}
					      />
              }
             >
                 <img src={this.state.imageURL} style={{width: '100%', border: '2px solid black', height: 250}}/>
             </CardMedia>
          </Card>
		      {
		      	localStorage.getItem('token') &&
		      	this.state.actions.map(function(action, key) {
		      		return (
		      			<Link to={th.state.routes[key]} key={key} style={{textDecoration: 'none'}} >
					      	<MenuItem
                    primaryText={action}
                    style={{color: 'white'}}
                    onTouchTap={th.handleDrawerClose}
                   />
				      	</Link>
				      )
		      	})
		      }
	      </Drawer>
				<AppBar
	        title={<span style={styles.title}>Prakriya</span>}
	        onTitleTouchTap={th.openDashboard}
	        onLeftIconButtonTouchTap={th.handleDrawerToggle}
	        iconElementRight={
            <div>
              <Badge
                badgeContent={th.state.notifications.length}
                badgeStyle={styles.badge}
                className={'badgeParentVisible'}
              >
    	        	<IconMenu
                  menuStyle={styles.userMenu}
    					    iconButtonElement={<IconButton><NotificationsIcon color={'rgba(255, 255, 255, 0.87)'}/></IconButton>}
    					    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
    					  >
                  {
                    <List>
                      {
                        th.state.notifications.length < 1 ?
                        <ListItem
                          primaryText='No new notifications found'
                          key='-1'
                          style={{textAlign: 'center', color: '#757575'}}
                        /> :
                        th.state.notifications.map(function(message, index) {
                          return (
                            <ListItem
                              primaryText={message.split('|')[0]}
                              key={index}
                              rightIcon={
                                <div onClick={(event)=>{th.dropNotification(index)}}>
                                  <CancelIcon />
                                </div>
                              }
                            />
                          )
                        })
                      }
                    </List>
                  }
    					  </IconMenu>
              </Badge>
  	        	<IconMenu
                menuStyle={styles.userMenu}
  					    iconButtonElement={
  					      <IconButton><ActionAccountCircle  color={'rgba(255, 255, 255, 0.87)'}/></IconButton>
  					    }
  					    anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
  					  >
                <List>
                  <ListItem primaryText="Update Profile Pic" onClick={()=>th.toggleDialog('ProfilePic')}  leftIcon={<ProfilePicIcon />} style={{color: '#757575'}}/>
                  <ListItem primaryText="Change Password" onClick={()=>th.toggleDialog('ChangePassword')}  leftIcon={<ChangePasswordIcon />} style={{color: '#757575'}}/>
                  <ListItem primaryText="Log Out" onClick={th.logout} leftIcon={<LogoutIcon />} style={{color: '#757575'}}/>
                </List>
  					  </IconMenu>
            </div>
          }
	      />

        <Dialog
          contentStyle={styles.customContent}
          open={th.state.openChangePasswordDialog}
          onRequestClose={()=>th.toggleDialog('ChangePassword')}
        >
          <ChangePassword username={this.props.user.username} handleClose={()=>th.toggleDialog('ChangePassword')}/>
        </Dialog>

        <Dialog
          contentStyle={styles.customContent}
          open={th.state.openProfilePicDialog}
          onRequestClose={()=>th.toggleDialog('ProfilePic')}
        >
          <UpdateProfilePic
            username={this.props.user.username}
            currentImage={this.state.imageURL}
            handleClose={()=>th.toggleDialog('ProfilePic')}
            handleUpdate={th.updateProfilePic}/>
        </Dialog>
      </div>
		)
	}
}

Header.contextTypes = {
  router: PropTypes.object.isRequired
};
