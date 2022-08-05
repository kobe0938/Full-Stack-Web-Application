import React from 'react';
import {
  Divider,
  List,
  ListItem,
  Typography,
  Container,
  Button,
}
from '@material-ui/core';
import './userList.css';
import {Link} from "react-router-dom";
// import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: undefined,
      photos: []
    };
  }

  componentDidMount () {
    let tempPhotos = [];
    let promise = axios.get(`/user/list`);
    promise.then(
      (response) => {
        this.setState({users: response.data});
          this.state.users.map((user) => {
            // console.log(user);
            let newPromise = axios.get(`/photosOfUser/${user._id}`);
            newPromise.then(
              (response2) => {
                this.setState({
                  photos: [...this.state.photos, {_id: user._id, photosOfACertainUser: response2.data}]
                });
                // tempPhotos = [...tempPhotos, {_id: user._id, photosOfACertainUser: response2.data}]
                // {console.log(tempPhotos)}
                // {console.log(this.state.photos)}
              }
            ).catch((error) => {
              console.log(error.response2);
            });
            // console.log("ddd" + this.state.photos);
            return null;
          });
          this.setState({photos: tempPhotos});
      }
    ).catch((error) => {
      console.log(error.response);
    });
  }
  componentDidUpdate (prevProps) {
    if (prevProps.topBarInfo !== this.props.topBarInfo) {
      console.log("here");
      let tempPhotos = [];
      let promise = axios.get(`/user/list`);
      promise.then(
        (response) => {
          this.setState({users: response.data});
            this.state.users.map((user) => {
              // console.log(user);
              let newPromise = axios.get(`/photosOfUser/${user._id}`);
              newPromise.then(
                (response2) => {
                  this.setState({
                    photos: [...this.state.photos, {_id: user._id, photosOfACertainUser: response2.data}]
                  });
                  // tempPhotos = [...tempPhotos, {_id: user._id, photosOfACertainUser: response2.data}]
                  // {console.log(tempPhotos)}
                  // {console.log(this.state.photos)}
                }
              ).catch((error) => {
                console.log(error.response2);
              });
              // console.log("ddd" + this.state.photos);
              return null;
            });
            this.setState({photos: tempPhotos});
        }
      ).catch((error) => {
        console.log(error.response);
      });
    }
  }

  // return photo array of this user
  photosOfCurrentUserArray = (curUserID) => {
      for (let i = 0; i < this.state.photos.length; i++) {
          if (this.state.photos[i]._id === curUserID) {
            return this.state.photos[i].photosOfACertainUser;
          }
      }
      return null;
  };

  // return comments array of this user
  commentsOfCurrentUserArray = (curUserID) => {
    let commentsOfCurrentUserArray = [];
    for (let i = 0; i < this.state.photos.length; i++) {
      for (let j = 0; j < this.state.photos[i].photosOfACertainUser.length; j++) {
        for (let k = 0; k < this.state.photos[i].photosOfACertainUser[j].comments.length; k++) {
          if (this.state.photos[i].photosOfACertainUser[j].comments[k].user._id === curUserID) {
            commentsOfCurrentUserArray = [...commentsOfCurrentUserArray, this.state.photos[i].photosOfACertainUser[j].comments[k]];
          }
        }
      }
    }
    return commentsOfCurrentUserArray;
  };

  render() {
    return this.state.users !== undefined ? (
      this.state.photos.length === this.state.users.length ? (
      <Container>
        <Typography variant="h5">Users</Typography>
        <List component="nav">
          <Divider />
          {
            this.state.users.map((user) => {
              return (
                <div key={user._id}>
                  <ListItem>
                      <Button variant="text" component={Link} to = {`/users/${user._id}`} className="name">
                      {`${user.first_name} ${user.last_name}`}
                      </Button>


                      <Button size="small" variant="contained" className="photosCount" style={{backgroundColor: "green"}}>
                      {this.photosOfCurrentUserArray(user._id).length}                    
                      </Button>

                      <Button size="small" variant="contained" component={Link} to = {`/commentsAuthoredByUser/${user._id}`} className="commentsCount" style={{backgroundColor: "red"}}>
                      {this.commentsOfCurrentUserArray(user._id).length}                    
                      </Button>

                  </ListItem>
                  <Divider />
                {/* <Link to = {`/users/${user._id}`} key={user._id}>
                  <ListItem>
                    <ListItemText primary={`${user.first_name} ${user.last_name}`} />
                  </ListItem>
                  <Divider />
                </Link> */}
                </div>
              );
            })
          }
        </List>
      </Container> 
      ) : (
        <Typography variant="h5">Photos are undefined</Typography>
      )
    ):(
      <Typography variant="h5">Users are undefined</Typography>
    );
  }
}

export default UserList;
