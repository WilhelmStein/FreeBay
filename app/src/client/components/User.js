import React, { Component, useState } from "react";

import {
    Avatar,
    Card,
    CardHeader,
    Grid,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Button,
    Tab,
    Tabs,
    AppBar,
    IconButton
} from "@material-ui/core";

import Pagination from 'material-ui-flat-pagination';

import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import Rating from "@material-ui/lab/Rating";
import Axios from "axios";
import autoBind from "auto-bind";
import { withRouter } from 'react-router-dom'


import ValidatedIcon from "@material-ui/icons/VerifiedUser";
import InvalidatedIcon from "@material-ui/icons/Clear";
import SettingsIcon from "@material-ui/icons/Settings";
import "../style/User.scss";

class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: null,
            loggedAsTargetUser: false,
            dialogOpen: false
        };

        autoBind(this);
    }

    componentDidMount() {

        if(this.props.user && this.props.user.Username === this.props.username)
        {
            Axios.post(`/api/getUser`, {
                username: this.props.user.Username,
                password: this.props.user.Password
            })
            .then(res => {

                if(res.data.error)
                {
                    console.log(res.data.message);
                    return;
                }

                this.setState({ userData: res.data.data }, () => {
                    if (
                        this.state.userData != null &&
                        this.props.user != null &&
                        this.state.userData.Username === this.props.user.Username
                    ) {
                        this.setState({ loggedAsTargetUser: true });
                    } else this.setState({ loggedAsTargetUser: false });
                });
            })
            .catch(err => console.log(err));
        }
        else
        {
            Axios.get(`/api/publicUserDetails?username=${this.props.username}`)
            .then(res => {

                if(res.data.error)
                {
                    console.log(res.data.message);
                    return;
                }

                this.setState({ userData: res.data.data }, () => {
                    if (
                        this.state.userData != null &&
                        this.props.user != null &&
                        this.state.userData.Username === this.props.user.Username
                    ) {
                        this.setState({ loggedAsTargetUser: true });
                    } else this.setState({ loggedAsTargetUser: false });
                });
            })
            .catch(err => console.log(err));
        }

    }

    componentWillReceiveProps(nextProps) {
        //console.log(nextProps)
        if(nextProps.user && nextProps.user.Username === nextProps.username)
        {
            Axios.post(`/api/getUser`, {
                username: nextProps.user.Username,
                password: nextProps.user.Password
            })
            .then(res => {

                if(res.data.error)
                {
                    console.log(res.data.message);
                    return;
                }

                this.setState({ userData: res.data.data }, () => {
                    if (
                        this.state.userData != null &&
                        this.props.user != null &&
                        this.state.userData.Username === this.props.user.Username
                    ) {
                        this.setState({ loggedAsTargetUser: true });
                    } else this.setState({ loggedAsTargetUser: false });
                });
            })
            .catch(err => console.log(err));
        }
        else
        {
            Axios.get(`/api/publicUserDetails?username=${nextProps.username}`)
            .then(res => {

                if(res.data.error)
                {
                    console.log(res.data.message);
                    return;
                }

                this.setState({ userData: res.data.data }, () => {
                    if (
                        this.state.userData != null &&
                        this.props.user != null &&
                        this.state.userData.Username === this.props.user.Username
                    ) {
                        this.setState({ loggedAsTargetUser: true });
                    } else this.setState({ loggedAsTargetUser: false });
                });
            })
            .catch(err => console.log(err));
        }
    }

    toggleDialog(e) {
        this.setState({ dialogOpen: !this.state.dialogOpen });
    }

    render() {
        if (this.state.userData == null) {
            return <h1>{`Error: User ${this.props.username} not found.`}</h1>;
        }

        return (

                <div>
                    <AccountForm
                        open={this.state.dialogOpen}
                        toggleDialog={this.toggleDialog}
                        userData={this.state.userData}
                        updateHandler={this.props.updateHandler}
                        history={this.props.history}
                    /> 
                        
                    <AccountMenu
                        userData={this.state.userData}
                        loggedAsTargetUser={this.state.loggedAsTargetUser}
                        toggleDialog={this.toggleDialog}
                        history={this.props.history}
                    />
                </div>

        );
    }
}

function AccountDetails(props) {
    const rating = Math.round(((props.userData.Seller_Rating * 5.0) / 100.0) * 2) / 2;

    return (
        // <Grid item xs={3}>
            <Card className="UserData">
                <CardMedia
                    className="UserMedia"
                    //    image={props.userData.Image}
                    image="http://placehold.jp/150x150.png"
                />

                <CardContent>
                    <Grid container className="UserDetails">
                        <Grid item xs={4}>
                            <Typography className="Title">Username: </Typography>
                        </Grid>

                        <Grid item xs={8}>
                            <Typography className="Data">
                                {props.userData.Username}
                            </Typography>
                        </Grid>

                        <Grid item xs={4}>
                            <Typography className="Title">Rating: </Typography>
                        </Grid>

                        <Grid item xs={8}>
                            <Rating
                                display="inline"
                                value={rating}
                                precision={0.5}
                                readOnly
                            />
                        </Grid>

                        {props.loggedAsTargetUser ? (
                            <Grid container>
                                <Grid item xs={4}>
                                    <Typography className="Title">E-Mail: </Typography>
                                </Grid>

                                <Grid item xs={8}>
                                    <Typography className="Data">
                                        {props.userData.Email}
                                    </Typography>
                                </Grid>

                                <Grid item xs={4}>
                                    <Typography className="Title">Name: </Typography>
                                </Grid>

                                <Grid item xs={8}>
                                    <Typography className="Data">
                                        {props.userData.Name}
                                    </Typography>
                                </Grid>

                                <Grid item xs={4}>
                                    <Typography className="Title">Surname: </Typography>
                                </Grid>

                                <Grid item xs={8}>
                                    <Typography className="Data">
                                        {props.userData.Surname}
                                    </Typography>
                                </Grid>

                                <Grid item xs={4}>
                                    <Typography className="Title">Phone: </Typography>
                                </Grid>

                                <Grid item xs={8}>
                                    <Typography className="Data">
                                        {props.userData.Phone}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    {props.userData.Validated ? (
                                        <Box className="Validated">
                                            Validated
											<ValidatedIcon style={{ marginLeft: "5px" }} />
                                        </Box>
                                    ) : (
                                            <Box className="Invalidated">
                                                Not Validated
											<InvalidatedIcon style={{ marginLeft: "5px" }} />
                                            </Box>
                                        )}
                                </Grid>

                                <Grid item xs={8} style={{ marginTop: "20px" }}>
                                    <Button variant="contained" onClick={props.toggleDialog}>
                                        Change Settings
										<SettingsIcon style={{ marginLeft: "5px" }} />
                                    </Button>
                                </Grid>
                            </Grid>
                        ) : (
                                ""
                            )}
                    </Grid>
                </CardContent>
            </Card>
        // </Grid>
    );
}

class AccountForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newUsername: this.props.userData.Username,
            oldPassword: "",
            newPassword: "",
            newPassword2: "",
            newEmail: this.props.userData.Email,
            newPhone: this.props.userData.Phone,
            newName: this.props.userData.Name,
            newSurname: this.props.userData.Surname,
            newCountry: this.props.userData.Country,
            newCity: this.props.userData.City,
            newStreet: this.props.userData.Street,
            newStreetNumber: this.props.userData.Number,
            newZipCode: this.props.userData.ZipCode,
            emailError: undefined,
            passwordError: undefined,
            password2Error: undefined,
            usernameError: undefined,
            noChangeError: undefined
        };
        autoBind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            newUsername: nextProps.userData.Username,
            oldPassword: "",
            newPassword: "",
            newPassword2: "",
            newEmail: nextProps.userData.Email,
            newPhone: nextProps.userData.Phone,
            newName: nextProps.userData.Name,
            newSurname: nextProps.userData.Surname,
            newCountry: nextProps.userData.Country,
            newCity: nextProps.userData.City,
            newStreet: nextProps.userData.Street,
            newStreetNumber: nextProps.userData.Number,
            newZipCode: nextProps.userData.ZipCode,
            emailError: undefined,
            passwordError: undefined,
            password2Error: undefined,
            usernameError: undefined,
            noChangeError: undefined
        });
    }

    clearState() {
        this.setState({
            newUsername: this.props.userData.Username,
            oldPassword: "",
            newPassword: "",
            newPassword2: "",
            newEmail: this.props.userData.Email,
            newPhone: this.props.userData.Phone,
            newName: this.props.userData.Name,
            newSurname: this.props.userData.Surname,
            newCountry: this.props.userData.Country,
            newCity: this.props.userData.City,
            newStreet: this.props.userData.Street,
            newStreetNumber: this.props.userData.Number,
            newZipCode: this.props.userData.ZipCode,
            emailError: undefined,
            passwordError: undefined,
            password2Error: undefined,
            usernameError: undefined,
            noChangeError: undefined
        });
    }

    _empty(name) {
        return this.state[name] === "";
    }

    blur(event, name) {
        if (
            name === "newPassword" ||
            name === "newPassword2" ||
            name === "oldPassword"
        )
            return this.confirmNewPasswordCheck();
        if (name === "newUsername") return this.usernameCheck();
        if (name === "newEmail") return this.emailCheck();
    }

    change(event, name) {
        let newState = this.state;
        newState[name] = event.target.value;

        this.setState(newState);
    }

    confirmNewPasswordCheck() {
        //console.log(this.state)
        if (this.state.newPassword !== this.state.newPassword2) {
            this.setState({
                passwordError: "Passwords do not match.",
                password2Error: "Passwords do not match."
            });
        } else {
            this.setState({
                passwordError: undefined,
                password2Error: undefined
            });
        }
    }

    usernameCheck() {
        if (this.state.newUsername === this.props.userData.Username) {
            this.setState({
                usernameError: undefined
            });

            return;
        }

        Axios.post("/api/username", {
            username: this.state.newUsername
        })
            .then(res => {
                if (res.data.error) {
                    console.error(res.data.message);
                    return;
                }

                if (res.data.data.length > 0) {
                    this.setState({
                        usernameError: "Username already exists."
                    });
                } else {
                    this.setState({
                        usernameError: undefined
                    });
                }
            })
            .catch(err => console.error(err));
    }

    emailCheck() {
        if (this.state.newEmail === this.props.userData.Email) {
            this.setState({
                emailError: undefined
            });

            return;
        }

        Axios.post("/api/email", {
            email: this.state.newEmail
        })
            .then(res => {
                if (res.data.error) {
                    console.error(res.data.message);
                    return;
                }

                if (res.data.data.length > 0) {
                    this.setState({
                        emailError: "E-mail already exists."
                    });
                } else {
                    this.setState({
                        emailError: undefined
                    });
                }
            })
            .catch(err => console.error(err));
    }

    noChangesCheck()
    {
        if (this.state.newUsername === this.props.userData.Username &&
            this.state.newPassword === "" &&
            this.state.newPassword2 === "" &&
            this.state.newEmail === this.props.userData.Email &&
            this.state.newPhone === this.props.userData.Phone &&
            this.state.newName === this.props.userData.Name &&
            this.state.newSurname === this.props.userData.Surname &&
            this.state.newCountry === this.props.userData.Country &&
            this.state.newCity === this.props.userData.City &&
            this.state.newStreet === this.props.userData.Street &&
            this.state.newStreetNumber === this.props.userData.Number &&
            this.state.newZipCode === this.props.userData.ZipCode)
        {
            return true;
        }
        else
        {
            return false;
        }
            
    }

    cancel() {
        this.clearState();
        this.props.toggleDialog();
    }

    submit() {
        // console.log(this.state)
        if(this.noChangesCheck())
        {
            alert("No changes to submit.");
            return;
        }

        if (
            this.state.usernameError ||
            this.state.passwordError ||
            this.state.password2Error ||
            this.state.emailError
        ) {
            alert("Please fix all errors.");
            return;
        }

        if (
            this._empty("newUsername") ||
            this._empty("newEmail") ||
            this._empty("newName") ||
            this._empty("newSurname") ||
            this._empty("newPhone") ||
            this._empty("newStreet") ||
            this._empty("newStreetNumber") ||
            this._empty("newZipCode") ||
            this._empty("newCity") ||
            this._empty("newCountry")
        ) {
            alert("Please fill all fields.");
            return;
        }
        
        Axios.post("/api/updateUser", {
            oldUsername: this.props.userData.Username,
            username: (this.state.newUsername === this.props.userData.Username) ? undefined : this.state.newUsername,
            oldPassword: (this._empty("newPassword") && this._empty("newPassword2") && this._empty("oldPassword")) ? this.props.userData.Password : this.state.oldPassword,
            password: (this.state.newPassword === this.props.userData.Password || this.state.newPassword === "") ? undefined : this.state.newPassword,
            email: (this.state.newEmail === this.props.userData.Email) ? undefined : this.state.newEmail,
            name: (this.state.newName === this.props.userData.Name) ? undefined : this.state.newName,
            surname: (this.state.newSurname === this.props.userData.Surname) ? undefined : this.state.newSurname,
            phone: (this.state.newPhone === this.props.userData.Phone) ? undefined : this.state.newPhone,
            street: (this.state.newStreet === this.props.userData.Street) ? undefined : this.state.newStreet,
            number: (this.state.newStreetNumber === this.props.userData.Number) ? undefined : this.state.newStreetNumber,
            zipcode: (this.state.newZipCode === this.props.userData.ZipCode) ? undefined : this.state.newZipCode,
            city: (this.state.newCity === this.props.userData.City) ? undefined : this.state.newCity,
            country: (this.state.newCountry === this.props.userData.Country) ? undefined : this.state.newCountry
        })
            .then(res => {
                if (res.data.error) {
                    if(res.data.data === false)
                    {
                        this.setState({ oldpasswordError: "Old password does not match."});
                        alert(res.data.message);
                    }

                    return;
                }
                this.setState({ oldpasswordError: undefined}, () => {
                    let username, password;
                    username = (this.state.newUsername !== "") ? (this.state.newUsername) : (this.props.userData.Username);
                    password = (this.state.newPassword !== this.props.userData.Password &&
                                this.state.newPassword !== "")
                                ?
                                (this.state.newPassword) : (this.props.userData.Password);

                    this.props.updateHandler(username, password)
                    .then(() => {
                        this.props.toggleDialog();  
                        this.props.history.push(`/user/${username}`);
                    });
                    
                });
            })
            .catch(err => console.error(err));
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={() => {
                    this.clearState();
                    this.props.toggleDialog();
                }}
                className="UserForm"
                maxWidth="md"
            >
                <DialogContent>
                    <Grid container spacing={6}>
                        <Grid item xs={6}>
                            <h6>Update General Details</h6>

                            <TextField
                                className="DialogText"
                                margin="dense"
                                id="Username"
                                label="Username"
                                error={this.state.usernameError !== undefined}
                                placeholder="e.g. thisismyusername77"
                                defaultValue={this.props.userData.Username}
                                onChange={e => {
                                    this.change(e, "newUsername");
                                }}
                                onBlur={e => this.blur(e, "newUsername")}
                            />

                            <TextField
                                className="DialogText"
                                margin="dense"
                                id="Email"
                                label="Email Address"
                                error={this.state.emailError !== undefined}
                                type="email"
                                placeholder="e.g. example@domain.com"
                                defaultValue={this.props.userData.Email}
                                onChange={e => {
                                    this.change(e, "newEmail");
                                }}
                                onBlur={e => this.blur(e, "newEmail")}
                                fullWidth
                            />

                            <div style={{ marginTop: "95px" }}>
                                <h6>Change Client Details</h6>

                                <TextField
                                    className="DialogText"
                                    margin="dense"
                                    id="Name"
                                    label="Name"
                                    placeholder="e.g. Josiah"
                                    defaultValue={this.props.userData.Name}
                                    onChange={e => {
                                        this.change(e, "newName");
                                    }}
                                    fullWidth
                                />

                                <TextField
                                    className="DialogText"
                                    margin="dense"
                                    id="Surname"
                                    label="Surname"
                                    placeholder="e.g. Trelawny"
                                    defaultValue={this.props.userData.Surname}
                                    onChange={e => {
                                        this.change(e, "newSurname");
                                    }}
                                    fullWidth
                                />

                                <TextField
                                    className="DialogText"
                                    margin="dense"
                                    id="phone"
                                    label="Phone"
                                    type="tel"
                                    placeholder="e.g. 1234567890"
                                    defaultValue={this.props.userData.Phone}
                                    onChange={e => {
                                        this.change(e, "newPhone");
                                    }}
                                    fullWidth
                                />
                            </div>
                        </Grid>

                        <Grid item xs={6}>
                            <h6>Change Password</h6>

                            <TextField
                                className="DialogText"
                                margin="dense"
                                id="OldPassword"
                                label="Old Password"
                                error={this.state.oldpasswordError !== undefined}
                                type="password"
                                placeholder="e.g. aXsdfFrtewWcv1#@!11f"
                                onChange={e => {
                                    this.change(e, "oldPassword");
                                }}
                                fullWidth
                            />

                            <TextField
                                className="DialogText"
                                margin="dense"
                                id="NewPassword"
                                label="New Password"
                                error={this.state.passwordError !== undefined}
                                type="password"
                                placeholder="e.g. aXsdfFrtewWcv1#@!11f"
                                onChange={e => {
                                    this.change(e, "newPassword");
                                }}
                                onBlur={e => this.blur(e, "newPassword")}
                                fullWidth
                            />

                            <TextField
                                className="DialogText"
                                margin="dense"
                                id="NewPassword2"
                                label="New Password"
                                error={this.state.password2Error !== undefined}
                                type="password"
                                placeholder="e.g. aXsdfFrtewWcv1#@!11f"
                                onChange={e => {
                                    this.change(e, "newPassword2");
                                }}
                                onBlur={e => this.blur(e, "newPassword2")}
                                fullWidth
                            />

                            <h6>Change Address</h6>

                            <TextField
                                className="DialogText"
                                margin="dense"
                                id="Country"
                                label="Country"
                                placeholder="e.g. United Kingdom"
                                defaultValue={this.props.userData.Country}
                                onChange={e => {
                                    this.change(e, "newCountry");
                                }}
                                fullWidth
                            />

                            <TextField
                                className="DialogText"
                                margin="dense"
                                id="City"
                                label="City"
                                placeholder="e.g. London"
                                defaultValue={this.props.userData.City}
                                onChange={e => {
                                    this.change(e, "newCity");
                                }}
                                fullWidth
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <TextField
                                        className="DialogText"
                                        margin="dense"
                                        id="StreetName"
                                        label="Street Name"
                                        placeholder="e.g. Baker St"
                                        defaultValue={this.props.userData.Street}
                                        onChange={e => {
                                            this.change(e, "newStreet");
                                        }}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={4}>
                                    <TextField
                                        className="DialogText"
                                        margin="dense"
                                        id="StreetNumber"
                                        label="Street Number"
                                        type="number"
                                        placeholder="e.g. 15"
                                        defaultValue={this.props.userData.Number}
                                        onChange={e => {
                                            this.change(e, "newStreetNumber");
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                className="DialogText"
                                margin="dense"
                                id="Zipcode"
                                label="Zip Code"
                                placeholder="e.g. 16561"
                                defaultValue={this.props.userData.ZipCode}
                                onChange={e => {
                                    this.change(e, "newZipCode");
                                }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={this.cancel}
                        color="primary"
                        className="DialogButton"
                    >
                        Cancel
					</Button>
                    <Button
                        onClick={this.submit}
                        color="primary"
                        className="DialogButton"
                    >
                        Submit
					</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

class AccountMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabValue: 0,
            tabs: [{ label: "Active Auctions" }],
            currentAuctions: [],
            pastAuctions: [],
            watchedAuctions: [],
            messages: [],
            resultsPerPage: 10,
            offset: 2
        };
        //console.log(props.loggedAsTargetUser);
        autoBind(this);
    }

    /*componentDidMount()
    {
        // let diff = (new Date(auction.Ends).getTime() - new Date().getTime()) / 1000;
        Axios.get(`/api/userAuctions?username=${this.props.userData.Username}`)
        .then( (res) => {
            
            if(res.data.err)
            {
                console.error(res.data.message)
                return;
            }
            
            this.setState({ currentAuctions: res.data.data });
        })
        .catch((err) => console.log(err));

        Axios.post(`/api/userWatchedAuctions`, {username: this.props.userData.Username, password: this.props.userData.Password})
        .then((res) => {
            if(res.data.err)
            {
                console.error(res.data.message)
                return;
            }

            this.setState({ watchedAuctions: res.data.data });
        })
    } */

    componentWillReceiveProps(nextProps) {

        Axios.get(`/api/userAuctions?username=${this.props.userData.Username}`)
        .then( (res) => {
            
            if(res.data.err)
            {
                console.error(res.data.message)
                return;
            }
        

            let currentAuctions = res.data.data.filter((auction) => {
                let diff = new Date(auction.Ends) - new Date();
                return (diff > 0);
            });

            let pastAuctions = res.data.data.filter((auction) => {
                let diff = new Date(auction.Ends) - new Date();
                return (diff <= 0);
            })

            this.setState({ currentAuctions: currentAuctions, pastAuctions: pastAuctions });
        })
        .catch((err) => console.log(err));

        if (nextProps.loggedAsTargetUser) {

            Axios.post(`/api/userWatchedAuctions`, {username: this.props.userData.Username, password: this.props.userData.Password})
            .then((res) => {
                if(res.data.err)
                {
                    console.error(res.data.message)
                    return;
                }

                this.setState({ watchedAuctions: res.data.data });
            })
            .catch((err) => console.log(err));

            this.setState({
                tabs: [
                    { label: "Active Auctions" },
                    { label: "Past Auctions" },
                    { label: "Watched Auctions" },
                    { label: "Messages" }
                ]
            });
        }
        else
        {
            this.setState({
                tabs: [ 
                    { label: "Active Auctions" },
                    { label: "Past Auctions" }
                ]
            });
        }
    }

    changeTabValue(event, newValue) {
        this.setState({ tabValue: newValue });
    }

    render() {
        //console.log(this.state);
        const rating = Math.round(((this.props.userData.Seller_Rating * 5.0) / 100.0) * 2) / 2;
        let currentPage = null;
        switch(this.state.tabValue)
        {
            case 0: currentPage = <AuctionGrid target={this.state.currentAuctions} history={this.props.history}/>; break;
            case 1: currentPage = <AuctionGrid target={this.state.pastAuctions} history={this.props.history}/>; break;
            case 2: currentPage = <AuctionGrid target={this.state.watchedAuctions} history={this.props.history}/>; break;
            default: currentPage = <div/>; break;
        }


        return (
            // <Grid item className="UserMenu" xs={9} /*sm={3}*/>
            <Card raised className="UserMenu">
                <CardHeader
                    avatar={
                        <Avatar aria-label="User" className="UserAvatar">
                            {this.props.userData.Username[0]}
                        </Avatar>
                    }

                    title={
                            <div>
                                Username: {this.props.userData.Username}
                                {
                                    (this.props.loggedAsTargetUser)
                                    ?
                                    (
                                        <IconButton aria-label="settings" className="SettingsIcon" onClick={this.props.toggleDialog}>
                                            <SettingsIcon/>
                                        </IconButton>
                                    )
                                    :
                                    ("")
                                }
                            </div>
                          }
                    subheader={
                                <Grid container spacing={1}>
                                    <Grid item>
                                        <Typography className="Title">Rating: </Typography>
                                    </Grid>

                                    <Grid item>
                                        <Rating
                                            display="inline"
                                            value={rating}
                                            precision={0.5}
                                            readOnly
                                        />
                                    </Grid>
                                </Grid>
                                }
                />
                <CardContent>
                    <AppBar position="static">
                        <Tabs value={this.state.tabValue} onChange={this.changeTabValue}>
                            {this.state.tabs.map(tab => (
                                <Tab key={tab.label} label={tab.label} className="Tab" />
                            ))}
                        </Tabs>
                    </AppBar>

                    {currentPage}
                </CardContent>
            </Card>
            // </Grid>
        );
    }
}

function AuctionGrid(props) {

    let [offset, setOffset] = useState(0);
    //let [resultsPerPage, setResultsPerPage] = useState(6);
    const resultsPerPage = 6;

    let content = props.target.slice(offset, offset + resultsPerPage).map((auction, index) => {

        let ended = (new Date(auction.Ends) - new Date() <= 0);

        return <Grid item key={index}>
                    <Card onClick={() => props.history.push(`/auction/${auction.Id}`)}>
                        <Grid container className="AuctionCard">
                            <Grid item>
                                <CardMedia className="Media"
                                        //component="img"
                                        image={auction.Images && auction.Images.length ? `/api/image?path=${auction.Images[0].Path}` : "https://dummyimage.com/150x250/ffffff/4a4a4a.png&text=No+Image"}
                                        title={auction.Name}
                                />
                            </Grid>

                            <Grid item className="Details">
                                <CardContent>
                                    <Typography className="Title">{auction.Name}</Typography>
                                    {
                                        (auction.Description === "")
                                        ?
                                        (<Typography className="Description Empty">No Description.</Typography>)
                                        :
                                        (<Typography className="Description">{auction.Description}</Typography>)
                                    }               
                                </CardContent>
                            </Grid>

                            <Grid item className="Prices">
                                <CardContent>
                                    <Grid container spacing={1}>
                                        <Grid item>
                                            <Typography variant="h5" className="Title">Starting Price:</Typography>
                                        </Grid>

                                        <Grid item>
                                            <Typography variant="h4" className="Price Starting">{auction.First_Bid ? `EUR ${parseFloat(auction.First_Bid).toFixed(2)}` : "-"}</Typography>
                                        </Grid>
                                    </Grid>


                                        {
                                            (ended)
                                            ?
                                            (
                                                ""
                                            )
                                            :
                                            (
                                                <Grid container spacing={1}>
                                                    <Grid item >
                                                        <Typography variant="h5" className="Title">Current Price:</Typography>
                                                    </Grid>
                                                    <Grid item  zeroMinWidth>
                                                        <Typography className="Price Current" variant="h4">{auction.Currently ? `EUR ${parseFloat(auction.Currently).toFixed(2)}` : "-"}</Typography>
                                                    </Grid>
                                                </Grid>
                                            )
                                        }
                                    
                                    <Grid container spacing={1}>
                                        <Grid item >
                                            <Typography variant="h5" className="Title">
                                                { (ended) ? ("Bought for:") : ("Buyout Price:") }
                                            </Typography>
                                         </Grid>

                                        <Grid item >
                                            <Typography className="Price Buyout" variant="h4">{auction.Buy_Price ? `EUR ${parseFloat(auction.Buy_Price).toFixed(2)}` : "-"}</Typography>
                                        </Grid>
                                    </Grid>

                                    <Box className="Dates" mt={2}>
                                        <Typography>
                                            Started in: <span className="Started Date">{new Date(auction.Started).toLocaleString()}</span>
                                        </Typography>
                                        
                                        <Typography>
                                            {
                                                (ended)
                                                ?
                                                ("Ended:")
                                                :
                                                ("Ends in:")
                                            }
                                            <span className="Ends Date">{new Date(auction.Ends).toLocaleString()}</span>
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
    });

    return(
        <Grid item className="AuctionGrid" xs={12}>
            <Pagination
                className="Pagination"
                size='large'
                limit={resultsPerPage}
                offset={offset}
                total={props.target.length}
                onClick={(e, offset) => setOffset(offset)}
            />

            <Grid container spacing={3}>
                {content}
            </Grid>

            <Pagination
                className="Pagination"
                size='large'
                limit={resultsPerPage}
                offset={offset}
                total={props.target.length}
                onClick={(e, offset) => setOffset(offset)}
            />
        </Grid>
    );
}

export default withRouter(User);