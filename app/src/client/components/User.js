import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';

import { Card, Grid, CardMedia, CardContent, Typography, Box,  Button,
         Tab, Tabs, AppBar, FormControl, FormLabel, InputLabel, Input, FormHelperText } from '@material-ui/core';

import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import Rating from '@material-ui/lab/Rating'
import Axios from 'axios';
import autoBind from 'auto-bind';

import ValidatedIcon from '@material-ui/icons/VerifiedUser';
import InvalidatedIcon from '@material-ui/icons/Clear'
import SettingsIcon from '@material-ui/icons/Settings';
import '../style/User.scss';

export default class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: props.history,
            userData: null,
            tabValue: 0,
            canChangeSettings: false,
            dialogOpen: false
        };

        autoBind(this);
    }

    componentDidMount() {
        Axios.get(`/api/user?username=${this.props.username}`)
            .then(res => {
                this.setState({ userData: res.data.data }, () => {
                    if (this.state.userData != null && this.props.user != null && this.state.userData.Username === this.props.user.Username) {
                        this.setState({ canChangeSettings: true });
                    }
                    else
                        this.setState({ canChangeSettings: false });
                });
            });
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.userData != null && nextProps.user != null && this.state.userData.Username === nextProps.user.Username) {
            this.setState({ canChangeSettings: true });
        }
        else
            this.setState({ canChangeSettings: false });
    }

    changeTab(e, newValue) {
        this.setState({ tabValue: newValue });
    }

    toggleDialog(e) {
        this.setState({ dialogOpen: !this.state.dialogOpen });
    }


    render() {
        if (this.state.userData == null) {
            return <h1>{`Error: User ${this.props.username} not found.`}</h1>;
        }

        return (
            <Grid container
                direction="row"
                justify="flex-start"
                className="UserGrid"
            >

                <AccountForm open={this.state.dialogOpen}
                             toggleDialog={this.toggleDialog}
                             userData={this.state.userData}/>

                <AccountDetails userData={this.state.userData}
                    canChangeSettings={this.state.canChangeSettings}
                    toggleDialog={this.toggleDialog} />

                <Grid item className="UserMenu" xs={9}>
                    <Grid item className="UserTabs" xs={12}>
                        <AppBar position="static" color="default">
                            <Tabs value={this.state.tabValue} onChange={this.changeTab}>
                                <Tab label="Auctions" className="Tab" />
                            </Tabs>
                        </AppBar>
                    </Grid>

                    <Grid item container className="" xs={12}>
                        <Grid item xs={3}>

                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

function AccountDetails(props) {

    const rating = Math.round((props.userData.Seller_Rating * 5.0) / 100.0 * 2) / 2;

    return (
        <Grid item xs={3}>
            <Card className="UserData">
                <CardMedia className="UserMedia"
                    //    image={props.userData.Image}
                    image='https://imgplaceholder.com/420x320'
                />

                <CardContent>
                    <Grid container className="UserDetails">
                        <Grid item xs={4}>
                            <Typography className="Title" >Username: </Typography>
                        </Grid>

                        <Grid item xs={8}>
                            <Typography className="Data">{props.userData.Username}</Typography>
                        </Grid>

                        <Grid item xs={4}>
                            <Typography className="Title" >Rating: </Typography>
                        </Grid>

                        <Grid item xs={8}>
                            <Rating display="inline" value={rating} precision={0.5} readOnly />
                        </Grid>

                        {
                            (props.canChangeSettings)
                                ?
                                <Grid container>

                                    <Grid item xs={4}>
                                        <Typography className="Title" >E-Mail: </Typography>
                                    </Grid>

                                    <Grid item xs={8}>
                                        <Typography className="Data">{props.userData.Email}</Typography>
                                    </Grid>

                                    <Grid item xs={4}>
                                        <Typography className="Title">Name: </Typography>
                                    </Grid>

                                    <Grid item xs={8}>
                                        <Typography className="Data">{props.userData.Name}</Typography>
                                    </Grid>


                                    <Grid item xs={4}>
                                        <Typography className="Title">Surname: </Typography>
                                    </Grid>

                                    <Grid item xs={8}>
                                        <Typography className="Data">{props.userData.Surname}</Typography>
                                    </Grid>


                                    <Grid item xs={4}>
                                        <Typography className="Title">Phone: </Typography>
                                    </Grid>

                                    <Grid item xs={8}>
                                        <Typography className="Data">{props.userData.Phone}</Typography>
                                    </Grid>


                                    <Grid item xs={12}>

                                        {
                                            (props.userData.Validated)
                                                ?
                                                <Box className="Validated" >
                                                    Validated
                                                <ValidatedIcon style={{ marginLeft: '5px' }} />
                                                </Box>
                                                :
                                                <Box className="Invalidated" >
                                                    Not Validated
                                                <InvalidatedIcon style={{ marginLeft: '5px' }} />
                                                </Box>

                                        }

                                    </Grid>


                                    <Grid item xs={8} style={{ marginTop: '20px' }}>
                                        <Button variant="contained" onClick={props.toggleDialog}>
                                            Change Settings
                                                <SettingsIcon style={{ marginLeft: '5px' }} />
                                        </Button>
                                    </Grid>

                                </Grid>

                                :
                                ""
                        }
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    );
}


 class AccountForm extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            newUsername: "",
            oldPassword: "",
            newPassword: "",
            newPassword2: "",
            newEmail: "",
            newPhone: "",
            newName: "",
            newSurname: "",

        };

        autoBind(this);
    }

    cancel()
    {
        this.props.toggleDialog();
    }

    submit()
    {
        this.props.toggleDialog();
    }


    hUsernameChange(event)
    {
        this.setState({newUsername: event.target.value});
    }

    hEmailChange(event)
    {
        this.setState({newEmail: event.target.value});
    }

    hOldPasswordChange(event)
    {
        this.setState({oldPassword: event.target.value});
    }
    
    render()
    {
        return(
            <Dialog open={this.props.open} onClose={this.props.toggleDialog} className="UserForm">
                <DialogTitle id="form-dialog-title">Change Settings</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Here you may update your user settings.
                    </DialogContentText>
                    <Grid container spacing={2}>

                        <Grid item xs={6}>

                            <DialogTitle>Change </DialogTitle>

                            <TextField
								className="DialogText"
                                margin="dense"
                                id="Username"
                                label="Username"
                                placeholder="e.g. thisismyusername77"
                                defaultValue={this.props.userData.Username}
                                onChange={this.hUsernameChange}
                                fullWidth
                            />
                        
                            <TextField
								className="DialogText"
                                margin="dense"
                                id="Email"
                                label="Email Address"
                                type="email"
                                placeholder="e.g. example@domain.com"
                                defaultValue={this.props.userData.Email}
                                onChange={this.hEmailChange}
                                fullWidth
                            />
                        
                            <TextField
								className="DialogText"
                                margin="dense"
                                id="OldPassword"
                                label="Old Password"
                                type="password"
                                placeholder="e.g. aXsdfFrtewWcv1#@!11f"
                                onChange={this.hOldPasswordChange}
                                fullWidth
                            />
                        
                            <TextField
								className="DialogText"
                                margin="dense"
                                id="NewPassword"
                                label="New Password"
                                type="password"
                                placeholder="e.g. aXsdfFrtewWcv1#@!11f"
                                onChange={this.hNewPasswordChange}
                                fullWidth
                            />
                       
                            <TextField
								className="DialogText"
                            margin="dense"
                            id="NewPassword2"
                            label="New Password"
                            type="password"
                            placeholder="e.g. aXsdfFrtewWcv1#@!11f"
                            onChange={this.hNewPassword2Change}
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
                                onChange={this.hPhoneChange}
                                fullWidth
                            />

                        </Grid>

                        <Grid item xs={6}>

                            <TextField
								className="DialogText"
                                margin="dense"
                                id="Name"
                                label="Name"
                                placeholder="e.g. Josiah"
                                defaultValue={this.props.userData.Name}
                                onChange={this.hNameChange}
                                fullWidth
                            />
                        
                            <TextField
								className="DialogText"
                                margin="dense"
                                id="Surname"
                                label="Surname"
                                placeholder="e.g. Trelawny"
                                defaultValue={this.props.userData.Surname}
                                onChange={this.hSurnameChange}
                                fullWidth
                            />

                            <TextField
								className="DialogText"
                                margin="dense"
                                id="Country"
                                label="Country"
                                placeholder="e.g. United Kingdom"
                                defaultValue={this.props.userData.Country}
                                onChange={this.hCountryChange}
                                fullWidth
                            />

                            <TextField
								className="DialogText"
                                margin="dense"
                                id="City"
                                label="City"
                                placeholder="e.g. London"
                                defaultValue={this.props.userData.City}
                                onChange={this.hCityChange}
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
                                        onChange={this.hStreetChange}
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
                                        onChange={this.hStreetNumberChange}
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
                                onChange={this.hZipCodeChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={this.cancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.submit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}