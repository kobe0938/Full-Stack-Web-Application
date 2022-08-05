import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import './styles/main.css';


// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import UserComments from './components/userComments/userComments';
import LoginRegister from './components/loginRegister/LoginRegister';
import Favorites from "./components/favorites/Favorites";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topBarInfo: "Home",
      advancedFeatures: false,
      loggedInUser: undefined
    };
  }

  changeTopBar = (description, fullname) => {
    this.setState({topBarInfo: description + fullname});
  };

  handleLabelChange = (checked) => {
    // console.log(checked);
    this.setState({advancedFeatures: checked});
  };

  changeLoggedInUser = (user) => {
    this.setState({loggedInUser: user});
  };

  render() {
    return (
      <HashRouter>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar topBarInfo = {this.state.topBarInfo} changeTopBar = {this.changeTopBar} handleLabelChange = {this.handleLabelChange} advancedFeatures = {this.state.advancedFeatures} changeLoggedInUser = {this.changeLoggedInUser} loggedInUser = {this.state.loggedInUser}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="cs142-main-grid-item">
            {this.state.loggedInUser === undefined ? <div/> : <UserList />}
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
              {this.state.loggedInUser !== undefined ? (
              <Route exact path="/"
                render={() => {
                  if (this.state.topBarInfo !== "Home") {
                    this.setState({ topBarInfo : "Home"});
                  }
                }}
              /> 
              ) : ( <Redirect exact path="/" to="/login-register" />) }

              <Route exact path="/login-register"
                render={(props) => <LoginRegister {...props} changeLoggedInUser={this.changeLoggedInUser} />}
              />
              {this.state.loggedInUser !== undefined ? (
                  <Route path="/users/:userId"
                  render={ props => <UserDetail {...props} changeTopBar = {this.changeTopBar} topBarInfo = {this.state.topBarInfo}/> }
                />
              ) : (<Redirect path="/users/:userId" to="/login-register" /> )}
              {this.state.loggedInUser !== undefined ? (
                  <Route path="/favorites"
                  render={props => <Favorites {...props}/> }
                />
              ) : (<Redirect path="/users/:userId" to="/login-register" /> )}
              {this.state.loggedInUser !== undefined ? (
              <Route path="/photos/:userId"
                render ={ props => <UserPhotos {...props} changeTopBar = {this.changeTopBar} advancedFeatures = {this.state.advancedFeatures} topBarInfo = {this.state.topBarInfo} loggedInUserId = {this.state.loggedInUser._id}/> }
              />
              ) : (<Redirect path="/photos/:userId" to="/login-register" /> )}

              {this.state.loggedInUser !== undefined ? (
              <Route path="/advanced/photos/:userId/photoId/:photoId"
                render ={ props => <UserPhotos {...props} changeTopBar = {this.changeTopBar} advancedFeatures = {this.state.advancedFeatures} topBarInfo = {this.state.topBarInfo} loggedInUserId = {this.state.loggedInUser._id}/> }
              />
              ) : (<Redirect path="/advanced/photos/:userId/photoId/:photoId" to="/login-register" />)}

              {this.state.loggedInUser !== undefined ? (
              <Route path="/commentsAuthoredByUser/:userId"
                render ={ props => <UserComments {...props} changeTopBar = {this.changeTopBar}/> }
              />
              ) : (<Redirect path="/commentsAuthoredByUser/:userId" to="/login-register" />)}

              {this.state.loggedInUser !== undefined ? (
              <Route path="/users" component={UserList}  />
              ) : (<Redirect path="/users" to="/login-register" />)}
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
