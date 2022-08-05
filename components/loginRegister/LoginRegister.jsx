import React from 'react';
import {
  Grid, Typography, TextField, Avatar, Button, CssBaseline, FormControlLabel, Checkbox, Box, Container, createTheme, ThemeProvider
} from '@material-ui/core';

import {
    LockOutlined
} from '@material-ui/icons';
import './LoginRegister.css';

// import { Link } from 'react-router-dom';

import axios from 'axios';

// reference: https://mui.com/material-ui/getting-started/templates/sign-up/#

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loginErrorMessage: "",
      loginUserName: "",
      loginPassword: "",
      signupUserName: "",
      signupPassword: "",
      signupOccupation: "",
      signupVerifyPassword: "",
      signupLocation: "",
      signupDescription: "",
      signupErrorMessage: "",
      signupFirstName: "",
      signupLastName: ""
    };
  }

  handleLogin = (event) => {
    event.preventDefault();
    axios
      .post("/admin/login", {
        login_name: this.state.loginUserName,
        password: this.state.loginPassword
      })
      .then(response => {
        this.setState({ loginErrorMessage: "" });
        let user = response.data;
        this.props.changeLoggedInUser(user);
        window.location.href = `#/users/${user._id}`;
      })
      .catch(err => {
        this.setState({ loginErrorMessage: err.response.data });
      });
  };

  handleChangeInput = (stateUpdate) => {
    this.setState(stateUpdate);
  };

  handleRegister = (event) => {
    if (this.state.signupFirstName === "" || this.state.signupLastName === "" || this.state.signupUserName === "" || this.state.signupPassword === "" || this.state.signupVerifyPassword === "") {
        this.setState({signupErrorMessage: "Please fill in required field!"});
        return;
    }
    if (this.state.signupPassword !== this.state.signupVerifyPassword) {
      this.setState({signupErrorMessage: "Passwords don't match"});
      return;
    }
    event.preventDefault();
    axios
      .post("/user", {
        login_name: this.state.signupUserName,
        password: this.state.signupPassword,
        occupation: this.state.signupOccupation,
        location: this.state.signupLocation,
        description: this.state.signupDescription,
        first_name: this.state.signupFirstName,
        last_name: this.state.signupLastName
      })
      .then(response => {
        this.setState({ signupErrorMessage: "" });
        let user = response.data;
        this.props.changeLoggedInUser(user);
        window.location.href = `#/users/${user._id}`;
      })
      .catch(err => {
        this.setState({ signupErrorMessage: err.response.data });
      });
  };

  render() {
    const theme = createTheme();

    return(
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
                >
                <Avatar sx={{ m: 1 }}>
                    <LockOutlined />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Log In
                </Typography>
                <Typography variant="body1" color="error">
                    {this.state.loginErrorMessage}
                </Typography>
                <Box component="form" noValidate onSubmit={this.handleLogin} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                            // name="User Name"
                            required
                            fullWidth
                            // id="User Name"
                            label="User Name"
                            autoFocus
                            value={this.state.loginUserName}
                            onChange={(event) => this.handleChangeInput({loginUserName: event.target.value})} 
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                            required
                            fullWidth
                            // name="password"
                            label="Password"
                            type="password"
                            // id="password"
                            autoComplete="new-password"
                            value={this.state.loginPassword}
                            onChange={(event) => this.handleChangeInput({loginPassword: event.target.value})}
                            />
                        </Grid>
                    </Grid>
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    >
                    Log In
                    </Button>
                    <Grid container justifyContent="flex-end">
                    </Grid>
                </Box>
                </Box>
                <Typography variant="body2" color="primary" align="center">
                    {'Copyright © '}
                    {'Xiaokun Chen '}
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Container>

            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
                >
                <Avatar sx={{ m: 1 }}>
                    <LockOutlined />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <Typography variant="body1" color="error">
                    {this.state.signupErrorMessage}
                </Typography>
                <Box component="form" noValidate onSubmit={this.handleRegister} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                        autoComplete="given-name"
                        // name="firstName"
                        required
                        fullWidth
                        // id="firstName"
                        label="First Name"
                        autoFocus
                        value={this.state.signupFirstName}
                        onChange={(event) => this.handleChangeInput({signupFirstName: event.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                        required
                        fullWidth
                        // id="lastName"
                        label="Last Name"
                        // name="lastName"
                        autoComplete="family-name"
                        value={this.state.signupLastName}
                        onChange={(event) => this.handleChangeInput({signupLastName: event.target.value})} 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        // name="User Name"
                        required
                        fullWidth
                        // id="User Name"
                        label="User Name"
                        autoFocus
                        value={this.state.signupUserName}
                        onChange={(event) => this.handleChangeInput({signupUserName: event.target.value})} 
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                        required
                        fullWidth
                        // name="password"
                        label="Password"
                        type="password"
                        // id="password"
                        autoComplete="new-password"
                        value={this.state.signupPassword}
                        onChange={(event) => this.handleChangeInput({signupPassword: event.target.value})}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                        required
                        fullWidth
                        // name="password"
                        label="Verify Password"
                        type="password"
                        // id="Vpassword"
                        autoComplete="new-password"
                        error={
                            this.state.signupPassword !==
                            this.state.signupVerifyPassword
                        }
                        value={this.state.signupVerifyPassword}
                        onChange={(event) => this.handleChangeInput({signupVerifyPassword: event.target.value})}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                        // name="signupOccupation"
                        fullWidth
                        // id="signupOccupation"
                        label="signupOccupation"
                        autoFocus
                        value={this.state.signupOccupation}
                        onChange={(event) => this.handleChangeInput({signupOccupation: event.target.value})} 
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                        // name="signupLocation"
                        fullWidth
                        // id="signupLocation"
                        label="signupLocation"
                        autoFocus
                        value={this.state.signupLocation}
                        onChange={(event) => this.handleChangeInput({signupLocation: event.target.value})} 
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                        // name="signupDescription"
                        fullWidth
                        // id="signupDescription"
                        label="signupDescription"
                        autoFocus
                        value={this.state.signupDescription}
                        onChange={(event) => this.handleChangeInput({signupDescription: event.target.value})} 
                        />
                    </Grid>


                    <Grid item xs={12}>
                        <FormControlLabel
                        control={<Checkbox value="allowExtraEmails" color="primary" />}
                        label="I understand all terms for using photo sharing app."
                        />
                    </Grid>
                    </Grid>
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    >
                    Sign Up
                    </Button>
                    <Grid container justifyContent="flex-end">
                    </Grid>
                </Box>
                </Box>
                <Typography variant="body2" color="primary" align="center">
                    {'Copyright © '}
                    {'Xiaokun Chen '}
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Container>
        </ThemeProvider>
    );
  }
}

export default LoginRegister;
