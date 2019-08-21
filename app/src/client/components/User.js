import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Grid, CardMedia, CardContent, Typography, Box, Tab, Tabs, AppBar, Button} from '@material-ui/core';
import Rating from '@material-ui/lab/Rating'
import Axios from 'axios';
import autoBind from 'auto-bind';

import ValidatedIcon from '@material-ui/icons/VerifiedUser';
import InvalidatedIcon from '@material-ui/icons/Clear'
import SettingsIcon from '@material-ui/icons/Settings';
import '../style/User.scss';

export default class User extends Component
{
    constructor(props)
    {
        super(props);
        this.state={
            history: props.history,
            userData: null,
            tabValue: 0,
            canChangeSettings: false
        };
       
        autoBind(this);
    }

    componentDidMount()
    {
        Axios.get(`/api/user?username=${this.props.username}`)
        .then(res => {
            this.setState({userData: res.data.data[0]}, () => {
                if(this.state.userData != null && this.props.user != null && this.state.userData.Username == this.props.user.Username)
                {
                    this.setState({canChangeSettings: true});
                }
                else
                    this.setState({canChangeSettings: false});
            });
        });
    }
    
    componentWillReceiveProps(nextProps)
    {
        if(this.state.userData != null && nextProps.user != null && this.state.userData.Username == nextProps.user.Username)
        {
            this.setState({canChangeSettings: true});
        }
        else
            this.setState({canChangeSettings: false});
    }

    changeTab(e, newValue)
    {
        this.setState({tabValue: newValue});
    }

    changeSettings(e)
    {
        if(this.state.changingSettings == false)
        {
            this.setState({changingSettings: true});
        }
        else
        {
            Axios.post('/api/updateUser')
            .then( res => {

                this.setState({changingSettings: false});
            });
        }
    }

    render()
    {
        if(this.state.userData == null)
        {
            return <h1>{`Error: User ${this.props.username} not found.`}</h1>;
        }

        const rating = Math.round((this.state.userData.Seller_Rating * 5.0) / 100.0 * 2) / 2;
        console.log(this.state.canChangeSettings)
        return(
            <Grid container
                  direction = "row"
                  justify = "flex-start"
                  spacing={8}
                  className="UserGrid"
            >
                <Grid item className="UserData" xs={3}>
                    <Card>
                        <CardMedia className="UserMedia"
                                //    image={this.state.userData.Image}
                                image='https://imgplaceholder.com/420x320'
                        />

                        <CardContent>
                            <Grid container className="UserDetails">
                                <Grid item xs={4}>
                                    <Typography className="Title" variant="h5">Username: </Typography>
                                </Grid>

                                <Grid item xs={8}>
                                    <Typography className="Data" variant="h4">{this.state.userData.Username}</Typography>
                                </Grid>

                                <Grid item xs={4}>
                                    <Typography className="Title" variant="h5">E-Mail: </Typography>
                                </Grid>

                                <Grid item xs={8}>
                                    <Typography className="Data" variant="h4">{this.state.userData.Email}</Typography>
                                </Grid>

                                <Grid item xs={4}>
                                    <Typography className="Title" variant="h5">Rating: </Typography>
                                </Grid>

                                <Grid item xs={8}>
                                <Rating display="inline" value={rating} precision={0.5} readOnly />
                                </Grid>
                                
                                {
                                    (this.state.canChangeSettings)
                                    ?
                                    <Grid container>

                                        <Grid item xs={4}>
                                            <Typography className="Title" variant="h5">Name: </Typography>
                                        </Grid>

                                        <Grid item xs={8}>
                                            <Typography className="Data" variant="h4">{this.state.userData.Name}</Typography>
                                        </Grid>


                                        <Grid item xs={4}>
                                            <Typography className="Title" variant="h5">Surname: </Typography>
                                        </Grid>

                                        <Grid item xs={8}>
                                            <Typography className="Data" variant="h4">{this.state.userData.Surname}</Typography>
                                        </Grid>


                                        <Grid item xs={4}>
                                            <Typography className="Title" variant="h5">Phone: </Typography>
                                        </Grid>

                                        <Grid item xs={8}>
                                            <Typography className="Data" variant="h4">{this.state.userData.Phone}</Typography>
                                        </Grid>


                                        <Grid item xs={12}>
                                            
                                        {
                                            (this.state.userData.Validated)
                                            ?
                                            <Box className="Validated" variant="h5">
                                                Validated
                                                <ValidatedIcon style={{marginLeft: '5px'}}/>
                                            </Box>
                                            :
                                            <Box className="Invalidated" variant="h5">
                                                Not Validated
                                                <InvalidatedIcon style={{marginLeft: '5px'}}/>
                                            </Box>

                                        }
                                            
                                        </Grid>


                                        <Grid item xs={8} style={{marginTop: '20px'}}>
                                            <Button variant="contained" onClick={this.changeSettings}>
                                                Change Settings
                                                <SettingsIcon style={{marginLeft: '5px'}}/>
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

                <Grid item className="UserMenu" xs={9}>
                    <Grid item className="UserTabs" xs={12}>
                        <AppBar position="static" color="default">
                            <Tabs value={this.state.tabValue} onChange={this.changeTab}>
                                <Tab label="Auctions" className="Tab"/>
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