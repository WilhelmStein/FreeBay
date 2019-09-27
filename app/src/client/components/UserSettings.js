import React, {Component} from 'react';
import autoBind from 'auto-bind';
import Axios from 'axios';

import { Dialog, DialogContent, Grid, TextField, DialogActions, Button} from '@material-ui/core';

export default class UserDetails extends Component {
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
                                fullWidth
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
                                label="Confirm Password"
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