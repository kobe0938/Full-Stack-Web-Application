import React from 'react';
import {
  Typography, Card, CardMedia, CardContent, Container, List, Divider, ListItem, CardActionArea
} from '@material-ui/core';
import './userComments.css';
import {Link} from "react-router-dom";
// import fetchModel from "../../lib/fetchModelData";
import axios from 'axios';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserComments extends React.Component {
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
            this.props.changeTopBar(
                "Comments of ", `${this.findUserById(this.props.match.params.userId).first_name} ${this.findUserById(this.props.match.params.userId).last_name}`
            );
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

  // could change to string to color later, along with avater
  static randomColor = () => {
    let hex = Math.floor(Math.random() * 0xFFFFFF);
    let color = "#" + hex.toString(16);
  
    return color;
  };

  // given a userId, find all the comments(an array) this user authored
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

  // given a comment, find the photo this comment belongs to(because comment do not has its parent information in monodb for the sake of saving space)
  photoOfGivenCommentByCurrentUser = (curCommentId) => {
    for (let i = 0; i < this.state.photos.length; i++) {
      for (let j = 0; j < this.state.photos[i].photosOfACertainUser.length; j++) {
        for (let k = 0; k < this.state.photos[i].photosOfACertainUser[j].comments.length; k++) {
          if (this.state.photos[i].photosOfACertainUser[j].comments[k]._id === curCommentId) {
            return this.state.photos[i].photosOfACertainUser[j];
          }
        }
      }
    }
    return null;
  };

  // given a userId, find that user object in this.state.users Note: if we want to find all photos of a certain user given the userId, use the first(as key) and second para of this.state.photos
  findUserById = (curUserID) => {
      for (let i = 0; i < this.state.users.length; i++) {
          if (this.state.users[i]._id === curUserID) {
              return this.state.users[i];
          }
      }
      return null;
  };

  render() {
    return this.state.users !== undefined ? (
        this.state.photos.length === this.state.users.length ? (
        <Container>
          <Typography variant="h5">{`All comments authored by user: ${this.findUserById(this.props.match.params.userId).first_name} ${this.findUserById(this.props.match.params.userId).last_name}`}</Typography>
          <List component="nav">
            <Divider />
            {
              this.commentsOfCurrentUserArray(this.props.match.params.userId).map((comment) => {
                return (
                  <div key={comment._id}>
                    <ListItem>
                        <Card sx={{ maxWidth: 345 }} component={Link} to = {`/advanced/photos/${this.photoOfGivenCommentByCurrentUser(comment._id).user_id}/photoId/${this.photoOfGivenCommentByCurrentUser(comment._id)._id}`}>
                            <CardActionArea>
                                <CardMedia
                                // className='qwe'
                                component="img"
                                height="200"
                                alt="green iguana"
                                image={`/images/${this.photoOfGivenCommentByCurrentUser(comment._id).file_name}`}
                                />
                                <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Comment
                                </Typography>
                                <Typography variant="body2" color="secondary">
                                    {comment.comment}
                                </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </ListItem>
                    <Divider />
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

export default UserComments;
