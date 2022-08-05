import React from 'react';
import {
    Button, IconButton
} from '@material-ui/core';
import { MentionsInput, Mention } from "react-mentions";
import {Send, ThumbUpOutlined, FavoriteBorder, ThumbUp, Favorite} from "@material-ui/icons";
import mentionStyle from "./mentionStyle";

const axios = require("axios").default;

// must have NewComment to ensure that comment on one photo wont appear on other ones
class NewComment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newComment: "",
            liked: props.liked,
            mentionsToAdd: [],
            users: [{ id: 123, display: "drdr"}, { id: 124, display: "djreiodj"}],
        };

        this.props.refreshPhotoAndComments();
    }

    componentDidMount () {
        axios
        .get('/qwe')
        .then(response => {
          this.setState({ users: response.data });
        })
        .catch(err => {
          console.log(err.response);
        });
    }

    handleChangeInput = (stateUpdate) => {
        this.setState(stateUpdate);
    };

    addNewComment = (event, photo_id) => {
        event.preventDefault();

        axios.post(`/commentsOfPhoto/${photo_id}`, {comment: this.state.newComment, mentionsToAdd: this.state.mentionsToAdd
        })
        .then(() => {
            this.setState({ newComment: "", mentionsToAdd: []});
            this.props.refreshPhotoAndComments();
        })
        .catch(error => {
            console.log(error.response);
        });
    };

    handleFavorite = () => {
        axios
          .post(`/addToFavorites`, { photo_id: this.props.photo._id })
          .then(() => {
            this.props.refreshPhotoAndComments();
          })
          .catch(err => {
            console.log(err.response);
          });
      };

    handleLikeOrUnlike = () => {
    axios
        .post(`/likeOrUnlike/${this.props.photo._id}`, {
        like: !this.state.liked
        })
        .then(() => {
        this.setState({ liked: !this.state.liked });
        this.props.refreshPhotoAndComments();
        })
        .catch(err => console.log(err.response));
    };
    
    render() {
        return (
            <div>
                    <IconButton
                        disabled={this.props.favorited}
                        aria-label="add to favorites"
                        onClick={this.handleFavorite}
                    >
                        {this.props.favorited ? (
                        <Favorite color="secondary" />
                        ) : (
                        <FavoriteBorder />
                        )}
                    </IconButton>

                    <IconButton aria-label="like" onClick={this.handleLikeOrUnlike}>
                        {this.state.liked ? (
                        <ThumbUp color="primary" />
                        ) : (
                        <ThumbUpOutlined />
                        )}
                        {this.props.photo.liked_by.length}

                    </IconButton>
                <form onSubmit={(event) => {this.addNewComment(event, this.props.photo._id);}}>
                    {/* <TextField                     
                    required
                    fullWidth
                    label="New Comment"
                    autoFocus
                    value={this.state.newComment}
                    onChange={(event) => this.handleChangeInput({newComment: event.target.value})} > */}
                <label className="comment-input">
                  <MentionsInput
                    value={this.state.newComment}
                    onChange={(event) => this.handleChangeInput({newComment: event.target.value})}
                    allowSuggestionsAboveCursor
                    style={mentionStyle}
                    singleLine
                    className="mention-input-comment"
                  >
                    <Mention
                      trigger="@"
                      data={this.state.users}
                      displayTransform={(id, display) => `@${display}`}
                      onAdd={(id) => {
                        let mentions = this.state.mentionsToAdd;
                        mentions.push(id);
                        this.setState({ mentionsToAdd: mentions });
                      }}
                    />
                  </MentionsInput>
                </label>
                    {/* </TextField> */}
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    >
                    Add Comment
                    <Send />
                    </Button>
                </form>
            </div>
        );
    }
}

export default NewComment;
