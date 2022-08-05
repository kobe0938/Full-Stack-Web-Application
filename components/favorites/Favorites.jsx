import React from "react";
import { Typography, Grid, Divider } from "@material-ui/core";
import TinyFavorite from "./TinyFavorite";
const axios = require("axios").default;

/**
 * Define Favorites
 */
class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favoritesObjArray: []
    };
    this.refreshFavoritesCards = this.refreshFavoritesCards.bind(this);
    this.refreshFavoritesCards();
  }

  refreshFavoritesCards = () => {
    axios.get(`/getFavorites`)
      .then((response) => {
        this.setState({ favoritesObjArray: response.data });
      })
      .catch(() => this.setState({ favoritesObjArray: [] }));
  };

  render() {
    return (
      <Grid container justify="space-evenly" alignItems="flex-start">
        <Grid item xs={12}>
          <Typography variant="h4">The favorite colloection:</Typography>
          <Divider />
        </Grid>
        {this.state.favoritesObjArray.map((photo) => (
          <Grid item xs={3} key={photo.file_name}>
            <TinyFavorite refreshFavoritesCards={this.refreshFavoritesCards} photo={photo} />
          </Grid>
        ))}
      </Grid>
    );
  }
}

export default Favorites;
