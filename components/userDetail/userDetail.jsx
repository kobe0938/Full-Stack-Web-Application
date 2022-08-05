import React from 'react';
import {
  Typography, Button, Card, CardHeader, CardContent, CardActions, Box, Avatar
} from '@material-ui/core';
import './userDetail.css';
import {Link} from "react-router-dom";
// import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';
import Mention from "./Mention";
// import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
// import LoadingButton from '@mui/lab/LoadingButton';


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined
    };
  }

  componentDidMount () {
    let curUserID = this.props.match.params.userId;
    let promise = axios.get(`/user/${curUserID}`);
    promise.then(
      (response) => {
        this.setState({user: response.data});
        this.props.changeTopBar(
          "", `${response.data.first_name} ${response.data.last_name}`
        );
      }
    ).catch((error) => {
      console.log(error.response);
    });
  }

  componentDidUpdate () {
    let curUserID = this.props.match.params.userId;
    if (this.state.user._id !== curUserID) {
      let promise = axios.get(`/user/${curUserID}`);
      promise.then(
        (response) => {
          this.setState({user: response.data});
          this.props.changeTopBar(
            "", `${response.data.first_name} ${response.data.last_name}`
          );
        }
      );
    }
  }

  static randomColor = () => {
    let hex = Math.floor(Math.random() * 0xFFFFFF);
    let color = "#" + hex.toString(16);
    return color;
  };

  render() {
    return this.state.user !== undefined ? (
      <Box sx={{ minWidth: 275 }}>
      <Card variant="outlined">
        <CardHeader avatar={
          (
            <Avatar style={{
              backgroundColor: UserDetail.randomColor()
            }} aria-label="recipe">
              {this.state.user.first_name.charAt(0)}
            </Avatar>
            )
          }
          title={this.state.user.first_name + this.state.user.last_name}
          >
        </CardHeader>
        <CardContent>
          <Typography variant="h4" gutterBottom>
          {`"${this.state.user.description}"`} <br />
          </Typography>
          <Typography variant="h5" component="div">
          Location: {this.state.user.location} <br />
          </Typography>
          <Typography sx={{ mb: 1.5 }}>
          Occupation: {this.state.user.occupation}
          </Typography>

          <Typography variant="h3">You are mentioned in:</Typography>
          <br />

          {this.state.user.mentioned.length > 0 ? (
            this.state.user.mentioned.map((photo_id, k) => {
              return <Mention photo_id={photo_id} key={photo_id + k}/>;
            })
          ) : (
            <Typography variant="h4">Nowhere</Typography>
          )}
        </CardContent>
        <CardActions>
          <Button size="large" variant='contained' style={{
              backgroundColor: UserDetail.randomColor()
            }} component={Link} to={`/photos/${this.state.user._id}`}>
              Photos
          </Button>
        </CardActions>
      </Card>
      </Box>
    ) : (
      <Typography>Xiaokun Chen Photo Sharing App</Typography>
    );
  }
}

export default UserDetail;
