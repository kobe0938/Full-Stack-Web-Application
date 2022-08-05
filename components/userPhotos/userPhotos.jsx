import React from 'react';
import {
  Typography, Grid, Button, Card, CardHeader, CardMedia, CardContent, Avatar
} from '@material-ui/core';
import './userPhotos.css';
import {Link} from "react-router-dom";
// import fetchModel from "../../lib/fetchModelData";
import NewComment from  './newComment';
const axios = require("axios").default;
const REGEXPR = /@\[(\S+ \S+)( )*\]\(\S+\)/g;

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
      photos: undefined,
      favorite_ids: []
      // curPhotoId: undefined
      // advancedFeatures: this.props.advancedFeatures
    };
    this.refreshPhotoAndComments = this.refreshPhotoAndComments.bind(this);
    this.refreshPhotoAndComments();

    // first have the advanced handler change the url accordingly to the checked value 
    // then check if photoID is undefined(or adv), to decide next move
    // then create a handler, if photoID is about to be undefined, then do not do anything
    // otherwise update the url, rerender the component to be the next this.state.photos[i]
  }

  componentDidMount () {
    let curUserID = this.props.match.params.userId;
    let promise = axios.get(`/user/${curUserID}`);
    promise.then(
      (response) => {
        this.setState({user: response.data});
        this.props.changeTopBar(
          "Photos of ", `${response.data.first_name} ${response.data.last_name}`
        );
      }
    ).catch((error) => {
      console.log(error.response);
    });
    
    let promise2 = axios.get(`/photosOfUser/${curUserID}`);
    promise2.then(
      (response) => {
        this.setState({photos: response.data});
      }
    ).catch((error) => {
      console.log(error.response);
    });
  }

  componentDidUpdate (prevProps) {
    // console.log(prevProps.advancedFeatures+"out "+this.props.advancedFeatures);
    // if (prevProps.advancedFeatures === undefined) {
    //   this.setState({advancedFeatures: this.props.advancedFeatures});
    //   console.log(this.state.advancedFeatures);
    // }
    if (prevProps.advancedFeatures !== this.props.advancedFeatures) {
      if (this.props.advancedFeatures === true) {
        this.props.history.push(`/advanced/photos/${this.props.match.params.userId}/photoId/${this.state.photos[0]._id}`);
      } else {
        this.props.history.push(`/photos/${this.props.match.params.userId}`);
      }
      let newUserId = this.props.match.params.userId;
      let promPhotos = axios.get(`/photosOfUser/${newUserId}`);
      promPhotos.then((response) => {
        this.setState({ photos: response.data });
      }).catch((error) => {
        console.log(error.response);
      });
    }

    if (prevProps.topBarInfo !== this.props.topBarInfo) {
      let newUserId = this.props.match.params.userId;
      let promPhotos = axios.get(`/photosOfUser/${newUserId}`);
      promPhotos.then((response) => {
        this.setState({ photos: response.data });
      }).catch((error) => {
        console.log(error.response);
      });
    }
  }

  // could change to string to color later, along with avater
  static randomColor = () => {
    let hex = Math.floor(Math.random() * 0xFFFFFF);
    let color = "#" + hex.toString(16);
  
    return color;
  };

  // call after add new comments, the best way is to refresh globally, including userlist, but did not find way to implement that
  refreshPhotoAndComments = () => {
    let newUserId = this.props.match.params.userId;
    let promPhotos = axios.get(`/photosOfUser/${newUserId}`);
    promPhotos.then((response) => {
      this.setState({ photos: response.data });
    }).catch((error) => {
      console.log(error.response);
    });

    console.log("here in the refreshPhotoAndComments");

    axios
    .get(`/getFavorites`)
    .then(response => {
      let favorite_ids = response.data.map(photo => photo._id);
      this.setState({ favorite_ids });
    })
    .catch(() => this.setState({ favorite_ids: [] }));
  };

  renderHelper = (para, portion) => {
    console.log("1" + para.liked_by);

    return (
    <Grid item xs={portion} key={para._id}>
      <Card variant="outlined">
         <CardHeader avatar={ 
           (
             <Avatar style={{
               backgroundColor: UserPhotos.randomColor()
             }} aria-label="recipe">
               {this.state.user.first_name.charAt(0)}
             </Avatar>
           )
           }
           title =  {this.state.user.first_name + this.state.user.last_name}
           subheader={"Posted time: " + para.date_time}
           >
         </CardHeader>
         <CardMedia
           component="img"
           image={`/images/${para.file_name}`}
         />
         <CardContent>
           <div>
             {para.comments !== undefined && para.comments.length > 0 ? para.comments.map((comment) => {
                 return (
                   <Grid container key={comment._id}>
                     <Grid item xs={2}>
                       <Avatar style={{
                         backgroundColor: UserPhotos.randomColor()
                       }} aria-label="recipe">
                         {comment.user.first_name.charAt(0)}
                       </Avatar>
                       <Link to={`/users/${comment.user._id}`}>
                         {`${comment.user.first_name} ${comment.user.last_name}`}
                       </Link>
                     </Grid>                          
                     <Grid item xs={9}>
                      <Typography variant="body1">
                        {comment.comment.replace(
                          REGEXPR,
                          (match, name) => {
                            return `@${name}`;
                          }
                        )}
                      </Typography>

                       {/* <Typography variant='body1'>
                         {comment.comment}
                       </ Typography> */}
                       <Typography variant="body2" color="textSecondary">
                         {comment.date_time}
                       </Typography>
                     </Grid>
                   </Grid>
                 );
               }) 
               : (
               <Typography variant="body1" color="textSecondary">
                 No comments yet.
               </Typography>
               )}
              {console.log("2" + para.liked_by)}
               <NewComment
                refreshPhotoAndComments = {this.refreshPhotoAndComments}
                photo={para}
                changeTopBar = {this.props.changeTopBar}
                favorited={
                  this.state.favorite_ids.indexOf(para._id) > -1
                }
                creator={this.state.user}
                liked={
                  para.liked_by.indexOf(this.props.loggedInUserId) > -1
                }
               />
           </div>
         </CardContent>
      </Card>
    </Grid>
    );
  };

  // curPhotoIdIncrementHandler = (photoId) => {
  //   if (this.findphotoIndexById(photoId) < (Object.keys(this.state.photos).length - 1)) {
  //     this.setState({curPhotoIndex: this.state.curPhotoIndex + 1});
  //   } else {
  //     alert("Areadly reach the last photo!");
  //   }
  // }

  // curPhotoIdDecrementHandler = (photoId) => {
  //   if (this.state.curPhotoIndex > 0) {
  //     this.setState({curPhotoIndex: this.state.curPhotoIndex - 1});
  //   } else {
  //     alert("Areadly reach the first photo!");
  //   }
  // }

  // return the photo index by id, no longer useful after proj6, when I could fetch certain photo by id from db
  findphotoIndexById = (photoId) => {
    for (let i=0 ; i < this.state.photos.length ; i++) {
      // could be ==?
      if (this.state.photos[i]._id === photoId) {
        // console.log(i);
        return i;
      }
    }
    return -1;
  };

  handleUpperBoundIndexById = (photoId) => {
    // should return index
    if (this.findphotoIndexById(photoId) === this.state.photos.length - 1) {
      return this.findphotoIndexById(photoId);
    } else {
      return this.findphotoIndexById(photoId) + 1;
    }
  };

  handleLowerBoundIndexById = (photoId) => {
    // should return index
    if (this.findphotoIndexById(photoId) === 0) {
      return this.findphotoIndexById(photoId);
    } else {
      return this.findphotoIndexById(photoId) - 1;
    }
  };

  render() {
    // let curPhotoIndex = 0;
    return this.state.user ? (
      <Grid container justifyContent="space-evenly" alignItems="flex-start">
        {this.state.photos ? 
          !this.props.match.params.photoId !== undefined?
            (this.props.advancedFeatures === true ?
              (
                <div className='qwe'>
                  <Button size="large" variant='contained' style={{
                    backgroundColor: UserPhotos.randomColor()
                  }}   
                  component={Link} to = {`/advanced/photos/${this.state.user._id}/photoId/${this.state.photos[this.handleLowerBoundIndexById(this.state.photos[0]._id)]._id}`}
                  >
                    Backward
                  </Button>
                  <Button size="large" variant='contained' style={{
                    backgroundColor: UserPhotos.randomColor()
                  }}   
                  component={Link} to = {`/advanced/photos/${this.state.user._id}/photoId/${this.state.photos[this.handleUpperBoundIndexById(this.state.photos[0]._id)]._id}`}
                  >
                    Forward
                  </Button>

                    {console.log("here")}
                    {console.log(this.state.photos[0])}
                    {this.renderHelper(this.state.photos[0], 12)}
                </div>
              )
                :
              this.state.photos.sort(
                (photo1, photo2) => photo2.liked_by.length - photo1.liked_by.length
              ).map((photo) => photo.users_permitted.indexOf(this.props.loggedInUserId) > -1 && (this.renderHelper(photo, 12)))
            )
          :
          (
          <div className='qwe'>
                  <Button size="large" variant='contained' style={{
                    backgroundColor: UserPhotos.randomColor()
                  }} component={Link} to = {`/advanced/photos/${this.state.user._id}/photoId/${this.state.photos[this.handleLowerBoundIndexById(this.props.match.params.photoId)]._id}`}>
                    Backward
                  </Button>
                  <Button size="large" variant='contained' style={{
                    backgroundColor: UserPhotos.randomColor()
                  }} component={Link} to = {`/advanced/photos/${this.state.user._id}/photoId/${this.state.photos[this.handleUpperBoundIndexById(this.props.match.params.photoId)]._id}`}>
                    Forward
                  </Button>
                    {console.log("line 292")}
                    {/* {let k = this.props.match.params.photoIndex} */}
                    {this.renderHelper(this.state.photos[this.findphotoIndexById(this.props.match.params.photoId)], 12)}
          </div>
          )
        : <Typography>No photos yet.</Typography>}
      </Grid>
    ) : (
        <Typography>No users yet.</Typography>
    );
  }
}

export default UserPhotos;
