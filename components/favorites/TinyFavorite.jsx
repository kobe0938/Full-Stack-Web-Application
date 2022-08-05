import React from "react";
import {
  Card,Dialog, CardMedia,  CardHeader, IconButton, DialogTitle, DialogContent,
} from "@material-ui/core";
import "./TinyFavorite.css";
import { Clear } from "@material-ui/icons";
const axios = require("axios").default;

class TinyFavorite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modeIsEnabled: false
    };
  }

  handleDeleteFavorite = (event) => {
    event.preventDefault();
    axios.get(`/deleteFavorite/${this.props.photo._id}`)
      .then(() => {
        this.props.refreshFavoritesCards();
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  handleCloseDialog = () => {
    this.setState({ modeIsEnabled: false });
  };

  handleOpenDialog = () => {
    this.setState({ modeIsEnabled: true });
  };

  render() {
    return (
      <div>
        <Card id="card-tiny-fav">
          <CardHeader
            id="header"
            action={(
              <IconButton onClick={
                (event) => this.handleDeleteFavorite(event)
                }>
              <Clear />
              </IconButton>
            )}
          />
          <CardMedia
            component="img"
            image={`/images/${this.props.photo.file_name}`}
            onClick={this.handleOpenDialog}
          />
        </Card>
        <Dialog
          onClose={this.handleCloseDialog}
          aria-labelledby="customized-dialog-title"
          open={this.state.modeIsEnabled}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleCloseDialog}>
            {this.props.photo.date_time}
          </DialogTitle>
          <DialogContent>
            <img
              className="image"
              src={`/images/${this.props.photo.file_name}`}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default TinyFavorite;
