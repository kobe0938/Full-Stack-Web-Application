import React from "react";
import { Card, CardMedia, CardContent, Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import "./Mention.css";
const axios = require("axios").default;

/**
 * Mention
 * props: photoId
 */
class Mention extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photo: undefined
    };
    axios.get(`/photo/${this.props.photo_id}`)
      .then(response => {
        this.setState({ photo: response.data });
      })
      .catch(err => {
        console.log(err.response);
      });
  }

  render() {
    return this.state.photo ? (
      <Card id="outer-card">
        <CardContent>
            <Button variant="contained">
            <Link to={`/users/${this.state.photo.photo_owner_id}`}>
                {`${this.state.photo.photo_owner_first_name} ${this.state.photo.photo_owner_last_name}`}
            </Link>
            </Button>
        </CardContent>
        <Link to={`/photos/${this.state.photo.photo_owner_id}`}>
          <CardMedia
            id="inner-photo"
            width="30"
            image={`/images/${this.state.photo.file_name}`}
            component="img"
          >
          </CardMedia>
        </Link>
      </Card>
    ) : null;
  }
}
export default Mention;
