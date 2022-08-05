import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid, FormGroup, Checkbox, FormControlLabel, Input, Button, FormLabel
} from '@material-ui/core';
// import {
//   TimerRounded
// } from '@material-ui/icons';
import './TopBar.css';
import {Link} from "react-router-dom";
// import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topBarInfo: this.props.topBarInfo,
      version: undefined,
      permissionSelected: false,
      exUsers: [],
      selectedUsers: {}
    };
  }

  componentDidMount () {
    let promise = axios.get("/test/info");
    promise.then(
      (response) => {
        this.setState({ version: response.data.version });
      }
    ).catch((error) => {
      console.log(error.response);
    });

    axios
    .get("/exUsers/list")
    .then(response => {
      this.setState({ exUsers: response.data });
    })
    .catch(err => console.log(err.response));
  }

  componentDidUpdate (prevProps) {
    if (prevProps.topBarInfo !== this.props.topBarInfo) {
      this.setState({topBarInfo: this.props.topBarInfo});
    }
    if (prevProps.loggedInUser !== this.props.loggedInUser) {
      axios.get("/exUsers/list")
        .then(response => {
          this.setState({
            exUsers: response.data,
            permissionSelected: false,
            selectedUsers: {}
          });
        })
        .catch(err => console.log(err.response));
    }
  }

  handleUploadButtonClicked = (event) => {
    let self = this;
    event.preventDefault();
    if (!this.state.permissionSelected) {
      this.setState({
        selectedUsers: this.state.exUsers.map(({ _id }) => {
          return { [_id]: true };
        })
      });
    }
    if (this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      domForm.append("usersPermissed", JSON.stringify(this.state.selectedUsers));

      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      console.log(this.state.permissionSelected);
      console.log(this.state.selectedUsers);
      console.log(this.state.exUsers);
      
      axios.post("/photos/new", domForm).then((response) => {
        console.log(response);
        self.setState({
          selectedUsers: {},
          permissionSelected: false
        });
        window.location.href=`#/photos/${this.props.loggedInUser._id}`;
      })
      .catch((error) => console.log(`${error}`));
    }
  };
  
  handlePermissionSelected = () => {
    this.setState({ permissionSelected: !this.state.permissionSelected });
  };

  changeUserPermission = id => () => {
    let { selectedUsers } = this.state;
    selectedUsers[id] = !selectedUsers[id];
    this.setState({ selectedUsers });
  };

  handleLabelChange = (event, checked) => {
    this.props.handleLabelChange(checked);
  };

  handleLogOut = () => {
    axios.post("/admin/logout", {})
      .then(() => {
        this.props.changeLoggedInUser(undefined);
      })
      .catch(error => console.log(error.response));
  };


  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
        {/* <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}> */}
              {this.props.loggedInUser !== undefined ? 
              (
              <Grid container>
                <Grid item xs = {2}>
                  <Typography variant="h5" color="inherit">
                    <Link to = {"/"}>
                    Xiaokun Chen
                    </Link>
                  </Typography>
                </Grid>
                <Grid item xs = {2}>
                  <Typography variant="h5" color="inherit">
                  version: {this.state.version}
                    <FormGroup>
                      <FormControlLabel control={<Checkbox checked = {this.props.advancedFeatures}/>} label="advanced features" onChange={this.handleLabelChange} />

                    </FormGroup>
                  </Typography>
                </Grid>

                <Grid item xs = {2}>
                  <Link className='link' to="/favorites">
                    <Button
                      onClick={() => this.props.changeTopBar("My Favorites", "")}
                      variant="contained"
                    >
                      Favorites
                    </Button>
                  </Link>

                  <Button
                      onClick={() => this.handleLogOut()}
                      variant="contained"
                    >
                      Log out
                  </Button>
                </Grid>

                <Grid item xs = {4}>
                    <form onSubmit={this.handleUploadButtonClicked}>
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          ref={domFileRef => {
                            this.uploadInput = domFileRef;
                          }}
                        />
                      </label>
                      <FormGroup>
                          <FormControlLabel
                            control={(
                              <Checkbox
                              onChange={this.handlePermissionSelected}
                              checked={this.state.permissionSelected}
                              />
                            )}
                            label="Choose permissions"
                          />
                      </FormGroup>
                        {this.state.permissionSelected && (
                          <div>
                            <FormLabel>
                            Check permissions below.
                            </FormLabel>
                            <FormGroup>
                              {this.state.exUsers &&
                                this.state.exUsers.map(userObj => {
                                  //userObj has _id, first_name, last_name
                                  return (
                                    <FormControlLabel
                                      key={userObj._id}
                                      control={(
                                        <Checkbox
                                          checked={
                                            this.state.selectedUsers[userObj._id]
                                          }
                                          onChange={this.changeUserPermission(
                                            userObj._id
                                          )}
                                          value={userObj._id}
                                        />
                                      )}
                                      label={`${userObj.first_name} ${userObj.last_name}`}
                                    />
                                  );
                                })}
                            </FormGroup>
                          </div>
                        )}

                      <Input color="primary" type="submit" value="Post" />
                    </form>
                </Grid>

                <Grid item xs = {2} align = "right">
                  <Typography variant="h5" color="inherit">
                    {this.state.topBarInfo}
                  </Typography>
                </Grid>
              </Grid>
              ) : (
              <Grid container>
                <Grid item xs = {12} align = "left">
                  <Typography variant="h5" color="inherit">
                    Xiaokun Chen Photo Sharing App.
                  </Typography>
                </Grid>
              </Grid>
              )}
        {/* </Box> */}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
